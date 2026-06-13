import { supabase } from './supabase'
import toast from 'react-hot-toast'

// ── Get Q&A for a product ─────────────────────────────────────
export const getQnA = async (productId) => {
  const { data, error } = await supabase
    .from('qna')
    .select(`
      *,
      asker:profiles!asker_id(id, username, avatar_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getQnA error:', error)
    return []
  }
  return data || []
}

// ── Ask a Question ───────────────────────────────────────────
export const askQuestion = async (productId, question) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    toast.error('You must be logged in to ask a question.')
    return { data: null, error: 'not_authenticated' }
  }

  if (!question?.trim() || question.length > 500) {
    toast.error('Question must be between 1 and 500 characters.')
    return { data: null, error: 'invalid_input' }
  }

  const { data, error } = await supabase
    .from('qna')
    .insert({
      product_id: productId,
      asker_id: user.id,
      question: question.trim(),
    })
    .select(`
      *,
      asker:profiles!asker_id(id, username, avatar_url)
    `)
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { data: null, error }
  }

  // Notify seller
  const { data: product } = await supabase
    .from('products')
    .select('seller_id, title')
    .eq('id', productId)
    .single()

  if (product) {
    await supabase.from('notifications').insert({
      user_id: product.seller_id,
      type: 'new_question',
      message: `Someone asked a question on your listing "${product.title}"`,
      related_product_id: productId,
    })
  }

  toast.success('Question posted!')
  return { data, error: null }
}

// ── Answer a Question (seller only) ──────────────────────────
export const answerQuestion = async (qnaId, answer) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    toast.error('Not authenticated.')
    return { data: null, error: 'not_authenticated' }
  }

  if (!answer?.trim() || answer.length > 1000) {
    toast.error('Answer must be between 1 and 1000 characters.')
    return { data: null, error: 'invalid_input' }
  }

  const { data, error } = await supabase
    .from('qna')
    .update({
      answer: answer.trim(),
      answered_at: new Date().toISOString(),
    })
    .eq('id', qnaId)
    .select(`
      *,
      asker:profiles!asker_id(id, username, avatar_url)
    `)
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { data: null, error }
  }

  // Notify asker
  if (data?.asker_id) {
    await supabase.from('notifications').insert({
      user_id: data.asker_id,
      type: 'question_answered',
      message: `Your question was answered!`,
      related_product_id: data.product_id,
    })
  }

  toast.success('Answer posted!')
  return { data, error: null }
}
