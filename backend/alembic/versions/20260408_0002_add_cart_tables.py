"""add cart tables

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-08 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "carts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("GETDATE()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("GETDATE()"),
            nullable=False,
        ),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(op.f("ix_carts_id"), "carts", ["id"], unique=False)
    op.create_index(op.f("ix_carts_user_id"), "carts", ["user_id"], unique=True)

    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("GETDATE()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("GETDATE()"),
            nullable=False,
        ),
        sa.Column("cart_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["cart_id"], ["carts.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_cart_items_id"), "cart_items", ["id"], unique=False)
    op.create_index(op.f("ix_cart_items_cart_id"), "cart_items", ["cart_id"], unique=False)
    op.create_index(op.f("ix_cart_items_product_id"), "cart_items", ["product_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_cart_items_product_id"), table_name="cart_items")
    op.drop_index(op.f("ix_cart_items_cart_id"), table_name="cart_items")
    op.drop_index(op.f("ix_cart_items_id"), table_name="cart_items")
    op.drop_table("cart_items")

    op.drop_index(op.f("ix_carts_user_id"), table_name="carts")
    op.drop_index(op.f("ix_carts_id"), table_name="carts")
    op.drop_table("carts")
