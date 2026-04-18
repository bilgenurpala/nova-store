"""
Fix admin role AND password for admin@admin.com.

Usage (run from backend folder):
    py scripts/fix_admin.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User

TARGET_EMAIL    = "admin@admin.com"
TARGET_PASSWORD = "Admin1234!"

def fix_admin():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == TARGET_EMAIL).first()
        if user:
            user.role          = "admin"
            user.is_active     = True
            user.password_hash = hash_password(TARGET_PASSWORD)   # şifreyi de sıfırla
            db.commit()
            print(f"  ✓ {TARGET_EMAIL} → role=admin, password reset to '{TARGET_PASSWORD}'")
        else:
            new_user = User(
                email         = TARGET_EMAIL,
                password_hash = hash_password(TARGET_PASSWORD),
                is_active     = True,
                role          = "admin",
            )
            db.add(new_user)
            db.commit()
            print(f"  ✓ Created admin user: {TARGET_EMAIL} / {TARGET_PASSWORD}")
    except Exception as e:
        db.rollback()
        print(f"  [ERROR] {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    print("Fixing admin role & password...\n")
    fix_admin()
    print("\nDone.")
