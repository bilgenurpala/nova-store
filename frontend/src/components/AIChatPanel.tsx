import { useState, useRef, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatPanelProps {
  open: boolean
  onClose: () => void
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 0' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#1754f5',
            display: 'inline-block',
            animation: `nova-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <div
        style={{
          background: '#1754f5',
          color: '#fff',
          borderRadius: '18px 18px 4px 18px',
          padding: '10px 14px',
          maxWidth: '78%',
          fontSize: 14,
          lineHeight: 1.5,
          boxShadow: '0 1px 4px rgba(23,84,245,0.25)',
        }}
      >
        {text}
      </div>
    </div>
  )
}

function AiBubble({ text }: { text: string }) {
  // Render **bold** markdown
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  const rendered = parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-end' }}>
      {/* Avatar */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1754f5 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 13,
          color: '#fff',
          fontWeight: 700,
        }}
      >
        N
      </div>
      <div
        style={{
          background: '#f5f5f7',
          color: '#1d1d1f',
          borderRadius: '18px 18px 18px 4px',
          padding: '10px 14px',
          maxWidth: '78%',
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {rendered}
      </div>
    </div>
  )
}

// ── Quick suggestion chips ─────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Best laptops under $1000',
  'Compare iPhone vs Samsung',
  'Noise-cancelling headphones',
  'Latest tablets in stock',
]

// ── Main Panel ────────────────────────────────────────────────────────────────

export default function AIChatPanel({ open, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm **Nova AI**, your personal shopping assistant 👋  Ask me about any product, get recommendations, or compare options. How can I help you today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading) return

      const userMsg: Message = { role: 'user', content: trimmed }
      const history = messages.filter((m) => m.role !== 'assistant' || messages.indexOf(m) > 0)

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setLoading(true)

      try {
        const res = await fetch('/api/v1/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        })

        if (!res.ok) throw new Error('Network error')

        const data = await res.json()
        const aiMsg: Message = { role: 'assistant', content: data.reply }
        setMessages((prev) => [...prev, aiMsg])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "Oops, I couldn't connect right now. Please try again in a moment!",
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [messages, loading]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes nova-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes nova-panel-in {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Backdrop (mobile-friendly) */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.15)',
          zIndex: 998,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 96,
          right: 24,
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          height: 560,
          maxHeight: 'calc(100vh - 120px)',
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 999,
          animation: 'nova-panel-in 0.25s ease-out forwards',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1754f5 0%, #7c3aed 100%)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            N
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Nova AI</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
              Shopping assistant · Always online
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              width: 30,
              height: 30,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 14px 8px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <UserBubble key={i} text={msg.content} />
            ) : (
              <AiBubble key={i} text={msg.content} />
            )
          )}

          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 12 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1754f5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  color: '#fff',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                N
              </div>
              <div
                style={{
                  background: '#f5f5f7',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '6px 14px',
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions (only before first user message) */}
        {messages.length === 1 && (
          <div
            style={{
              padding: '0 14px 10px',
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  background: '#f0f4ff',
                  border: '1px solid #d0deff',
                  borderRadius: 20,
                  padding: '5px 11px',
                  fontSize: 12,
                  color: '#1754f5',
                  cursor: 'pointer',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: '#f0f0f2', flexShrink: 0 }} />

        {/* Input row */}
        <div
          style={{
            padding: '10px 12px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            disabled={loading}
            style={{
              flex: 1,
              border: '1.5px solid #e5e5ea',
              borderRadius: 22,
              padding: '9px 14px',
              fontSize: 14,
              outline: 'none',
              background: loading ? '#fafafa' : '#fff',
              color: '#1d1d1f',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#1754f5')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e5ea')}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: loading || !input.trim() ? '#e5e5ea' : '#1754f5',
              border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            {/* Send icon (arrow) */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke={loading || !input.trim() ? '#aaa' : '#fff'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
