import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getQnAForProduct, askQuestion } from '../../data/bids';
import { users } from '../../data/users';
import { HelpCircle, MessageSquareCode, Send, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QnAThread = ({ productId }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const [qnaList, setQnaList] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    setQnaList(getQnAForProduct(productId));
  }, [productId]);

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    // TODO: API call to register question in Supabase
    const updatedQnA = askQuestion(productId, currentUser.id, questionText.trim());
    setQnaList(updatedQnA);
    setQuestionText('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const getUserHandle = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'anonymous';
  };

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
              placeholder="ASK SELLER ABOUT CONDITION, FIT, SHIPPING..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="flex-grow raw-input px-4 py-2.5 text-xs font-space uppercase bg-black border-[#333]"
            />
            <button
              type="submit"
              className="raw-btn bg-[#F5F0E8] text-black hover:bg-[#E8FF00] px-5 py-2.5 font-bold text-xs tracking-wider flex items-center gap-1.5 shrink-0"
            >
              <Send size={12} />
              ASK FIT
            </button>
          </form>
        ) : (
          <div className="bg-black/30 border border-dashed border-zinc-800 p-4 text-center">
            <p className="font-space text-xs text-zinc-500 uppercase">
              You must be logged in to ask a question.
            </p>
          </div>
        )}

        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-[10px] font-space text-[#E8FF00] uppercase tracking-wider"
            >
              Question posted! Awaiting seller response.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thread List */}
      {qnaList.length === 0 ? (
        <div className="text-center py-6">
          <p className="font-space text-xs text-zinc-600 italic uppercase">
            No questions asked yet. Be the first to inquire.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {qnaList.map((qna, idx) => (
            <div key={idx} className="border-l-2 border-zinc-700 pl-4 space-y-3">
              {/* Question */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-space text-[10px] text-[#C8B8A2] uppercase">
                    Q: @{getUserHandle(qna.questionBy)}
                  </span>
                </div>
                <p className="font-space text-sm text-[#F5F0E8]">
                  "{qna.question}"
                </p>
              </div>

              {/* Reply */}
              <div className="pl-4 border-l border-zinc-800/80 bg-black/10 p-2 border border-zinc-800/20">
                {qna.answer ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-space text-[10px] text-[#E8FF00] uppercase font-bold">
                        A: SELLER REPLY
                      </span>
                      {qna.answeredAt && (
                        <span className="font-mono text-[8px] text-zinc-600">
                          {qna.answeredAt}
                        </span>
                      )}
                    </div>
                    <p className="font-space text-xs text-zinc-400">
                      {qna.answer}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 py-1 text-zinc-600">
                    <ShieldAlert size={12} className="animate-pulse" />
                    <span className="font-space text-[10px] uppercase tracking-wider italic">
                      Awaiting seller reply...
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QnAThread;
