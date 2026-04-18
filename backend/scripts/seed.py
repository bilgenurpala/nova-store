"""
Seed script — populates the database with sample tech product data.
Safe to run multiple times: skips existing records by email/slug/name.

Usage:
    py scripts/seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage


ADMIN_EMAIL = "admin@novastore.com"
ADMIN_PASSWORD = "Admin1234!"

# Secondary admin (requested)
ADMIN2_EMAIL = "admin@admin.com"
ADMIN2_PASSWORD = "Admin1234!"

CATEGORIES = [
    {"name": "Laptops & Computers", "slug": "laptops-computers"},
    {"name": "Smartphones & Tablets", "slug": "smartphones-tablets"},
    {"name": "Audio", "slug": "audio"},
    {"name": "Gaming", "slug": "gaming"},
    {"name": "Accessories", "slug": "accessories"},
    {"name": "Smart Home", "slug": "smart-home"},
    {"name": "Cameras", "slug": "cameras"},
]

PRODUCTS = [
    # Laptops & Computers
    {
        "name": "MacBook Pro 14\" M3",
        "description": "Apple M3 chip, 18GB unified memory, 512GB SSD. Liquid Retina XDR display with ProMotion.",
        "price": "1999.99",
        "stock": 25,
        "category_slug": "laptops-computers",
        "images": [{"url": "https://placehold.co/600x400?text=MacBook+Pro", "alt_text": "MacBook Pro 14 M3", "is_primary": True}],
    },
    {
        "name": "Dell XPS 15 (2024)",
        "description": "Intel Core Ultra 9, 32GB DDR5, 1TB NVMe SSD, OLED 3.5K touch display.",
        "price": "1749.99",
        "stock": 18,
        "category_slug": "laptops-computers",
        "images": [{"url": "https://placehold.co/600x400?text=Dell+XPS+15", "alt_text": "Dell XPS 15", "is_primary": True}],
    },
    {
        "name": "LG UltraWide 34\" Monitor",
        "description": "3440x1440 IPS, 144Hz, 1ms GTG, USB-C 96W PD, HDR10. Ideal for productivity and gaming.",
        "price": "649.99",
        "stock": 30,
        "category_slug": "laptops-computers",
        "images": [{"url": "https://placehold.co/600x400?text=LG+UltraWide", "alt_text": "LG UltraWide Monitor", "is_primary": True}],
    },
    # Smartphones & Tablets
    {
        "name": "iPhone 16 Pro",
        "description": "A18 Pro chip, 48MP Fusion camera system, titanium design, Action Button. 256GB.",
        "price": "1099.99",
        "stock": 60,
        "category_slug": "smartphones-tablets",
        "images": [{"url": "https://placehold.co/600x400?text=iPhone+16+Pro", "alt_text": "iPhone 16 Pro", "is_primary": True}],
    },
    {
        "name": "Samsung Galaxy S25 Ultra",
        "description": "Snapdragon 8 Elite, 12GB RAM, 200MP camera, built-in S Pen, 512GB.",
        "price": "1299.99",
        "stock": 45,
        "category_slug": "smartphones-tablets",
        "images": [{"url": "https://placehold.co/600x400?text=Galaxy+S25+Ultra", "alt_text": "Samsung Galaxy S25 Ultra", "is_primary": True}],
    },
    {
        "name": "iPad Pro 13\" M4",
        "description": "Ultra Retina XDR OLED, Apple M4, 256GB, Wi-Fi 6E, Apple Pencil Pro compatible.",
        "price": "1299.99",
        "stock": 20,
        "category_slug": "smartphones-tablets",
        "images": [{"url": "https://placehold.co/600x400?text=iPad+Pro+M4", "alt_text": "iPad Pro 13 M4", "is_primary": True}],
    },
    # Audio
    {
        "name": "Sony WH-1000XM5",
        "description": "Industry-leading noise cancellation, 30-hour battery, multipoint connection, LDAC Hi-Res Audio.",
        "price": "349.99",
        "stock": 55,
        "category_slug": "audio",
        "images": [{"url": "https://placehold.co/600x400?text=Sony+WH-1000XM5", "alt_text": "Sony WH-1000XM5", "is_primary": True}],
    },
    {
        "name": "Apple AirPods Pro (2nd Gen)",
        "description": "H2 chip, Adaptive Audio, Personalized Spatial Audio, USB-C charging case.",
        "price": "249.99",
        "stock": 80,
        "category_slug": "audio",
        "images": [{"url": "https://placehold.co/600x400?text=AirPods+Pro", "alt_text": "AirPods Pro 2nd Gen", "is_primary": True}],
    },
    {
        "name": "Sonos Era 300",
        "description": "Spatial Audio speaker with Dolby Atmos, Wi-Fi & Bluetooth, room-filling sound.",
        "price": "449.99",
        "stock": 22,
        "category_slug": "audio",
        "images": [{"url": "https://placehold.co/600x400?text=Sonos+Era+300", "alt_text": "Sonos Era 300", "is_primary": True}],
    },
    # Gaming
    {
        "name": "PlayStation 5 Slim",
        "description": "PS5 Slim disc edition, 1TB SSD, DualSense controller included, 4K gaming at 120fps.",
        "price": "449.99",
        "stock": 15,
        "category_slug": "gaming",
        "images": [{"url": "https://placehold.co/600x400?text=PS5+Slim", "alt_text": "PlayStation 5 Slim", "is_primary": True}],
    },
    {
        "name": "ASUS ROG Ally X",
        "description": "AMD Ryzen Z1 Extreme, 24GB LPDDR5X, 1TB SSD, 7\" 120Hz display. Windows 11 handheld gaming.",
        "price": "799.99",
        "stock": 12,
        "category_slug": "gaming",
        "images": [{"url": "https://placehold.co/600x400?text=ROG+Ally+X", "alt_text": "ASUS ROG Ally X", "is_primary": True}],
    },
    {
        "name": "Logitech G Pro X Superlight 2",
        "description": "HERO 2 sensor, 32000 DPI, 60-hour battery, ultra-lightweight 60g wireless gaming mouse.",
        "price": "159.99",
        "stock": 40,
        "category_slug": "gaming",
        "images": [{"url": "https://placehold.co/600x400?text=G+Pro+X", "alt_text": "Logitech G Pro X Superlight 2", "is_primary": True}],
    },
    # Accessories
    {
        "name": "Anker 140W USB-C Charger (GaN)",
        "description": "3-port compact GaN charger (2× USB-C, 1× USB-A), foldable plug, charges MacBook Pro at full speed.",
        "price": "69.99",
        "stock": 100,
        "category_slug": "accessories",
        "images": [{"url": "https://placehold.co/600x400?text=Anker+140W", "alt_text": "Anker 140W GaN Charger", "is_primary": True}],
    },
    {
        "name": "CalDigit TS4 Thunderbolt 4 Dock",
        "description": "18 ports including 2× Thunderbolt 4, 3× USB-A 10Gbps, SD 4.0, 2.5GbE, 98W host charging.",
        "price": "349.99",
        "stock": 20,
        "category_slug": "accessories",
        "images": [{"url": "https://placehold.co/600x400?text=CalDigit+TS4", "alt_text": "CalDigit TS4 Dock", "is_primary": True}],
    },
    {
        "name": "Samsung T9 Portable SSD (2TB)",
        "description": "USB 3.2 Gen 2x2, up to 2,000 MB/s read/write, rugged IP65 rating, includes USB-C & USB-A cables.",
        "price": "179.99",
        "stock": 35,
        "category_slug": "accessories",
        "images": [{"url": "https://placehold.co/600x400?text=Samsung+T9+SSD", "alt_text": "Samsung T9 Portable SSD", "is_primary": True}],
    },
    # Smart Home
    {
        "name": "Apple HomePod (2nd Gen)",
        "description": "S9 chip, spatial audio, room sensing, smart home hub, seamless Siri and HomeKit integration.",
        "price": "299.99",
        "stock": 28,
        "category_slug": "smart-home",
        "images": [{"url": "https://placehold.co/600x400?text=HomePod", "alt_text": "Apple HomePod 2nd Gen", "is_primary": True}],
    },
    {
        "name": "Philips Hue Starter Kit (4 bulbs + Bridge)",
        "description": "4× A19 White & Color Ambiance smart bulbs + Hue Bridge. 16 million colors, voice & app control.",
        "price": "199.99",
        "stock": 50,
        "category_slug": "smart-home",
        "images": [{"url": "https://placehold.co/600x400?text=Philips+Hue", "alt_text": "Philips Hue Starter Kit", "is_primary": True}],
    },
    # Cameras
    {
        "name": "Sony A7C II",
        "description": "Full-frame mirrorless, 33MP BSI sensor, AI-powered autofocus, 4K 60fps video, compact body.",
        "price": "2299.99",
        "stock": 10,
        "category_slug": "cameras",
        "images": [{"url": "https://placehold.co/600x400?text=Sony+A7C+II", "alt_text": "Sony A7C II", "is_primary": True}],
    },
    {
        "name": "GoPro HERO13 Black",
        "description": "5.3K60 video, HyperSmooth 6.0 stabilization, 27MP photos, waterproof to 10m, magnetic mounting.",
        "price": "399.99",
        "stock": 32,
        "category_slug": "cameras",
        "images": [{"url": "https://placehold.co/600x400?text=GoPro+HERO13", "alt_text": "GoPro HERO13 Black", "is_primary": True}],
    },
]


def seed() -> None:
    db = SessionLocal()

    try:
        # Admin user (admin@novastore.com)
        if not db.query(User).filter(User.email == ADMIN_EMAIL).first():
            db.add(User(
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                is_active=True,
                role="admin",
            ))
            print(f"  ✓ Admin user created: {ADMIN_EMAIL}")
        else:
            print(f"  - Admin user already exists: {ADMIN_EMAIL}")

        # Admin user (admin@admin.com)
        if not db.query(User).filter(User.email == ADMIN2_EMAIL).first():
            db.add(User(
                email=ADMIN2_EMAIL,
                password_hash=hash_password(ADMIN2_PASSWORD),
                is_active=True,
                role="admin",
            ))
            print(f"  ✓ Admin user created: {ADMIN2_EMAIL}")
        else:
            print(f"  - Admin user already exists: {ADMIN2_EMAIL}")

        # Categories
        category_map: dict[str, Category] = {}
        for cat_data in CATEGORIES:
            existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if existing:
                category_map[cat_data["slug"]] = existing
                print(f"  - Category already exists: {cat_data['name']}")
            else:
                cat = Category(name=cat_data["name"], slug=cat_data["slug"])
                db.add(cat)
                db.flush()
                category_map[cat_data["slug"]] = cat
                print(f"  ✓ Category created: {cat_data['name']}")

        # Products
        for prod_data in PRODUCTS:
            if db.query(Product).filter(Product.name == prod_data["name"]).first():
                print(f"  - Product already exists: {prod_data['name']}")
                continue

            category = category_map[prod_data["category_slug"]]
            product = Product(
                name=prod_data["name"],
                description=prod_data["description"],
                price=prod_data["price"],
                stock=prod_data["stock"],
                category_id=category.id,
            )
            db.add(product)
            db.flush()

            for img_data in prod_data["images"]:
                db.add(ProductImage(
                    product_id=product.id,
                    url=img_data["url"],
                    alt_text=img_data["alt_text"],
                    is_primary=img_data["is_primary"],
                ))

            print(f"  ✓ Product created: {prod_data['name']}")

        db.commit()
        print("\nSeed completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seed failed: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding database...\n")
    seed()
