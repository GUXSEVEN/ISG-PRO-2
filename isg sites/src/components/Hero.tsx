/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Play, ArrowRight, Sparkles, Building2, Download, CheckCircle, FileSpreadsheet, X, HelpCircle } from 'lucide-react';
import { SiteConfig } from '../types';

interface HeroProps {
  onExploreClick: () => void;
  onPlaygroundClick: () => void;
  siteConfig: SiteConfig;
}

export default function Hero({ onExploreClick, onPlaygroundClick, siteConfig }: HeroProps) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section className="relative py-12 md:py-20 overflow-hidden bg-transparent">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse duration-[6s]"></div>
      <div className="absolute top-1/2 right-1/10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -z-10 animate-pulse duration-[8s]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm"
            >
              <span>Yapay Zeka Destekli Yeni Nesil İSG Dönemi</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
            >
              {siteConfig.heroTitle}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-semibold"
            >
              {siteConfig.heroSubtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <button
                onClick={onExploreClick}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Hemen Lisans Al</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={onPlaygroundClick}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play size={14} className="fill-slate-700 text-slate-700" />
                <span>Canlı Demoyu Dene</span>
              </button>
              <button
                onClick={() => setVideoModalOpen(true)}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play size={14} className="fill-red-700 text-red-700" />
                <span>Tanıtım Videosu</span>
              </button>
            </motion.div>

            {/* Key Value Highlights */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-left"
            >
              <div>
                <p className="text-2xl font-extrabold text-indigo-600">%85</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Zaman Tasarrufu</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-purple-600">A4</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Yönetmeliğe Uygun</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-emerald-600">5x5 / FK</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Çoklu Metot</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Mockup Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="lg:col-span-6 relative"
          >
            {/* Mockup Frame */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl p-4 md:p-6 overflow-hidden max-w-lg mx-auto relative">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono ml-2">isg_pro_saha_takip_raporu.pdf</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[9px] font-extrabold text-indigo-600 uppercase">
                  <CheckCircle size={10} /> ÇIKTIYA HAZIR
                </div>
              </div>

              {/* Demo Application Graphic */}
              <div className="space-y-4">
                {/* Simulated Doc Header */}
                <div className="border border-slate-900 px-3 py-1.5 rounded-lg flex items-center justify-between text-[9px] font-extrabold bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-indigo-600" />
                    <span>Örnek Yapı ve İnşaat A.Ş.</span>
                  </div>
                  <span className="text-[8px] bg-red-100 text-red-700 px-2 py-0.5 rounded">Çok Tehlikeli</span>
                </div>

                {/* Simulated Table Rows */}
                <div className="space-y-2.5">
                  <div className="bg-red-50/60 p-3 rounded-2xl border border-red-100/80 flex justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="bg-red-600 text-white font-mono font-bold text-[8px] px-1 rounded">25</span>
                        <h4 className="font-extrabold text-slate-800 text-[11px]">Yüksekte Çalışma İskele Uygunsuzluğu</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">Korkuluksuz iskelede emniyet kemersiz çalışma.</p>
                      <p className="text-[10px] text-green-700 font-bold mt-1">Önlem: TS EN 12811 uygun iskele ve yaşam hattı.</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-400">FOTO</div>
                  </div>

                  <div className="bg-yellow-50/60 p-3 rounded-2xl border border-yellow-100/80 flex justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="bg-yellow-500 text-white font-mono font-bold text-[8px] px-1 rounded">12</span>
                        <h4 className="font-extrabold text-slate-800 text-[11px]">Elektrik Panosu Açık İletkenler</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">Kilitleri kırılmış olan ana dağıtım panosu.</p>
                      <p className="text-[10px] text-green-700 font-bold mt-1">Önlem: Pano kapak kilitlenmesi ve yalıtkan paspas.</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-400">FOTO</div>
                  </div>
                </div>

                {/* Team Signatures Section */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/30 flex justify-between gap-2 text-[8px] font-bold text-slate-500">
                  <div className="text-center flex-1">
                    <div className="bg-slate-100 p-0.5 rounded text-[7px] uppercase mb-0.5">İSG Uzmanı</div>
                    <p className="text-slate-700">Ali Yılmaz</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="bg-slate-100 p-0.5 rounded text-[7px] uppercase mb-0.5">İşyeri Hekimi</div>
                    <p className="text-slate-700">Zeynep Kaya</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="bg-slate-100 p-0.5 rounded text-[7px] uppercase mb-0.5">İşveren Vekili</div>
                    <p className="text-slate-700">Ahmet Şahin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Badges */}
            <div className="absolute -bottom-5 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce duration-[4s] select-none max-w-[160px]">
              <div className="p-1 bg-white/20 rounded-lg shrink-0"><Download size={14} /></div>
              <div>
                <span className="block text-[10px] font-bold text-indigo-200 uppercase">RAPORLAMA</span>
                <span className="block text-xs font-extrabold">Tek Tıkla Hazır</span>
              </div>
            </div>

            <div className="absolute -top-5 -left-4 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2.5 select-none max-w-[150px]">
              <div className="p-1 bg-white/20 rounded-lg shrink-0"><FileSpreadsheet size={14} /></div>
              <div>
                <span className="block text-[10px] font-bold text-emerald-200 uppercase">Excel Aktarım</span>
                <span className="block text-xs font-extrabold">Şablon Uyumlu</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative"
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-900/60 text-white hover:bg-slate-900 rounded-lg transition-all z-10 cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="aspect-video w-full">
                <iframe
                  src={siteConfig.videoUrl}
                  title="İSG Pro Tanıtım Videosu"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
