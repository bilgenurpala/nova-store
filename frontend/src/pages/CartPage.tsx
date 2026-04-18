import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { getCart, updateCartItem, removeFromCart } from '../api/cart'
import { useAuth } from '../context/AuthContext'
import type { Cart, CartItem } from '../types'

// ─── Cart Item Row ────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onQtyChange,
  onRemove,
}: {
  item: CartItem
  onQtyChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
}) {
  const img =
    item.product?.images?.find((i) => i.is_primary) ??
    item.product?.images?.[0]

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d2d2d7',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '8px',
          backgroundColor: '#f5f5f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {img ? (
          <img
            src={img.url}
            alt={img.alt_text || item.product?.name}
            style={{ maxHeight: '72px', maxWidth: '80%', objectFit: 'contain' }}
          />
        ) : (
          <ShoppingCart size={28} color="#d2d2d7" />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#0071e3',
            marginBottom: '4px',
            letterSpacing: '0.5px',
          }}
        >
          {item.product?.category?.name?.toUpperCase() ?? ''}
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1d1d1f',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.product?.name ?? 'Product'}
        </div>
        <div style={{ fontSize: '14px', color: '#6e6e73' }}>
          ${Number(item.product?.price ?? 0).toLocaleString()} each
        </div>
      </div>

      {/* Price */}
      <div
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#0071e3',
          minWidth: '90px',
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        ${(Number(item.product?.price ?? 0) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>

      {/* Qty + Remove */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* Quantity picker */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '32px',
            backgroundColor: '#f5f5f7',
            border: '1px solid #d2d2d7',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => {
              if (item.quantity > 1) onQtyChange(item.product_id, item.quantity - 1)
            }}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#1d1d1f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            −
          </button>
          <span
            style={{
              width: '32px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 600,
              color: '#1d1d1f',
            }}
          >
            {item.quantity}
          </span>
          <button
            onClick={() => onQtyChange(item.product_id, item.quantity + 1)}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#1d1d1f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.product_id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#6e6e73',
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ff3b30')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6e6e73')}
        >
          Remove
        </button>
      </div>
    </div>
  )
}

