import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getQnA, askQuestion, answerQuestion } from '../../lib/qna'
import { HelpCircle, MessageSquareCode, Send, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const QnAThread = ({ productId, sellerId }) => {
  const { isLoggedIn, profile } = useAuth()
  const [qnaList, setQnaList] = useState([])
  const [questionText, setQuestionText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingQnA, setLoadingQnA] = useState(true)
  // For seller answering
  const [answeringId, setAnsweringId] = useState(null)
  const [answerText, setAnswerText] = useState('')

  const isSeller = isLoggedIn && profile?.id === sellerId

  useEffect(() => {
    const load = async () => {
      setLoadingQnA(true)
      const data = await getQnA(productId)
      setQnaList(data)
      setLoadingQnA(false)
    }
    load()
  }, [productId])

  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!questionText.trim()) return
    setLoading(true)
    const { data, error } = await askQuestion(productId, questionText.trim())
    setLoading(false)
    if (!error && data) {
      setQnaList((prev) => [...prev, data])
      setQuestionText('')
    }
  }

  const handleAnswer = async (qnaId) => {
    if (!answerText.trim()) return
    setLoading(true)
    const { data, error } = await answerQuestion(qnaId, answerText.trim())
    setLoading(false)
    if (!error && data) {
      setQnaList((prev) => prev.map((q) => (q.id === qnaId ? data : q)))
      setAnsweringId(null)
      setAnswerText('')
    }
  }

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 mt-6">
      <h3 className="font-bebas text-2xl tracking-wide text-[#F5F0E8] mb-6 flex items-center gap-2 pb-3 border-b border-zinc-800">
        <MessageSquareCode size={20} className="text-[#E8FF00]" />
        QUESTIONS & REPLIES
      </h3>

      {/* Ask Question Form */}
      <div className="mb-8">
        {isLoggedIn ? (
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              placeholder="ASK ABOUT CONDITION, FIT, SHIPPING..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              maxLength={500}
              className="flex-grow raw-input px-4 py-2.5 text-xs font-space uppercase bg-black border-[#333]"
            />
            <button
              type="submit"
              disabled={loading || !questionText.trim()}
              className="raw-btn bg-[#F5F0E8] text-black hover:bg-[#E8FF00] px-5 py-2.5 font-bold text-xs tracking-wider flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Send size={12} /> ASK</>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-black/30 border border-dashed border-zinc-800 p-4 text-center">
            <p className="font-space text-xs text-zinc-500 uppercase">
              <HelpCircle size={12} className="inline mr-1" />
              Log in to ask a question
            </p>
          </div>
        )}
      </div>

      {/* Thread List */}
      {loadingQnA ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-zinc-900 animate-pulse rounded" />
          ))}
        </div>
      ) : qnaList.length === 0 ? (
        <div className="text-center py-6">
          <p className="font-space text-xs text-zinc-600 italic uppercase">
            No questions yet. Be the first to inquire.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {qnaList.map((qna) => (
            <div key={qna.id} className="border-l-2 border-zinc-700 pl-4 space-y-3">
              {/* Question */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {qna.asker?.avatar_url ? (
                    <img src={qna.asker.avatar_url} alt={qna.asker.username} className="w-5 h-5 object-cover" />
                  ) : (
                    <div className="w-5 h-5 bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-500">
                      {qna.asker?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="font-space text-[10px] text-[#C8B8A2] uppercase">
                    @{qna.asker?.username || 'anonymous'} ·{' '}
                    {new Date(qna.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="font-space text-sm text-[#F5F0E8]">"{qna.question}"</p>
              </div>

              {/* Answer */}
              <div className="pl-4 border-l border-zinc-800/80 bg-black/10 p-2">
                {qna.answer ? (
                  <div>
                    <span className="font-space text-[10px] text-[#E8FF00] uppercase font-bold block mb-1">
                      A: SELLER REPLY
                      {qna.answered_at && (
                        <span className="font-mono text-[8px] text-zinc-600 ml-2">
                          {new Date(qna.answered_at).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </span>
                    <p className="font-space text-xs text-zinc-400">{qna.answer}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 py-1 text-zinc-600">
                      <ShieldAlert size={12} className="animate-pulse" />
                      <span className="font-space text-[10px] uppercase tracking-wider italic">
                        Awaiting seller reply...
                      </span>
                    </div>
                    {/* Seller can answer */}
                    {isSeller && (
                      <div className="mt-2">
                        {answeringId === qna.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Type your answer..."
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              maxLength={1000}
                              className="flex-grow raw-input px-3 py-1.5 text-xs font-space bg-black border-[#333]"
                            />
                            <button
                              onClick={() => handleAnswer(qna.id)}
                              disabled={loading || !answerText.trim()}
                              className="raw-btn bg-[#E8FF00] text-black px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                            >
                              POST
                            </button>
                            <button
                              onClick={() => { setAnsweringId(null); setAnswerText('') }}
                              className="raw-btn bg-zinc-800 text-zinc-400 px-3 py-1.5 text-xs"
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAnsweringId(qna.id)}
                            className="font-space text-[10px] text-[#E8FF00] uppercase tracking-wider hover:underline"
                          >
                            + Answer this question
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QnAThread
