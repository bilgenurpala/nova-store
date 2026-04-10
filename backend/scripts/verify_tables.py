"""
Verify that all expected tables exist in the nova_store database.

Run from the backend/ directory after applying migrations:
    python scripts/verify_tables.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import inspect
from app.core.database import engine

EXPECTED_TABLES = [
    "users",
    "categories",
    "products",
    "carts",
    "cart_items",
]


def verify() -> None:
    print(f"Connecting to database ...")

    try:
        inspector = inspect(engine)
        existing = inspector.get_table_names()
    except Exception as e:
        print(f"[ERROR] Could not connect or inspect database: {e}")
        sys.exit(1)

    print(f"\nTables found in database: {existing}\n")

    all_ok = True
    for table in EXPECTED_TABLES:
        status = "✓" if table in existing else "✗ MISSING"
        print(f"  {status}  {table}")
        if table not in existing:
            all_ok = False

    print()
    if all_ok:
        print("All expected tables are present.")
    else:
        print("[WARN] Some tables are missing. Run: alembic upgrade head")
        sys.exit(1)


if __name__ == "__main__":
    verify()
