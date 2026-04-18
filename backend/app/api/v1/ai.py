from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os

from app.core.database import get_db
from app.models.product import Product

router = APIRouter(prefix="/ai", tags=["AI"])


# ── Request / Response Schemas ────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str          # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _search_products(query: str, db: Session, limit: int = 5) -> list[Product]:
    """Return up to `limit` products relevant to the user query."""
    words = [w.strip() for w in query.lower().split() if len(w.strip()) > 2]
    results: list[Product] = []

    for kw in words[:3]:
        found = (
            db.query(Product)
            .filter(Product.name.ilike(f"%{kw}%"))
            .limit(3)
            .all()
        )
        for p in found:
            if p not in results:
                results.append(p)

    if not results:
        # Fall back to a sample of available products
        results = db.query(Product).filter(Product.stock > 0).limit(limit).all()

    return results[:limit]


def _build_system_prompt(products: list[Product]) -> str:
    lines = []
    for p in products:
        cat = p.category.name if p.category else "Electronics"
        stock_str = f"{p.stock} in stock" if p.stock > 0 else "out of stock"
        lines.append(f"• {p.name} — ${float(p.price):.2f} ({cat}, {stock_str})")

    catalog_block = "\n".join(lines) if lines else "No products currently available."

    return (
        "You are Nova AI, the friendly shopping assistant for Nova Store — a premium electronics retailer.\n"
        "Your job is to help customers find the right product, answer catalog questions, and guide purchases.\n\n"
        "Rules:\n"
        "- Be warm, concise, and helpful — replies must stay under 120 words.\n"
        "- Recommend specific products (name + price) whenever relevant.\n"
        "- For account/order questions, direct the customer to their account page.\n"
        "- Never make up products or prices that aren't in the catalog below.\n"
        "- If the question is completely unrelated to shopping, politely redirect.\n\n"
        f"Current catalog context:\n{catalog_block}"
    )


def _rule_based_reply(message: str, products: list[Product]) -> str:
    """Fallback reply when no API key is configured."""
    msg = message.lower()

    greetings = ["hello", "hi", "hey", "merhaba", "selam", "howdy"]
    if any(g in msg for g in greetings):
        return (
            "Hi! I'm Nova AI 👋  I can help you find the perfect product, "
            "compare specs, or answer questions about our catalog. What are you looking for today?"
        )

    if any(w in msg for w in ["laptop", "macbook", "notebook", "computer"]):
        return (
            "We carry a great range of laptops — from the MacBook Pro (M3) to the "
            "Dell XPS 15 and Microsoft Surface Pro. What's your budget or preferred OS?"
        )

    if any(w in msg for w in ["phone", "iphone", "samsung", "galaxy", "smartphone"]):
        return (
            "Our top smartphones right now are the iPhone 15 Pro and Samsung Galaxy S24 Ultra. "
            "Both have flagship cameras and long battery life. Any specific feature you care about?"
        )

    if any(w in msg for w in ["headphone", "airpod", "earphone", "earbuds", "audio", "sound"]):
        return (
            "For audio, the Sony WH-1000XM5 headphones are our best-seller for noise cancellation, "
            "while the AirPods Pro 2 are perfect for Apple users. Would you like a comparison?"
        )

    if any(w in msg for w in ["tablet", "ipad", "galaxy tab", "surface"]):
        return (
            "Tablets in stock include the iPad Pro 12.9\", Galaxy Tab S9 Ultra, and Surface Pro 9. "
            "The iPad Pro is best for creative work; the Galaxy Tab for Android power users. Which suits you?"
        )

    if any(w in msg for w in ["price", "cheap", "budget", "affordable", "ucuz", "fiyat"]):
        return (
            "Happy to help you find something within budget! "
            "Could you share your price range? We have options from $199 to $3,499 across all categories."
        )

    if any(w in msg for w in ["compare", "difference", "vs", "better", "karşılaştır"]):
        return (
            "Great question! To compare two products, just tell me their names "
            "and I'll walk you through the key differences in specs, price, and use case."
        )

    if any(w in msg for w in ["order", "track", "shipping", "sipariş", "kargo"]):
        return (
            "For order tracking and shipping updates, head to your "
            "**Account → Orders** page. You'll see real-time status for every order there."
        )

    # Fallback: mention first relevant product
    if products:
        p = products[0]
        cat = p.category.name if p.category else "electronics"
        return (
            f"You might love our **{p.name}** — one of our top picks in {cat}, "
            f"priced at ${float(p.price):.2f}. "
            "Can I help you with more details or find something else?"
        )

    return (
        "I'm Nova AI, here to help you find the perfect product! "
        "Ask me about laptops, phones, tablets, headphones, or anything else in our store."
    )


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    products = _search_products(payload.message, db)

    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()

    if not api_key:
        # Demo mode: smart rule-based responses
        return ChatResponse(reply=_rule_based_reply(payload.message, products))

    # Production mode: Claude API
    try:
        import anthropic  # type: ignore[import]

        client = anthropic.Anthropic(api_key=api_key)

        messages = [{"role": m.role, "content": m.content} for m in payload.history]
        messages.append({"role": "user", "content": payload.message})

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system=_build_system_prompt(products),
            messages=messages,
        )

        return ChatResponse(reply=response.content[0].text)

    except Exception as exc:
        # Return a safe fallback rather than a 500 error
        return ChatResponse(
            reply=(
                "Sorry, I'm having a brief technical hiccup. "
                "Please try again in a moment, or browse our shop directly!"
            )
        )