// ─── Empty Cart ────────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d2d2d7',
        borderRadius: '12px',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '40px',
          backgroundColor: '#f5f5f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <ShoppingCart size={40} color="#6e6e73" />
      </div>
      <h3
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#1d1d1f',
          marginBottom: '8px',
        }}
      >
        Your cart is empty
      </h3>
      <p style={{ fontSize: '14px', color: '#6e6e73', marginBottom: '28px' }}>
        Looks like you haven't added anything yet.
      </p>
      <Link
        to="/shop"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: '48px',
          padding: '0 28px',
          backgroundColor: '#0071e3',
          color: '#ffffff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        Start Shopping
      </Link>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CartPage() {
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try {
      const c = await getCart()
      setCart(c)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  async function handleQtyChange(productId: number, qty: number) {
    setUpdating(productId)
    try {
      const updated = await updateCartItem(productId, qty)
      setCart(updated)
    } catch {
      // silently fail
    } finally {
      setUpdating(null)
    }
  }

  async function handleRemove(productId: number) {
    setUpdating(productId)
    try {
      const updated = await removeFromCart(productId)
      setCart(updated)
    } catch {
      // silently fail
    } finally {
      setUpdating(null)
    }
  }

  // ── Order totals ─────────────────────────────────────────────────────────
  const items = cart?.items ?? []
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce(
    (s, i) => s + Number(i.product?.price ?? 0) * i.quantity,
    0
  )
  const TAX_RATE = 0.08
  const tax = subtotal * TAX_RATE
  const discount = promoApplied ? subtotal * 0.1 : 0
  const total = subtotal + tax - discount

  return (
    <div style={{ backgroundColor: '#f5f5f7', minHeight: 'calc(100vh - 72px)' }}>
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #d2d2d7',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          gap: '6px',
          position: 'sticky',
          top: '72px',
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ fontSize: '14px', color: '#6e6e73', textDecoration: 'none' }}>Home</Link>
        <span style={{ fontSize: '14px', color: '#6e6e73' }}> / </span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>Cart</span>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 40px 80px' }}>
        {/* ── Heading ──────────────────────────────────────────────────── */}
        <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1d1d1f', marginBottom: '4px' }}>
          Shopping Cart
        </h1>
        <p style={{ fontSize: '14px', color: '#6e6e73', marginBottom: '24px' }}>
          {loading ? '…' : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
        </p>

        {/* ── Not logged in ────────────────────────────────────────────── */}
        {!user && !loading && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d2d2d7',
              borderRadius: '12px',
              padding: '48px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px' }}>
              Sign in to view your cart
            </h3>
            <p style={{ fontSize: '14px', color: '#6e6e73', marginBottom: '24px' }}>
              Your cart is saved to your account.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '48px',
                padding: '0 28px',
                backgroundColor: '#0071e3',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Sign in
            </Link>
          </div>
        )}

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '120px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d2d2d7' }} />
              ))}
            </div>
            <div style={{ width: '360px', flexShrink: 0, height: '300px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d2d2d7' }} />
          </div>
        )}

        {/* ── Main layout (logged in + loaded) ─────────────────────────── */}
        {user && !loading && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* LEFT: Items + Promo */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {items.length === 0 ? (
                <EmptyCart />
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        style={{ opacity: updating === item.product_id ? 0.5 : 1, transition: 'opacity 0.15s' }}
                      >
                        <CartItemRow
                          item={item}
                          onQtyChange={handleQtyChange}
                          onRemove={handleRemove}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Promo code */}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d2d2d7',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      style={{
                        flex: 1,
                        height: '36px',
                        padding: '0 12px',
                        border: '1px solid #d2d2d7',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#1d1d1f',
                        backgroundColor: '#f5f5f7',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => {
                        if (promoCode.toUpperCase() === 'NOVA10') {
                          setPromoApplied(true)
                        }
                      }}
                      style={{
                        height: '36px',
                        padding: '0 20px',
                        backgroundColor: '#0071e3',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Apply
                    </button>
                    {promoApplied && (
                      <span style={{ fontSize: '13px', color: '#34c759', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        ✓ 10% off applied
                      </span>
                    )}
                  </div>

                  {/* Continue shopping */}
                  <Link
                    to="/shop"
                    style={{
                      display: 'inline-block',
                      marginTop: '16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0071e3',
                      textDecoration: 'none',
                    }}
                  >
                    ← Continue Shopping
                  </Link>
                </>
              )}
            </div>

            {/* RIGHT: Order Summary */}
            {items.length > 0 && (
              <div
                style={{
                  width: '380px',
                  flexShrink: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #d2d2d7',
                  borderRadius: '12px',
                  padding: '20px',
                  position: 'sticky',
                  top: '132px',
                }}
              >
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1d1d1f', marginBottom: '20px' }}>
                  Order Summary
                </h2>

                <div style={{ height: '1px', backgroundColor: '#d2d2d7', marginBottom: '16px' }} />

                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6e6e73' }}>Subtotal ({itemCount} items)</span>
                  <span style={{ fontSize: '14px', color: '#6e6e73' }}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Shipping */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6e6e73' }}>Shipping</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#34c759' }}>Free</span>
                </div>

                {/* Tax */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6e6e73' }}>Tax (8%)</span>
                  <span style={{ fontSize: '14px', color: '#6e6e73' }}>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Discount */}
                {promoApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#34c759' }}>Promo (NOVA10)</span>
                    <span style={{ fontSize: '14px', color: '#34c759' }}>-${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div style={{ height: '1px', backgroundColor: '#d2d2d7', margin: '16px 0' }} />

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f' }}>Total</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#1d1d1f' }}>
                    ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Checkout button */}
                <button
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#0071e3',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: '12px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0077ed')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0071e3')}
                >
                  Proceed to Checkout
                </button>

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#6e6e73', marginBottom: '16px' }}>
                  Secure checkout with SSL encryption
                </p>

                <div style={{ height: '1px', backgroundColor: '#d2d2d7', marginBottom: '12px' }} />

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#6e6e73' }}>
                  Accepted payments: Visa · Mastercard · Amex · PayPal
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
