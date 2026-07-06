/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FAQItem } from '../types';

interface FAQProps {
  faqs: FAQItem[];
}

export default function FAQ({ faqs }: FAQProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest rounded-full">
            Bilgi Merkezi
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sıkça Sorulan Sorular
          </h3>
          <p className="text-base text-slate-600 leading-relaxed font-medium">
            İSG Pro platformu, yapay zeka modülleri, lisanslama ve denetim uyumluluğu hakkında merak ettiğiniz tüm soruların yanıtları.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-10">Sorular hazırlanıyor...</p>
          ) : (
            faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md bg-slate-50/20"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-900 text-sm sm:text-base cursor-pointer bg-white"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle size={18} className="text-indigo-600 shrink-0" />
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-500 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-5 border-t border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
