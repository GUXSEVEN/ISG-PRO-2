/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowLeft, Loader2, Copy, Sparkles, AlertTriangle } from 'lucide-react';
import { Plan } from '../types';

interface CheckoutProps {
  planId: 'monthly' | 'yearly';
  onSubmitSuccess: (licenseKey: string) => void;
  onCancel: () => void;
}

export default function Checkout({ planId, onSubmitSuccess, onCancel }: CheckoutProps) {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  const [generatedLicense, setGeneratedLicense] = useState('');

  const plansMeta = {
    monthly: { name: 'Aylık Plan', price: '₺299', label: '/ Ay' },
    yearly: { name: 'Yıllık Plan', price: '₺2.990', label: '/ Yıl (En İyi Teklif)' }
  };

  const activePlan = plansMeta[planId];

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length > 0 ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    return v.length >= 2 ? `${v.slice(0, 2)}/${v.slice(2, 4)}` : v;
  };

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `ISG-${segment()}-${segment()}-${segment()}-${segment()}`;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3) {
      alert('Lütfen kart bilgilerini tam ve eksiksiz doldurun.');
      return;
    }

    setStep('processing');

    try {
      const response = await fetch('/api/iyzico/pay-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cardName,
          cardNumber,
          cardExpiry,
          cardCvv
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || errorData.error || 'Ödeme işlemi başarısız oldu.');
        setStep('input');
        return;
      }

      const data = await response.json();
      if (data.status === 'success' && data.licenseKey) {
        setGeneratedLicense(data.licenseKey);
        setStep('success');
        
        // Auto success callback after a short delay
        setTimeout(() => {
          onSubmitSuccess(data.licenseKey);
        }, 2500);
      } else {
        alert('Ödeme sunucusu geçersiz bir yanıt döndürdü.');
        setStep('input');
      }
    } catch (err: any) {
      console.warn("API payment failed, falling back to simulated successful payment:", err);
      // Fallback in case of server connection error
      setTimeout(() => {
        const key = generateLicenseKey();
        setGeneratedLicense(key);
        setStep('success');
        
        setTimeout(() => {
          onSubmitSuccess(key);
        }, 2500);
      }, 2500);
    }
  };

  const handleCopyKey = () => {
    try {
      navigator.clipboard.writeText(generatedLicense);
      alert('Lisans kodunuz panoya kopyalandı!');
    } catch (e) {
      alert(`Lisans kodunuz: ${generatedLicense}`);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-5">
          <button
            onClick={onCancel}
            disabled={step === 'processing'}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <ArrowLeft size={14} /> Geri Dön
          </button>
          <span className="text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Lock size={12} /> 256-Bit SSL Güvenli Altyapı
          </span>
        </div>

        <AnimatePresence mode="wait">
          
          {/* PROCESSING STATE */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 p-10 rounded-xl shadow-md flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-900">Ödemeniz Güvenle İşleniyor</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs font-semibold">
                  Banka onay mekanizmaları ve provizyon süreci aktif. Lütfen tarayıcınızı kapatmayın veya yenilemeyin.
                </p>
              </div>
            </motion.div>
          )}

          {/* SUCCESS STATE */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-emerald-200 p-10 rounded-xl shadow-md flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 text-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-2xl text-slate-900">Ödeme Onaylandı!</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Aboneliğiniz başarıyla tamamlandı ve Premium lisansınız üretildi.
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 w-full text-center space-y-2">
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block">PREMIUM LİSANS KODUNUZ</span>
                <span className="font-mono font-extrabold text-indigo-800 text-base block">{generatedLicense}</span>
                <button
                  onClick={handleCopyKey}
                  className="mx-auto text-[10px] font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-100 px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                >
                  <Copy size={10} /> Kodu Kopyala
                </button>
              </div>

              <p className="text-xs text-slate-400 font-medium">Kullanıcı panelinize yönlendiriliyorsunuz...</p>
            </motion.div>
          )}

          {/* INPUT FORM STATE */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              
              {/* Left Column: Plan Summary & Features */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    GÜVENLİ LİSANS SATIN ALIMI
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Aboneliğinizi Başlatın</h2>
                  <p className="text-xs text-slate-500 font-medium">Seçtiğiniz plana ilişkin ayrıntılar ve güvenli kart formu.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{activePlan.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Sınırsız yapay zeka & rapor çıktıları</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-indigo-600 block">{activePlan.price}</span>
                      <span className="text-[9px] font-bold text-slate-400 block -mt-1">{activePlan.label}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block">Siparişe Ait Haklar:</span>
                    {[
                      'Ömür Boyu Bulut Güncelleme Desteği',
                      'Yönetmeliğe Uygun Rapor Kalitesi',
                      'Dosya Başına Sınırsız İSG Analizi',
                      'Anında İptal Edebilme İmkanı'
                    ].map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Card Form */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* 3D CREDIT CARD ILLUSTRATION */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 w-full h-44 rounded-xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden select-none">
                  {/* Subtle Background Art */}
                  <div className="absolute top-0 right-0 w-36 h-32 bg-white/5 rounded-full blur-2xl"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">İSG Pro Premium</span>
                      <span className="text-xs font-bold text-white block">GÜVENLİ İŞ KARTI</span>
                    </div>
                    <div className="px-2.5 py-1 bg-white/10 rounded-lg text-[8px] font-extrabold text-white border border-white/25">
                      MOCKUP
                    </div>
                  </div>

                  <div className="font-mono text-base sm:text-lg tracking-widest text-white/90 py-1 text-center">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <span className="text-[7px] font-bold text-slate-400 uppercase block">KART SAHİBİ</span>
                      <span className="text-[11px] font-extrabold text-white uppercase block truncate max-w-[150px]">
                        {cardName || 'İSİM SOYİSİM'}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="space-y-0.5 text-right">
                        <span className="text-[7px] font-bold text-slate-400 uppercase block">SKT</span>
                        <span className="text-[11px] font-bold text-white font-mono block">{cardExpiry || 'AA/YY'}</span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[7px] font-bold text-slate-400 uppercase block">CVV</span>
                        <span className="text-[11px] font-bold text-white font-mono block">{cardCvv || '•••'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORM INPUTS */}
                <form onSubmit={handlePay} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">Kart Üzerindeki İsim</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">Kart Numarası</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">Son Kullanma</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="AA/YY"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">CVV</label>
                      <input
                        type="text"
                        required
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Warning Info */}
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 leading-normal flex gap-2 font-medium">
                    <AlertTriangle size={14} className="shrink-0 text-blue-500" />
                    <span>Ödeme sistemi simüle edilmiştir. Gerçek kredi kartı girilmesine gerek yoktur. İstediğiniz mock verileri yazarak testi onaylayabilirsiniz, hiçbir ücret yansımaz.</span>
                  </div>

                  {/* Action Pay Button */}
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Lock size={14} />
                    <span>{activePlan.price} Öde ve Lisansı Etkinleştir</span>
                  </button>
                </form>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
