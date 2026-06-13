import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrderById, confirmPayment, confirmShipment, confirmDelivery, raiseDispute } from '../lib/orders'
import Footer from '../components/ui/Footer'
import { motion } from 'framer-motion'
import {
  Copy, Check, Package, Truck, CheckCircle, AlertTriangle, Clock, ArrowLeft, QrCode
} from 'lucide-react'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'awaiting_payment', label: 'Awaiting Payment', icon: Clock },
  { key: 'payment_confirmed', label: 'Payment Confirmed', icon: Check },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

const stepIndex = (status) => STEPS.findIndex((s) => s.key === status)

const OrderPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [trackingInput, setTrackingInput] = useState('')
  const [showShipForm, setShowShipForm] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const load = async () => {
      setLoading(true)
      const data = await getOrderById(id)
      setOrder(data)
      setLoading(false)
    }
    load()
  }, [id])

  const copyUPI = () => {
    if (order?.upi_id_shared) {
      navigator.clipboard.writeText(order.upi_id_shared)
      setCopied(true)
      toast.success('UPI ID copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConfirmPayment = async () => {
    setActionLoading(true)
    const { error } = await confirmPayment(id)
    setActionLoading(false)
    if (!error) setOrder((prev) => ({ ...prev, order_status: 'payment_confirmed', buyer_confirmed_payment: true }))
  }

  const handleConfirmShipment = async () => {
    setActionLoading(true)
    const { error } = await confirmShipment(id, trackingInput)
    setActionLoading(false)
    if (!error) {
      setOrder((prev) => ({ ...prev, order_status: 'shipped', tracking_info: trackingInput }))
      setShowShipForm(false)
    }
  }

  const handleConfirmDelivery = async () => {
    setActionLoading(true)
    const { error } = await confirmDelivery(id)
    setActionLoading(false)
    if (!error) setOrder((prev) => ({ ...prev, order_status: 'delivered' }))
  }

  const handleDispute = async () => {
    if (!window.confirm('Are you sure you want to raise a dispute? Admin will review this order.')) return
    setActionLoading(true)
    const { error } = await raiseDispute(id)
    setActionLoading(false)
    if (!error) setOrder((prev) => ({ ...prev, order_status: 'disputed' }))
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0D0D0D] flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-2 border-[#E8FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="w-full min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center pt-24 text-center p-6">
        <h2 className="font-bebas text-5xl text-red-500 mb-4">ORDER NOT FOUND</h2>
        <button onClick={() => navigate('/')} className="raw-btn bg-[#E8FF00] text-black px-6 py-3 text-xs font-bold tracking-widest">
          BACK HOME
        </button>
      </div>
    )
  }

  const isBuyer = profile?.id === order.buyer_id
  const isSeller = profile?.id === order.seller_id
  const currentStep = stepIndex(order.order_status)
  const isDisputed = order.order_status === 'disputed'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col pt-24"
    >
      <div className="max-w-3xl mx-auto px-4 md:px-8 flex-grow w-full py-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 font-space text-xs text-zinc-400 hover:text-[#E8FF00] transition-colors mb-8 uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package size={20} className="text-[#E8FF00]" />
            <span className="font-bebas text-3xl tracking-wide text-[#F5F0E8]">ORDER DETAILS</span>
          </div>
          <p className="font-space text-[10px] text-zinc-600 uppercase tracking-wider">
            Order ID: {order.id}
          </p>
        </div>

        {/* Product Card */}
        {order.product && (
          <div className="flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#2A2A2A] mb-8">
            {order.product.images?.[0] && (
              <img src={order.product.images[0]} alt={order.product.title} className="w-20 h-20 object-cover" />
            )}
            <div>
              <span className="font-space text-[10px] text-zinc-500 uppercase">{order.product.brand}</span>
              <p className="font-bebas text-2xl text-[#F5F0E8]">{order.product.title}</p>
              <p className="font-mono text-xl text-[#E8FF00] font-black">
                ₹{order.final_amount?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        {/* Status Stepper */}
        {!isDisputed ? (
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-800 z-0" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-[#E8FF00] z-0 transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStep / (STEPS.length - 1)) * 100)}%` }}
              />
              {STEPS.map((step, i) => {
                const Icon = step.icon
                const isDone = i <= currentStep
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 z-10 relative">
                    <div
                      className={`w-8 h-8 border-2 flex items-center justify-center transition-all ${
                        isDone ? 'bg-[#E8FF00] border-[#E8FF00]' : 'bg-[#0D0D0D] border-zinc-700'
                      }`}
                    >
                      <Icon size={14} className={isDone ? 'text-black' : 'text-zinc-600'} />
                    </div>
                    <span className={`font-space text-[9px] uppercase tracking-wider text-center max-w-[70px] ${
                      isDone ? 'text-[#E8FF00]' : 'text-zinc-600'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-red-950/30 border border-red-900/40 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <div>
              <p className="font-bebas text-xl text-red-400">DISPUTE RAISED</p>
              <p className="font-space text-xs text-zinc-500">Admin has been notified and will review this order.</p>
            </div>
          </div>
        )}

        {/* Action Panel */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 space-y-6">

          {/* AWAITING PAYMENT — Buyer sees UPI details */}
          {order.order_status === 'awaiting_payment' && isBuyer && (
            <div className="space-y-4">
              <h3 className="font-bebas text-2xl text-[#F5F0E8] tracking-wide">COMPLETE PAYMENT</h3>
              <p className="font-space text-xs text-zinc-400 uppercase">
                Send ₹{order.final_amount?.toLocaleString('en-IN')} to the seller via UPI
              </p>

              {order.upi_id_shared && (
                <div className="bg-black/40 border border-zinc-800 p-4">
                  <span className="font-space text-[10px] text-zinc-500 uppercase block mb-2">UPI ID</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg text-[#F5F0E8] font-bold">{order.upi_id_shared}</span>
                    <button
                      onClick={copyUPI}
                      className="flex items-center gap-1 font-space text-[10px] text-[#E8FF00] uppercase hover:underline"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                </div>
              )}

              {order.upi_qr_shared && (
                <div className="bg-black/40 border border-zinc-800 p-4 text-center">
                  <span className="font-space text-[10px] text-zinc-500 uppercase block mb-3 flex items-center justify-center gap-1">
                    <QrCode size={12} /> QR CODE
                  </span>
                  <img
                    src={order.upi_qr_shared}
                    alt="UPI QR Code"
                    className="w-48 h-48 mx-auto object-contain"
                  />
                </div>
              )}

              <button
                onClick={handleConfirmPayment}
                disabled={actionLoading}
                className="w-full raw-btn py-3 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Check size={16} /> I HAVE PAID</>
                )}
              </button>
            </div>
          )}

          {/* AWAITING PAYMENT — Seller sees waiting message */}
          {order.order_status === 'awaiting_payment' && isSeller && (
            <div className="text-center py-4">
              <Clock size={32} className="text-zinc-600 mx-auto mb-3" />
              <p className="font-bebas text-2xl text-zinc-400">WAITING FOR PAYMENT</p>
              <p className="font-space text-xs text-zinc-600 mt-2">
                Buyer will be notified to send payment to your UPI ID.
              </p>
            </div>
          )}

          {/* PAYMENT CONFIRMED — Seller can mark shipped */}
          {order.order_status === 'payment_confirmed' && isSeller && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <Check size={20} />
                <p className="font-bebas text-2xl">PAYMENT RECEIVED</p>
              </div>
              <p className="font-space text-xs text-zinc-400">Please ship the item and add tracking information.</p>

              {!showShipForm ? (
                <button
                  onClick={() => setShowShipForm(true)}
                  className="w-full raw-btn py-3 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <Truck size={16} /> MARK AS SHIPPED
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tracking number or courier name (optional)"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="w-full raw-input px-4 py-2.5 text-sm font-space"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmShipment}
                      disabled={actionLoading}
                      className="flex-1 raw-btn py-2.5 bg-[#E8FF00] text-black font-bold tracking-widest text-sm disabled:opacity-50"
                    >
                      CONFIRM SHIPMENT
                    </button>
                    <button
                      onClick={() => setShowShipForm(false)}
                      className="raw-btn px-4 py-2.5 bg-zinc-800 text-zinc-400 text-sm"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAYMENT CONFIRMED — Buyer sees waiting */}
          {order.order_status === 'payment_confirmed' && isBuyer && (
            <div className="text-center py-4">
              <Check size={32} className="text-green-400 mx-auto mb-3" />
              <p className="font-bebas text-2xl text-green-400">PAYMENT CONFIRMED ✅</p>
              <p className="font-space text-xs text-zinc-600 mt-2">Seller is preparing your shipment.</p>
            </div>
          )}

          {/* SHIPPED — Buyer can confirm delivery */}
          {order.order_status === 'shipped' && isBuyer && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#E8FF00]">
                <Truck size={20} />
                <p className="font-bebas text-2xl">ITEM SHIPPED!</p>
              </div>
              {order.tracking_info && (
                <div className="bg-black/40 border border-zinc-800 p-3">
                  <span className="font-space text-[10px] text-zinc-500 uppercase block mb-1">TRACKING INFO</span>
                  <p className="font-mono text-sm text-[#F5F0E8]">{order.tracking_info}</p>
                </div>
              )}
              <button
                onClick={handleConfirmDelivery}
                disabled={actionLoading}
                className="w-full raw-btn py-3 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} /> CONFIRM DELIVERY
              </button>
            </div>
          )}

          {/* SHIPPED — Seller sees tracking added */}
          {order.order_status === 'shipped' && isSeller && (
            <div className="text-center py-4">
              <Truck size={32} className="text-[#E8FF00] mx-auto mb-3" />
              <p className="font-bebas text-2xl text-[#E8FF00]">SHIPMENT CONFIRMED</p>
              <p className="font-space text-xs text-zinc-600 mt-2">Waiting for buyer to confirm delivery.</p>
            </div>
          )}

          {/* DELIVERED */}
          {order.order_status === 'delivered' && (
            <div className="text-center py-6">
              <CheckCircle size={40} className="text-[#E8FF00] mx-auto mb-4" />
              <p className="font-bebas text-3xl text-[#E8FF00]">ORDER COMPLETE 🔥</p>
              <p className="font-space text-xs text-zinc-500 mt-2">This transaction has been successfully completed.</p>
            </div>
          )}

          {/* Dispute button (both buyer and seller, unless already delivered/disputed) */}
          {!['delivered', 'disputed'].includes(order.order_status) && (isBuyer || isSeller) && (
            <div className="border-t border-zinc-800 pt-4">
              <button
                onClick={handleDispute}
                disabled={actionLoading}
                className="flex items-center gap-2 font-space text-xs text-red-500 hover:text-red-400 uppercase tracking-wider transition-colors"
              >
                <AlertTriangle size={14} /> Raise a Dispute
              </button>
            </div>
          )}
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[
            { label: 'BUYER', user: order.buyer },
            { label: 'SELLER', user: order.seller },
          ].map(({ label, user }) => (
            user && (
              <div key={label} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A]">
                <span className="font-space text-[9px] text-zinc-600 uppercase block mb-2">{label}</span>
                <div className="flex items-center gap-2">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-8 h-8 object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="font-space text-sm text-[#F5F0E8]">@{user.username}</span>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

export default OrderPage
