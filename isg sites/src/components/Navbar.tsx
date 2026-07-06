/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, User, LogOut, Menu, X, LayoutDashboard, CreditCard, Sparkles, Settings } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  onLogout: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onOpenAuthModal: () => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  activeSection,
  onSectionChange,
  onOpenAuthModal,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Ana Sayfa' },
    { id: 'features', label: 'Özellikler' },
    { id: 'playground', label: 'AI Oyun Alanı' },
    { id: 'pricing', label: 'Fiyatlandırma' },
    { id: 'contact', label: 'İletişim' },
    { id: 'downloads', label: 'Uygulamayı İndir' },
  ];

  const handleNavClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setMobileMenuOpen(false);
    if (sectionId !== 'downloads' && sectionId !== 'admin' && sectionId !== 'dashboard') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm h-16 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">İSG Pro</span>
              <span className="text-[10px] font-medium text-slate-500 block -mt-1">Yapay Zeka Destekli Platform</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-colors select-none ${
                  activeSection === item.id 
                    ? 'text-indigo-600' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full" 
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Desktop User Panel */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {(currentUser.role === 'admin' || currentUser.username === 'admin') && (
                  <button
                    onClick={() => onSectionChange('admin')}
                    className={`flex items-center gap-1.5 text-xs font-bold border rounded-lg px-3 py-2 transition-all cursor-pointer ${
                      activeSection === 'admin'
                        ? 'bg-red-600 border-red-600 text-white shadow-md'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                    }`}
                  >
                    <Settings size={14} />
                    <span>Sistem Yönetimi</span>
                  </button>
                )}
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center gap-1.5 text-xs font-semibold border rounded-lg px-3 py-2 transition-all cursor-pointer ${
                    activeSection === 'dashboard'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border-slate-200'
                  }`}
                >
                  <LayoutDashboard size={14} />
                  <span>Panelim</span>
                  {currentUser.isPremium ? (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
                      PRO
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
                      DEMO
                    </span>
                  )}
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  title="Çıkış Yap"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <User size={14} />
                Giriş Yap / Kayıt Ol
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-slate-100 shadow-lg overflow-hidden absolute top-16 left-0 right-0 z-30"
          >
            <div className="px-4 pt-2 pb-6 space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeSection === item.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                {currentUser ? (
                  <>
                    {(currentUser.role === 'admin' || currentUser.username === 'admin') && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onSectionChange('admin');
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-bold text-left transition-all ${
                          activeSection === 'admin'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <Settings size={16} />
                        <span>Sistem Yönetimi (Yönetici)</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard size={16} />
                        <span>Müşteri Panelim</span>
                      </div>
                      {currentUser.isPremium ? (
                        <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider">
                          PRO LİSANS
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider">
                          DEMO SÜRÜM
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold text-left"
                    >
                      <LogOut size={16} />
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-extrabold shadow-md transition-all flex items-center gap-2"
                  >
                    <User size={16} />
                    Giriş Yap / Kayıt Ol
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
