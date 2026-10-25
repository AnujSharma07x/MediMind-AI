import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  AlertCircle,
  BookOpen,
  Bot,
  CheckCircle2,
  HeartPulse,
  Info,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Thermometer,
  Brain,
  Wind,
  X,
} from 'lucide-react'

const suggestions = [
  {
    icon: Brain,
    label: 'Headache',
    text: 'I have a headache',
    description: 'Head pain or discomfort',
  },
  {
    icon: Thermometer,
    label: 'Fever',
    text: 'I have fever',
    description: 'Feeling feverish or unusually warm',
  },
  {
    icon: Wind,
    label: 'Cough',
    text: 'I have a cough',
    description: 'Dry or chesty cough',
  },
]

function parsePrediction(text) {
  const prefix = 'Based on the symptoms entered, the model suggests '
  if (!text.startsWith(prefix)) return null

  const rest = text.slice(prefix.length)
  const marker = '. This is not a confirmed diagnosis.'
  const markerIndex = rest.indexOf(marker)

  if (markerIndex === -1) return null

  const condition = rest.slice(0, markerIndex).trim()
  const details = rest.slice(markerIndex + marker.length).trim()
  const descriptionMarker = 'Description: '
  const precautionsMarker = 'Precautions: '

  const descriptionIndex = details.indexOf(descriptionMarker)
  const precautionsIndex = details.indexOf(precautionsMarker)

  const description =
    descriptionIndex >= 0
      ? details
          .slice(
            descriptionIndex + descriptionMarker.length,
            precautionsIndex >= 0 ? precautionsIndex : undefined,
          )
          .trim()
          .replace(/\.$/, '')
      : ''

  const precautions =
    precautionsIndex >= 0
      ? details.slice(precautionsIndex + precautionsMarker.length).trim()
      : ''

  return { condition, description, precautions }
}

