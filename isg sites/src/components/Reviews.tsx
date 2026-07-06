/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Review, User } from '../types';

interface ReviewsProps {
  reviews: Review[];
  currentUser: User | null;
  onAddReview: (review: Review) => void;
  onOpenAuthModal: () => void;
}

export default function Reviews({
  reviews,
  currentUser,
  onAddReview,
  onOpenAuthModal
}: ReviewsProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  // Filter approved reviews for public display
  const approvedReviews = reviews.filter(r => r.isApproved !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!comment.trim()) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      name: currentUser.name,
      role: currentUser.role === 'uzman' ? 'İSG Uzmanı' : currentUser.role === 'hekim' ? 'İşyeri Hekimi' : 'Müşteri',
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      isApproved: currentUser.role === 'admin' ? true : false // Admin reviews are pre-approved, others go to moderation
    };

    onAddReview(newReview);
    setComment('');
    setRating(5);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <section id="reviews" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest rounded-full">
            Kullanıcı Deneyimleri
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Müşteri Yorumları & Değerlendirmeler
          </h3>
          <p className="text-base text-slate-600 leading-relaxed font-medium">
            Platformumuzu kullanan İSG uzmanları, işyeri hekimleri ve OSGB yöneticilerinin gerçek deneyimleri ve verdikleri puanlar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Reviews Grid (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {approvedReviews.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-white">
                Henüz onaylanmış bir değerlendirme bulunmuyor. İlk değerlendirmeyi siz yazın!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {approvedReviews.map((rev) => (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200"
                  >
                    <div className="space-y-3">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            size={14} 
                            fill={idx < rev.rating ? 'currentColor' : 'none'} 
                            className={idx < rev.rating ? 'text-amber-500' : 'text-slate-200'}
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-slate-600 font-semibold italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>

                    {/* Reviewer Details */}
                    <div className="flex items-center gap-3 border-t border-slate-100 pt-3.5 mt-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {rev.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{rev.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Feedback Form (4 Columns) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Feedback Gönderin</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Görüşleriniz Bizim İçin Değerli</p>
                </div>
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <span>
                    {currentUser?.role === 'admin' 
                      ? 'Geri bildiriminiz anında yayınlandı!' 
                      : 'Değerlendirmeniz yönetici onayına sunulmuştur.'}
                  </span>
                </div>
              )}

              {currentUser ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Interactive Star Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Puanınız</label>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const starVal = idx + 1;
                        const isFilled = hoverRating !== null ? starVal <= hoverRating : starVal <= rating;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setRating(starVal)}
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="text-amber-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                          >
                            <Star 
                              size={22} 
                              fill={isFilled ? 'currentColor' : 'none'} 
                              className={isFilled ? 'text-amber-500' : 'text-slate-300'}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Yorumunuz *</label>
                    <textarea
                      required rows={4}
                      value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Platform hakkındaki olumlu veya olumsuz deneyimlerinizi paylaşın..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <Send size={12} />
                    <span>Değerlendirmeyi Gönder</span>
                  </button>
                </form>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                    <AlertCircle size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Yorum Yazmak İçin Giriş Yapın</p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Sadece sisteme kayıtlı olan kullanıcılar puanlama yapabilir ve görüş bildirebilir.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAuthModal}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Giriş Yap veya Üye Ol
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
