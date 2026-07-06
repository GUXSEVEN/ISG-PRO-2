/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User as UserType, ContactMessage } from '../types';
import { 
  User, KeyRound, Clock, Mail, ShieldCheck, CreditCard, Sparkles, Copy, 
  Settings, RefreshCcw, Save, MessageSquare, Trash2, ArrowUpRight, HelpCircle,
  Loader2, CheckCircle2, ShieldAlert
} from 'lucide-react';

interface DashboardProps {
  currentUser: UserType;
  onUpdateProfile: (updatedFields: Partial<UserType>) => Promise<any>;
}

export default function Dashboard({ currentUser, onUpdateProfile }: DashboardProps) {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [role, setRole] = useState(currentUser.role || 'uzman');
  const [certificateNo, setCertificateNo] = useState(currentUser.certificateNo || '');
  
  const [myEmails, setMyEmails] = useState<ContactMessage[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password update states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (oldPassword !== currentUser.password) {
      setPasswordError('Mevcut şifreniz hatalı.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler uyuşmuyor.');
      return;
    }

    const result = await onUpdateProfile({ password: newPassword });
    if (result && result.success) {
      setPasswordSuccess('Şifreniz başarıyla güncellendi!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangingPassword(false);
    } else {
      setPasswordError('Şifre güncellenirken bir hata oluştu.');
    }
  };

  // Fetch simulated messages sent by this user from server
  const fetchMyEmails = async () => {
    if (!currentUser.email) return;
    setLoadingEmails(true);
    try {
      const response = await fetch(`/api/my-emails?email=${encodeURIComponent(currentUser.email)}`);
      if (response.ok) {
        const data = await response.json();
        setMyEmails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmails(false);
    }
  };

  useEffect(() => {
    fetchMyEmails();
  }, [currentUser.email]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onUpdateProfile({
      name,
      email,
      phone,
      role,
      certificateNo
    });

    if (result.success) {
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleCopyLicense = () => {
    if (currentUser.licenseKey) {
      try {
        navigator.clipboard.writeText(currentUser.licenseKey);
        alert('Lisans kodunuz panoya kopyalandı!');
      } catch (err) {
        alert(`Lisans kodunuz: ${currentUser.licenseKey}`);
      }
    }
  };

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  // Simulated purchase history list
  const receipts = currentUser.isPremium ? [
    {
      id: `RCP-${(currentUser.licenseKey || '1111').slice(4, 8)}`,
      date: currentUser.licensePurchasedAt || new Date().toISOString(),
      amount: currentUser.licenseType === 'yearly' ? '₺2.990,00' : '₺299,00',
      plan: currentUser.licenseType === 'yearly' ? 'Yıllık Pro Lisans' : 'Aylık Pro Lisans',
      method: 'Kredi Kartı (Simüle)',
      status: 'Ödendi'
    }
  ] : [];

  return (
    <section id="dashboard" className="py-12 md:py-20 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Müşteri Portalım</h2>
            <p className="text-xs text-slate-500 font-medium">Lisans bilgilerinizi kontrol edin, profilinizi güncelleyin ve destek taleplerinizi takip edin.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400 font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
            Sistem Saati: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: LICENSE & STATS DASHBOARD (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active License Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Lisans Durumum</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Abonelik & Yetki</p>
                  </div>
                </div>

                {currentUser.isPremium ? (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm border border-emerald-200/50">
                    <Sparkles size={11} className="animate-pulse" /> PREMIUM AKTİF
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border border-amber-200/50">
                    KAPSAM: DENEME (DEMO)
                  </span>
                )}
              </div>

              {currentUser.isPremium && currentUser.licenseKey ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-center sm:text-left">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide block">Lisans Kodu</span>
                      <span className="font-mono font-extrabold text-indigo-800 text-sm tracking-wide">{currentUser.licenseKey}</span>
                    </div>
                    <button
                      onClick={handleCopyLicense}
                      className="px-4 py-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
                    >
                      <Copy size={12} /> Kopyala
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-600 pt-2">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Satın Alma</span>
                      <span className="text-slate-800 font-bold">{formatDate(currentUser.licensePurchasedAt)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Bitiş Tarihi</span>
                      <span className="text-red-600 font-bold">{formatDate(currentUser.licenseExpiresAt)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Plan Tipi</span>
                      <span className="capitalize text-slate-800 font-bold">{currentUser.licenseType === 'yearly' ? 'Yıllık Plan' : 'Aylık Plan'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Şu anda platformu <strong>Deneme Sürümü (Demo)</strong> olarak kullanıyorsunuz. 
                    Deneme sürümünde haftalık rapor çıktısı limitiniz 3, yapay zeka analiz limitiniz ise günlük 5 adettir.
                  </p>
                  <a
                    href="#pricing"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-lg transition-all shadow shadow-indigo-600/10 active:scale-95 cursor-pointer"
                  >
                    <span>Şimdi Lisans Al ve Sınırları Kaldır</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* Simulated Sent Emails Inbox */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Gönderdiğim Destek / İletişim E-Postaları</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Müşteri Destek Geçmişi</p>
                  </div>
                </div>
                <button 
                  onClick={fetchMyEmails}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                  title="Mesajları Yenile"
                >
                  <RefreshCcw size={14} />
                </button>
              </div>

              {loadingEmails ? (
                <div className="py-10 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                  <span>Kutunuz kontrol ediliyor...</span>
                </div>
              ) : myEmails.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                  <Mail size={32} className="opacity-25 text-slate-400" />
                  <p className="font-bold text-slate-700">Henüz hiç destek veya iletişim mesajınız yok.</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Bize ulaşmak için aşağıdaki iletişim formunu kullanabilirsiniz.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {myEmails.map((msg) => (
                    <div key={msg.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl transition-all space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase bg-white border border-slate-200 px-2 py-0.5 rounded-lg">{msg.subject}</span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-1">{formatDate(msg.sentAt)}</span>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          msg.status === 'Beklemede' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed bg-white p-2.5 border border-slate-200 rounded-lg whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase History */}
            {receipts.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Ödeme ve Fatura Geçmişim</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Finansal Kayıtlar</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-600 font-semibold">
                    <thead>
                      <tr className="text-slate-400 uppercase tracking-wider text-[9px] border-b pb-2">
                        <th className="text-left py-2 font-bold">Fatura ID</th>
                        <th className="text-left py-2 font-bold">Tarih</th>
                        <th className="text-left py-2 font-bold">Plan</th>
                        <th className="text-right py-2 font-bold">Tutar</th>
                        <th className="text-right py-2 font-bold">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {receipts.map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-mono font-bold text-slate-700">{rec.id}</td>
                          <td className="py-2.5">{formatDate(rec.date)}</td>
                          <td className="py-2.5 font-bold text-slate-800">{rec.plan}</td>
                          <td className="py-2.5 text-right font-bold text-indigo-700">{rec.amount}</td>
                          <td className="py-2.5 text-right">
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">{rec.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: PROFILE MANAGEMENT & SETTINGS (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Profil Bilgileri Kartı */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
                    <Settings size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Profil Ayarlarım</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">İSG Bilgileri Düzenleme</p>
                  </div>
                </div>

                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-all active:scale-95 cursor-pointer"
                  >
                    Düzenle
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditing(false); setName(currentUser.name); setEmail(currentUser.email); setPhone(currentUser.phone); setRole(currentUser.role); setCertificateNo(currentUser.certificateNo || ''); }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold text-red-600 transition-all active:scale-95 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Profil bilgileriniz başarıyla güncellendi!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-200 text-indigo-500 shadow-sm relative">
                    <User size={36} />
                    <span className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Ad Soyad</label>
                  <input
                    type="text" required
                    disabled={!editing}
                    className="mt-1 w-full p-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Kullanıcı Adı (Benzersiz)</label>
                  <input
                    type="text" disabled
                    className="mt-1 w-full p-2.5 border border-slate-200 bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold outline-none text-slate-500 cursor-not-allowed font-mono"
                    value={`@${currentUser.username}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">E-Posta</label>
                    <input
                      type="email" required
                      disabled={!editing}
                      className="mt-1 w-full p-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
                      value={email} onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Telefon</label>
                    <input
                      type="tel" required
                      disabled={!editing}
                      className="mt-1 w-full p-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
                      value={phone} onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200 pb-1 mb-1">Mesleki Yetkilendirme</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">İSG Rolü</label>
                      <select
                        disabled={!editing}
                        className="mt-1 w-full p-2.5 border border-slate-200 bg-white rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
                        value={role} onChange={e => setRole(e.target.value as any)}
                      >
                        <option value="uzman">İş Güvenliği Uzmanı</option>
                        <option value="hekim">İşyeri Hekimi</option>
                        <option value="other">Diğer / Yönetici</option>
                      </select>
                    </div>
                    {(role === 'uzman' || role === 'hekim') && (
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Sertifika No</label>
                        <input
                          type="text"
                          disabled={!editing}
                          className="mt-1 w-full p-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
                          placeholder="Örn: 12345-A"
                          value={certificateNo} onChange={e => setCertificateNo(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {editing && (
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Profil Bilgilerini Kaydet</span>
                  </button>
                )}
              </form>
            </div>

            {/* Şifre Değiştirme Kartı */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-4">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Şifre Değiştir</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Hesap Güvenliği</p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert size={15} /> {passwordError}
                </div>
              )}

              {!changingPassword ? (
                <button
                  type="button"
                  onClick={() => setChangingPassword(true)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <KeyRound size={14} />
                  <span>Şifremi Değiştir</span>
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Mevcut Şifre</label>
                    <input
                      type="password"
                      required
                      className="mt-1 w-full p-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Yeni Şifre</label>
                      <input
                        type="password"
                        required
                        className="mt-1 w-full p-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        required
                        className="mt-1 w-full p-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPassword(false);
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Save size={14} />
                      <span>Kaydet</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
