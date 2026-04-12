"""add product images table

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-04-12

"""
from alembic import op
import sqlalchemy as sa

revision = "d4e5f6a7b8c9"
down_revision = "c3d4e5f6a7b8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id"), nullable=False),
        sa.Column("url", sa.String(1000), nullable=False),
        sa.Column("alt_text", sa.String(255), nullable=False, server_default=""),
        sa.Column("is_primary", sa.Boolean, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.text("GETDATE()")),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.text("GETDATE()")),
    )
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"])


def downgrade() -> None:
    op.drop_index("ix_product_images_product_id", table_name="product_images")
    op.drop_table("product_images")
