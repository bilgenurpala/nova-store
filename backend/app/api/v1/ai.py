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
        rating_str = f", rated {p.rating}/5" if hasattr(p, 'rating') and p.rating else ""
        lines.append(f"• {p.name} — ${float(p.price):.2f} ({cat}, {stock_str}{rating_str})")

    catalog_block = "\n".join(lines) if lines else "No products currently available."

    return (
        "CRITICAL RULE: You MUST always respond in English only. "
        "No matter what language the customer writes in — Turkish, Spanish, French, or any other — "
        "your reply must ALWAYS be in English. Never switch to another language under any circumstances.\n\n"
        "You are Nova AI, the friendly and knowledgeable shopping assistant for Nova Store — a premium electronics retailer.\n"
        "Your goal is to help customers find the perfect product, compare options, and make confident purchase decisions.\n\n"
        "Personality: Warm, enthusiastic about tech, concise but helpful. You love helping people find great deals.\n\n"
        "Guidelines:\n"
        "- Keep replies under 150 words unless a detailed comparison is specifically requested.\n"
        "- Always recommend specific products with name and price when relevant.\n"
        "- When comparing products, use clear pros/cons format.\n"
        "- For budget questions, always ask for their price range first if not provided.\n"
        "- For order/account questions: direct to Account → Orders page.\n"
        "- Only recommend products that are in stock.\n"
        "- If asked about products not in catalog, acknowledge honestly and suggest the closest alternative.\n"
        "- ALWAYS respond in English regardless of the language the customer writes in.\n\n"
        f"Live catalog (only in-stock items shown):\n{catalog_block}\n\n"
        "Remember: Be helpful, specific, and friendly. Every customer deserves a great shopping experience! "
        "And always in English."
    )


def _rule_based_reply(message: str, products: list[Product]) -> str:
    """Smart fallback reply when no API key is configured."""
    msg = message.lower()

    if any(g in msg for g in ["hello", "hi", "hey", "howdy", "good morning", "greetings"]):
        return (
            "Hi! I'm Nova AI 👋 I can help you find the perfect product, compare specs, "
            "and make confident purchase decisions. What are you looking for today?"
        )

    if any(w in msg for w in ["laptop", "macbook", "notebook", "computer", "pc"]):
        recs = [p for p in products if "computer" in (p.category.name if p.category else "").lower()
                or "laptop" in p.name.lower() or "macbook" in p.name.lower()]
        if recs:
            p = recs[0]
            return (f"Our top laptop pick right now: **{p.name}** — ${float(p.price):.2f}. "
                    f"Great performance and portability. What's your budget? I'll find the best match!")
        return ("We have a great laptop selection! Check out the MacBook Air M3 ($1,299) or our Windows options. "
                "What's your budget and use case? (Gaming, work, school?)")

    if any(w in msg for w in ["phone", "iphone", "samsung", "galaxy", "smartphone", "mobile"]):
        recs = [p for p in products if "phone" in (p.category.name if p.category else "").lower()
                or "iphone" in p.name.lower() or "samsung" in p.name.lower()]
        if recs:
            names = " or ".join([f"**{p.name}** (${float(p.price):.2f})" for p in recs[:2]])
            return f"Top phones in our store: {names}. What matters most to you — camera, battery, or performance?"
        return ("Our latest smartphones include the iPhone 15 Pro and Samsung Galaxy S24. "
                "Do you prefer iOS or Android?")

    if any(w in msg for w in ["headphone", "airpod", "earphone", "earbuds", "audio", "sound", "speaker"]):
        recs = [p for p in products if "audio" in (p.category.name if p.category else "").lower()
                or "airpod" in p.name.lower() or "sony" in p.name.lower()]
        if recs:
            p = recs[0]
            return (f"One of our best audio picks: **{p.name}** — ${float(p.price):.2f}. "
                    f"Is active noise cancellation or wireless freedom your priority?")
        return "In audio, the Sony WH-1000XM5 and AirPods Max are our most popular. What's your budget?"

    if any(w in msg for w in ["tablet", "ipad", "surface"]):
        return ("The iPad Pro 13\" ($1,099) is ideal for creative work, "
                "while Samsung Galaxy Tab is great for Android fans. "
                "How do you plan to use it?")

    if any(w in msg for w in ["watch", "smartwatch", "apple watch"]):
        recs = [p for p in products if "watch" in p.name.lower()
                or "wearable" in (p.category.name if p.category else "").lower()]
        if recs:
            p = recs[0]
            return f"**{p.name}** (${float(p.price):.2f}) is a great choice for health tracking and notifications! Any other questions?"
        return "The Apple Watch S9 is our most popular smartwatch — excellent health tracking and Apple ecosystem integration."

    if any(w in msg for w in ["price", "cheap", "budget", "affordable", "cost", "expensive"]):
        return ("Happy to help you find budget-friendly options! "
                "What's your price range? $100–$500, $500–$1,000, or $1,000+? "
                "I'll find the best value for your money 🎯")

    if any(w in msg for w in ["compare", "difference", "vs", "better", "versus"]):
        return ("Sure, I can compare products for you! "
                "Which two products would you like to compare? "
                "Just tell me the names and I'll break down the differences ✅")

    if any(w in msg for w in ["order", "track", "shipping", "delivery"]):
        return ("To track your order, go to **Account → My Orders**. "
                "You'll find real-time status and shipping info there 📦")

    if any(w in msg for w in ["recommend", "suggest", "best", "top", "popular"]):
        if products:
            p = products[0]
            cat = p.category.name if p.category else "Electronics"
            return (f"My top pick for you: **{p.name}** — ${float(p.price):.2f} ({cat}). "
                    f"Excellent value and one of our most popular items! Want to know more?")

    if any(w in msg for w in ["discount", "sale", "deal", "offer", "promo", "coupon"]):
        sale_products = [p for p in products if p.stock > 0]
        if sale_products:
            p = sale_products[0]
            return (f"Great deals available now! **{p.name}** (${float(p.price):.2f}) "
                    "is one of our hottest items. Check out the Shop page for all current offers 🎉")
        return "Visit our Shop page for the latest deals and offers!"

    if any(w in msg for w in ["thanks", "thank you", "thx", "cheers", "appreciate"]):
        return "You're welcome! 😊 Is there anything else I can help you with?"

    # Generic fallback with product suggestion
    if products:
        p = products[0]
        cat = p.category.name if p.category else "Electronics"
        return (
            f"Welcome to Nova Store! 🛍️ "
            f"I'm here to help. Our popular item right now: **{p.name}** (${float(p.price):.2f}, {cat}). "
            "Are you looking for a phone, laptop, headphones, or something else?"
        )

    return (
        "I'm Nova AI, here to help! 🚀 "
        "I can answer questions about laptops, phones, headphones, tablets, and accessories. "
        "What are you looking for?"
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
