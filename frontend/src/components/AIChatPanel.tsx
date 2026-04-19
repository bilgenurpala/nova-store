import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  time?: string
}

interface AIChatPanelProps {
  open: boolean
  onClose: () => void
}

function getTime() {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
}

// Render **bold** markdown inline
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 2px' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#1754f5', display: 'inline-block',
          animation: `nova-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  )
}

const SUGGESTIONS = [
  'Recommend a laptop',
  '🎧  Compare products',
  'Track my order',
  '🔍  Find a product',
]

export default function AIChatPanel({ open, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm the NovaStore AI assistant.\nI can help with product recommendations, finding deals, and tracking your orders.",
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const now = getTime()
    const userMsg: Message = { role: 'user', content: trimmed, time: now }
    const history = messages.slice(1)

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: history.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, time: getTime() }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops, I couldn't connect right now. Please try again in a moment!",
        time: getTime(),
      }])
    } finally {
      setLoading(false)
    }
  }, [messages, loading])

  if (!open) return null

  const showSuggestions = messages.length === 1

  return (
    <>
      <style>{`
        @keyframes nova-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes nova-panel-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nova-input::placeholder { color: #999ea8; }
      `}</style>

      {/* Panel */}
      <div style={{
        position: 'fixed',
        bottom: 92,
        right: 16,
        width: 380,
        maxWidth: 'calc(100vw - 32px)',
        height: 528,
        maxHeight: 'calc(100vh - 120px)',
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: '0px 8px 32px -4px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 999,
        animation: 'nova-panel-in 0.22s ease-out forwards',
      }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{
          background: '#0c0c0c',
          height: 68,
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* Avatar */}
          <div style={{
            position: 'absolute',
            left: 16, top: 15,
            width: 38, height: 38,
            borderRadius: 19,
            background: '#1754f5',
            boxShadow: '0px 0px 12px 2px rgba(23,84,245,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>AI</span>
          </div>

          {/* Title */}
          <span style={{
            position: 'absolute', left: 64, top: 13,
            color: '#ffffff', fontWeight: 600, fontSize: 14,
          }}>
            NovaStore AI
          </span>

          {/* Online dot */}
          <div style={{
            position: 'absolute', left: 64, top: 38,
            width: 7, height: 7, borderRadius: '50%',
            background: '#22c55e',
          }} />

          {/* Status text */}
          <span style={{
            position: 'absolute', left: 76, top: 32,
            color: '#8c949e', fontSize: 11,
          }}>
            Active • Typically replies instantly
          </span>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', left: 336, top: 20,
              width: 28, height: 28, borderRadius: 14,
              background: '#212121', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ color: '#8c8c8c', fontSize: 11 }}>✕</span>
          </button>
        </div>

        {/* ── Messages Area ───────────────────────────────────────── */}
        <div style={{
          flex: 1,
          background: '#f6f8fc',
          overflowY: 'auto',
          padding: '16px 12px 8px',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {messages.map((msg, i) => (
            msg.role === 'user' ? (
              /* User bubble */
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 8 }}>
                <div style={{
                  background: '#1754f5',
                  borderRadius: 14,
                  padding: '8px 12px',
                  maxWidth: 230,
                  fontSize: 12,
                  color: '#ffffff',
                  lineHeight: '18px',
                }}>
                  {renderText(msg.content)}
                </div>
                {msg.time && (
                  <span style={{ color: '#808794', fontSize: 9.5, marginTop: 3 }}>{msg.time}</span>
                )}
              </div>
            ) : (
              /* AI bubble */
              <div key={i} style={{ marginBottom: i === 0 ? 0 : 8 }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '8px 12px',
                  maxWidth: 302,
                  fontSize: i === 0 ? 12 : 11.5,
                  color: '#171c24',
                  lineHeight: i === 0 ? '18px' : '17px',
                  boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.06)',
                }}>
                  {msg.content.split('\n').map((line, li) => (
                    <p key={li} style={{ margin: li < msg.content.split('\n').length - 1 ? '0 0 0 0' : 0 }}>
                      {renderText(line)}
                    </p>
                  ))}
                </div>

                {/* Quick start chips — shown below first AI message */}
                {i === 0 && showSuggestions && (
                  <div style={{ marginTop: 12 }}>
                    <span style={{ color: '#808794', fontSize: 10.5, display: 'block', marginBottom: 8 }}>
                      Quick start:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {SUGGESTIONS.map(s => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s.replace(/^[^\w]*/, '').trim())}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #1754f5',
                            borderRadius: 14,
                            height: 30,
                            padding: '0 9px',
                            fontSize: 10.5,
                            color: '#1754f5',
                            cursor: 'pointer',
                            textAlign: 'left',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '4px 12px',
              width: 'fit-content',
              boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.06)',
              marginBottom: 8,
            }}>
              <TypingDots />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input Area ──────────────────────────────────────────── */}
        <div style={{
          height: 72,
          flexShrink: 0,
          background: '#ffffff',
          borderTop: '1px solid #e5e8ed',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
        }}>
          <input
            ref={inputRef}
            className="nova-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
            }}
            placeholder="Type a message..."
            disabled={loading}
            style={{
              flex: 1,
              height: 40,
              background: '#f6f8fc',
              border: '1px solid #e5e8ed',
              borderRadius: 20,
              padding: '0 14px',
              fontSize: 12.5,
              color: '#171c24',
              outline: 'none',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 40, height: 40,
              borderRadius: 20,
              background: loading || !input.trim() ? '#c7d2fe' : '#1754f5',
              border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: loading || !input.trim() ? 'none' : '0px 4px 12px 0px rgba(23,84,245,0.35)',
              transition: 'background 0.15s, box-shadow 0.15s',
            }}
          >
            <span style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>↑</span>
          </button>
        </div>
      </div>
    </>
  )
}