function App() {
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(() =>
    crypto.randomUUID(),
  )
  const [recognizedSymptoms, setRecognizedSymptoms] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [healthInfoOpen, setHealthInfoOpen] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(value = input) {
    const sentence = value.trim()

    if (!sentence || loading) return

    setInput('')
    setError('')
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: 'user',
        text: sentence,
      },
    ])
    setLoading(true)

    try {
      const response = await fetch('/api/symptom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence,
          conversation_id: conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const result = await response.json()

      const reply = String(result.reply ?? result)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p\s*>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")

      if (Array.isArray(result.symptoms)) {
        setRecognizedSymptoms(result.symptoms)
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: reply,
        },
      ])
    } catch {
      setError(
        'Could not connect to Meddy. Check that the Flask backend is running on port 5000, then try again.',
      )
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function startNewChat() {
    setConversationId(crypto.randomUUID())
    setRecognizedSymptoms([])
    setMessages([])
    setInput('')
    setError('')
    setHealthInfoOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="flex min-h-screen bg-[#f6f8fc] text-slate-800">
      {/* Sidebar */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white p-5 md:flex">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
            <HeartPulse size={25} strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              MediMind<span className="text-teal-600"> AI</span>
            </h1>
            <p className="text-xs text-slate-500">Your health companion</p>
          </div>
        </div>

        <button
          type="button"
          onClick={startNewChat}
          className="mt-9 flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/15 transition hover:bg-teal-700"
        >
          <Plus size={18} />
          New conversation
        </button>

        <p className="mb-3 mt-9 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>

        <div className="flex items-center gap-3 rounded-xl bg-teal-50 px-3 py-3 text-sm font-medium text-teal-800">
          <Stethoscope size={19} />
          Symptom assistant
          <span className="ml-auto h-2 w-2 rounded-full bg-teal-500" />
        </div>

        <button
          type="button"
          onClick={() => setHealthInfoOpen(true)}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-teal-700"
        >
          <BookOpen size={19} />
          Health information
          <Info size={15} className="ml-auto text-slate-400" />
        </button>

        <div className="mt-auto rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
            <ShieldCheck size={22} />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            Your health matters
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Understand your symptoms and learn when to seek professional care.
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-teal-700">
            <CheckCircle2 size={14} />
            Informed care starts here
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
            M
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Meddy Assistant
            </p>
            <p className="text-xs text-slate-500">ML-powered assistant</p>
          </div>

          <span
            className="ml-auto h-2 w-2 rounded-full bg-emerald-500"
            title="Assistant interface ready"
          />
        </div>
      </aside>

      {/* Main application */}
      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 md:hidden">
              <HeartPulse size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Symptom assistant
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                A little help understanding how you feel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Assistant ready
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-8">
          {/* Recognized symptoms */}
          {recognizedSymptoms.length > 0 && (
            <div className="mt-5 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Recognized symptoms
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Symptoms detected in this conversation
                  </p>
                </div>

                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {recognizedSymptoms.length}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {recognizedSymptoms.map((symptom) => (
                  <span
                    key={symptom}
                    className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm text-teal-800"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chat area */}
          <div className="flex flex-1 flex-col py-7 sm:py-10">
            {messages.length === 0 ? (
              <div className="m-auto w-full max-w-2xl py-6">
                <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-xl shadow-teal-700/20">
                  <Activity size={32} strokeWidth={1.8} />
                </div>

                <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                  Welcome to MediMind
                </p>

                <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Let&apos;s talk about
                  <span className="block text-teal-600">
                    how you&apos;re feeling.
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-slate-500 sm:text-base">
                  Tell Meddy about your symptoms in your own words. We&apos;ll
                  help you explore the available information.
                </p>

                <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {suggestions.map((item) => {
                    const Icon = item.icon

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => sendMessage(item.text)}
                        disabled={loading}
                        className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg hover:shadow-slate-200/60 disabled:opacity-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-100">
                          <Icon size={21} strokeWidth={1.8} />
                        </span>

                        <span className="mt-4 block text-sm font-semibold text-slate-800">
                          {item.label}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {item.description}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="mx-auto mt-6 flex max-w-md items-start justify-center gap-2 text-center text-xs leading-5 text-slate-400">
                  <ShieldCheck
                    size={15}
                    className="mt-0.5 shrink-0 text-teal-600"
                  />
                  <p>
                    These are example prompts, not a medical assessment. Your
                    information is processed by the connected application.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-6">
                {messages.map((message) => {
                  const prediction =
                    message.role === 'assistant'
                      ? parsePrediction(message.text)
                      : null

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 sm:gap-4 ${
                        message.role === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                          <Bot size={20} />
                        </div>
                      )}

                      <div
                        className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3.5 text-sm leading-7 sm:max-w-[80%] ${
                          message.role === 'user'
                            ? 'rounded-br-md bg-teal-600 text-white'
                            : 'rounded-bl-md border border-slate-200/80 bg-white text-slate-700 shadow-sm'
                        }`}
                      >
                        {prediction ? (
                          <div className="w-full space-y-4 sm:min-w-[320px]">
                            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                              <div className="flex items-center gap-2 text-teal-700">
                                <Activity size={17} />
                                <p className="text-xs font-semibold uppercase tracking-wide">
                                  Possible condition
                                </p>
                              </div>

                              <h3 className="mt-2 text-lg font-bold leading-6 text-slate-900">
                                {prediction.condition}
                              </h3>

                              <p className="mt-2 text-xs leading-5 text-slate-600">
                                This is an AI model suggestion, not a confirmed
                                diagnosis.
                              </p>
                            </div>

                            {prediction.description && (
                              <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center gap-2">
                                  <BookOpen
                                    size={17}
                                    className="text-teal-700"
                                  />
                                  <h4 className="font-semibold text-slate-900">
                                    Description
                                  </h4>
                                </div>

                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {prediction.description}
                                </p>
                              </div>
                            )}

                            {prediction.precautions && (
                              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck
                                    size={17}
                                    className="text-amber-700"
                                  />
                                  <h4 className="font-semibold text-slate-900">
                                    Precautions
                                  </h4>
                                </div>

                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {prediction.precautions}
                                </p>
                              </div>
                            )}

                            <p className="text-xs leading-5 text-slate-500">
                              Consult a qualified healthcare professional for
                              medical advice. Do not start or stop treatment
                              based only on this result.
                            </p>
                          </div>
                        ) : (
                          message.text
                        )}
                      </div>

                      {message.role === 'user' && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-xs font-bold text-slate-600">
                          You
                        </div>
                      )}
                    </div>
                  )
                })}

                {loading && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
                      <Bot size={20} />
                    </div>

                    <div
                      role="status"
                      aria-label="Meddy is preparing a response"
                      className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-4"
                    >
                      <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Message composer */}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
            className="sticky bottom-0 mb-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50 sm:mb-6 sm:p-3"
          >
            <label htmlFor="message" className="sr-only">
              Describe your symptoms
            </label>

            <div className="flex items-center gap-2 sm:gap-3">
              <input
                ref={inputRef}
                id="message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Describe how you're feeling..."
                autoComplete="off"
                maxLength={2000}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:px-4"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
              >
                <span>Send</span>
                <Send size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 pt-2.5">
              <p className="text-[10px] leading-4 text-slate-400 sm:text-xs">
                AI-generated information may be inaccurate. Verify health
                advice with a clinician.
              </p>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={startNewChat}
                  className="shrink-0 pl-2 text-xs font-medium text-teal-700 hover:text-teal-900"
                >
                  New chat
                </button>
              )}
            </div>
          </form>
        </section>
      </main>

      {/* Health Information panel */}
      {healthInfoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setHealthInfoOpen(false)
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="health-info-title"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <BookOpen size={24} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                    Health library
                  </p>
                  <h2
                    id="health-info-title"
                    className="mt-1 text-xl font-bold text-slate-900"
                  >
                    Health information
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHealthInfoOpen(false)}
                aria-label="Close health information"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Use these general health guidelines alongside, not instead of,
              advice from a qualified healthcare professional.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} className="text-teal-700" />
                  <h3 className="font-semibold text-slate-900">
                    Describe symptoms clearly
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Include when your symptoms started, how severe they feel,
                  whether they are changing, and any other symptoms you have.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <Stethoscope size={18} className="text-teal-700" />
                  <h3 className="font-semibold text-slate-900">
                    Understand AI results
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The suggested condition comes from a machine-learning model.
                  It may be incorrect or incomplete and cannot replace an
                  examination or professional medical assessment.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-700" />
                  <h3 className="font-semibold text-slate-900">
                    When to seek urgent care
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Seek emergency medical help for severe difficulty breathing,
                  chest pain, sudden confusion, fainting, uncontrolled bleeding,
                  or other potentially life-threatening symptoms. Do not wait
                  for an AI response.
                </p>
              </div>

              <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-teal-700" />
                  <h3 className="font-semibold text-slate-900">
                    Protect your information
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Avoid entering your full name, address, phone number, or other
                  identifying details into the symptom chat.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <Info size={15} className="mt-0.5 shrink-0" />
              <p>
                This section provides general guidance. It is not a complete
                medical reference or a personalized care plan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setHealthInfoOpen(false)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <Sparkles size={17} />
              Back to symptom assistant
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
