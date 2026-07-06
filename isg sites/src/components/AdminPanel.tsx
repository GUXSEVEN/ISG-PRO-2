/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, HelpCircle, Star, MessageSquare, ListTodo, Film, 
  Trash2, Plus, Edit2, Save, X, Check, CheckCircle, Mail, Phone, MapPin, 
  RefreshCcw, AlertCircle, Sparkles, FileText, FileEdit, Clock,
  Download, Database, Search, Upload, UserPlus, ShieldAlert, CheckSquare, Sparkle
} from 'lucide-react';
import { FAQItem, Review, RiskPreset, SiteConfig, ContactMessage, AppRelease, User } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface AdminPanelProps {
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (config: SiteConfig) => void;
  faqs: FAQItem[];
  onUpdateFaqs: (faqs: FAQItem[]) => void;
  reviews: Review[];
  onUpdateReviews: (reviews: Review[]) => void;
  presets: RiskPreset[];
  onUpdatePresets: (presets: RiskPreset[]) => void;
}

export default function AdminPanel({
  siteConfig,
  onUpdateSiteConfig,
  faqs,
  onUpdateFaqs,
  reviews,
  onUpdateReviews,
  presets,
  onUpdatePresets,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'presets' | 'faqs' | 'reviews' | 'messages' | 'releases' | 'database'>('content');
  
  // Content edit states
  const [videoUrl, setVideoUrl] = useState(siteConfig.videoUrl);
  const [heroTitle, setHeroTitle] = useState(siteConfig.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(siteConfig.heroSubtitle);
  const [contactEmail, setContactEmail] = useState(siteConfig.contactEmail);
  const [contactPhone, setContactPhone] = useState(siteConfig.contactPhone);
  const [contactAddress, setContactAddress] = useState(siteConfig.contactAddress);
  const [contentSuccess, setContentSuccess] = useState(false);

  // Preset edit states
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetLabel, setPresetLabel] = useState('');
  const [presetText, setPresetText] = useState('');
  const [newPresetOpen, setNewPresetOpen] = useState(false);
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetText, setNewPresetText] = useState('');

  // FAQ edit states
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [newFaqOpen, setNewFaqOpen] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Messages states
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Releases states
  const [appReleases, setAppReleases] = useState<AppRelease[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<'pc' | 'apk'>('pc');
  const [releaseVersion, setReleaseVersion] = useState('1.0.0');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [releaseFileName, setReleaseFileName] = useState('isgpro_setup.exe');
  const [releaseFileSize, setReleaseFileSize] = useState('42.5 MB');
  const [releaseFileData, setReleaseFileData] = useState<string | null>(null);
  const [releaseSuccess, setReleaseSuccess] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);

  // Local Database states
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserRole, setEditUserRole] = useState<'uzman' | 'hekim' | 'other' | 'admin'>('uzman');
  const [editUserIsPremium, setEditUserIsPremium] = useState(false);
  const [editUserLicenseKey, setEditUserLicenseKey] = useState('');
  const [dbSuccessMessage, setDbSuccessMessage] = useState('');

  // Add new user states
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'uzman' | 'hekim' | 'other' | 'admin'>('uzman');
  const [newUserIsPremium, setNewUserIsPremium] = useState(false);

  useEffect(() => {
    if (activeTab === 'releases') {
      fetchReleases();
    } else if (activeTab === 'database') {
      loadUsersFromStorage();
    }
  }, [activeTab]);

  const fetchReleases = async () => {
    try {
      const res = await fetch('/api/releases');
      if (res.ok) {
        const data = await res.json();
        setAppReleases(data);
      }
    } catch (err) {
      console.error('Error fetching releases:', err);
    }
  };

  useEffect(() => {
    const rel = appReleases.find(r => r.platform === selectedPlatform);
    if (rel) {
      setReleaseVersion(rel.version);
      setReleaseNotes(rel.releaseNotes);
      setReleaseFileName(rel.fileName);
      setReleaseFileSize(rel.fileSize);
      setReleaseFileData(null);
    } else {
      setReleaseVersion('1.0.0');
      setReleaseNotes('');
      setReleaseFileName(selectedPlatform === 'pc' ? 'isgpro_setup.exe' : 'isgpro_v1.apk');
      setReleaseFileSize('20 MB');
      setReleaseFileData(null);
    }
  }, [selectedPlatform, appReleases]);

  const loadUsersFromStorage = async () => {
    try {
      const stored = localStorage.getItem('isg_landing_users_v1');
      if (stored) {
        setDbUsers(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading users from local storage:', e);
    }

    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const cloudUsers: User[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as User;
          if (data && data.username) {
            cloudUsers.push(data);
          }
        });
        if (cloudUsers.length > 0) {
          setDbUsers(cloudUsers);
          localStorage.setItem('isg_landing_users_v1', JSON.stringify(cloudUsers));
        }
      } catch (err) {
        console.warn("Error fetching users from Firestore:", err);
      }
    }
  };

  const saveUsersToStorage = async (updatedUsers: User[]) => {
    try {
      localStorage.setItem('isg_landing_users_v1', JSON.stringify(updatedUsers));
      setDbUsers(updatedUsers);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error saving users to local storage:', e);
    }

    if (db) {
      try {
        const stored = localStorage.getItem('isg_landing_users_v1');
        const previousUsers: User[] = stored ? JSON.parse(stored) : [];
        const deletedUsers = previousUsers.filter(pu => !updatedUsers.some(uu => uu.username.toLowerCase() === pu.username.toLowerCase()));
        
        for (const u of deletedUsers) {
          await deleteDoc(doc(db, 'users', u.username.toLowerCase()));
        }

        for (const u of updatedUsers) {
          await setDoc(doc(db, 'users', u.username.toLowerCase()), u, { merge: true });
        }
      } catch (err) {
        console.warn("Error syncing users to Firestore:", err);
      }
    }
  };

  const handleDeleteUser = (email: string) => {
    if (email === 'admin@isg.com') {
      alert('Sistem yöneticisi silinemez!');
      return;
    }
    if (confirm(`${email} e-postasına sahip kullanıcıyı tamamen silmek istediğinize emin misiniz?`)) {
      const updated = dbUsers.filter(u => u.email !== email);
      saveUsersToStorage(updated);
      showDbSuccess('Kullanıcı başarıyla silindi.');
    }
  };

  const handleStartEditUser = (user: User) => {
    setEditingUserId(user.email);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPhone(user.phone);
    setEditUserRole(user.role);
    setEditUserIsPremium(user.isPremium);
    setEditUserLicenseKey(user.licenseKey || '');
  };

  const handleSaveUserEdit = () => {
    if (!editUserName.trim() || !editUserEmail.trim()) {
      alert('Ad soyad ve e-posta zorunludur.');
      return;
    }

    const updated = dbUsers.map(u => {
      if (u.email === editingUserId) {
        return {
          ...u,
          name: editUserName,
          email: editUserEmail,
          phone: editUserPhone,
          role: editUserRole,
          isPremium: editUserIsPremium,
          licenseKey: editUserIsPremium ? (editUserLicenseKey || 'ISG-PRO-' + Math.random().toString(36).substr(2, 9).toUpperCase()) : null,
          licenseType: editUserIsPremium ? (u.licenseType || 'yearly') : null
        };
      }
      return u;
    });

    saveUsersToStorage(updated);
    setEditingUserId(null);
    showDbSuccess('Kullanıcı bilgileri başarıyla güncellendi.');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newUserEmail.trim()) {
      alert('Kullanıcı adı, ad soyad ve e-posta zorunludur.');
      return;
    }

    if (dbUsers.some(u => u.username.toLowerCase() === newUsername.toLowerCase() || u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      alert('Kullanıcı adı veya e-posta zaten mevcut!');
      return;
    }

    const newUser: User = {
      username: newUsername.trim(),
      password: newPassword || '123456',
      name: newFullName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim(),
      role: newUserRole,
      isPremium: newUserIsPremium,
      licenseKey: newUserIsPremium ? 'ISG-PRO-' + Math.random().toString(36).substr(2, 9).toUpperCase() : null,
      licenseType: newUserIsPremium ? 'yearly' : null
    };

    const updated = [...dbUsers, newUser];
    saveUsersToStorage(updated);
    
    setNewUsername('');
    setNewPassword('');
    setNewFullName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('uzman');
    setNewUserIsPremium(false);
    setNewUserOpen(false);

    showDbSuccess('Yeni kullanıcı başarıyla eklendi.');
  };

  const showDbSuccess = (msg: string) => {
    setDbSuccessMessage(msg);
    setTimeout(() => setDbSuccessMessage(''), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      users: dbUsers,
      faqs,
      reviews,
      presets,
      siteConfig,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `isgpro_database_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (backup.users && Array.isArray(backup.users)) {
          saveUsersToStorage(backup.users);
          if (backup.faqs) onUpdateFaqs(backup.faqs);
          if (backup.reviews) onUpdateReviews(backup.reviews);
          if (backup.presets) onUpdatePresets(backup.presets);
          if (backup.siteConfig) onUpdateSiteConfig(backup.siteConfig);

          showDbSuccess('Veritabanı yedeği başarıyla geri yüklendi!');
        } else {
          alert('Geçersiz yedek dosyası formatı!');
        }
      } catch (err) {
        alert('Yedek dosyası ayrıştırılamadı.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Dosya boyutu çok büyük! Lütfen 15MB\'tan küçük bir dosya seçin.');
      return;
    }

    setReleaseFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setReleaseFileSize(sizeInMB);

    const reader = new FileReader();
    reader.onload = () => {
      setReleaseFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setReleaseLoading(true);
    try {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          version: releaseVersion,
          releaseNotes: releaseNotes,
          fileSize: releaseFileSize || '10 MB',
          fileName: releaseFileName,
          fileData: releaseFileData
        })
      });

      if (res.ok) {
        setReleaseSuccess(true);
        fetchReleases();
        setTimeout(() => setReleaseSuccess(false), 3000);
      } else {
        alert('Dosya güncellenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Error saving release:', err);
      alert('Ağ hatası oluştu.');
    } finally {
      setReleaseLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [activeTab]);

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch('/api/my-emails');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Okundu' | 'Yanıtlandı') => {
    // In-memory update/simulation
    const updated = messages.map(m => m.id === id ? { ...m, status: newStatus } : m);
    setMessages(updated);
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
    }
  };

  // Content actions
  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteConfig({
      videoUrl,
      heroTitle,
      heroSubtitle,
      contactEmail,
      contactPhone,
      contactAddress
    });
    setContentSuccess(true);
    setTimeout(() => setContentSuccess(false), 3000);
  };

  // Preset actions
  const handleStartEditPreset = (preset: RiskPreset) => {
    setEditingPresetId(preset.id);
    setPresetLabel(preset.label);
    setPresetText(preset.text);
  };

  const handleSavePresetEdit = (id: string) => {
    if (!presetLabel.trim() || !presetText.trim()) return;
    const updated = presets.map(p => p.id === id ? { ...p, label: presetLabel, text: presetText } : p);
    onUpdatePresets(updated);
    setEditingPresetId(null);
  };

  const handleDeletePreset = (id: string) => {
    if (confirm('Bu İSG çalışma şablonunu silmek istediğinize emin misiniz?')) {
      const updated = presets.filter(p => p.id !== id);
      onUpdatePresets(updated);
    }
  };

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetLabel.trim() || !newPresetText.trim()) return;
    const newPreset: RiskPreset = {
      id: `preset-${Date.now()}`,
      label: newPresetLabel.trim(),
      text: newPresetText.trim()
    };
    onUpdatePresets([...presets, newPreset]);
    setNewPresetLabel('');
    setNewPresetText('');
    setNewPresetOpen(false);
  };

  // FAQ actions
  const handleStartEditFaq = (faq: FAQItem) => {
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
  };

  const handleSaveFaqEdit = (id: string) => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    const updated = faqs.map(f => f.id === id ? { ...f, question: faqQuestion, answer: faqAnswer } : f);
    onUpdateFaqs(updated);
    setEditingFaqId(null);
  };

  const handleDeleteFaq = (id: string) => {
    if (confirm('Bu S.S.S sorusunu silmek istediğinize emin misiniz?')) {
      const updated = faqs.filter(f => f.id !== id);
      onUpdateFaqs(updated);
    }
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim()
    };
    onUpdateFaqs([...faqs, newFaq]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setNewFaqOpen(false);
  };

  // Review actions
  const handleDeleteReview = (id: string) => {
    if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      const updated = reviews.filter(r => r.id !== id);
      onUpdateReviews(updated);
    }
  };

  const handleApproveReview = (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, isApproved: true } : r);
    onUpdateReviews(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-1 border border-red-200/50">
            <Settings size={12} /> YÖNETİM PANELİ
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">İSG Pro Sistem Yönetimi</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Sitedeki tüm tanıtım metinlerini, videoları, şablonları, yorumları ve sıkça sorulan soruları buradan dinamik olarak düzenleyebilirsiniz.</p>
        </div>
        <div className="text-xs font-mono bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Yönetici Oturumu Aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Film size={16} />
            <span>Tanıtım & İletişim</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ListTodo size={16} />
            <span>İSG Çalışma Şablonları</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <HelpCircle size={16} />
            <span>Sıkça Sorulan Sorular</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MessageSquare size={16} />
            <span>Kullanıcı Değerlendirmeleri</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Mail size={16} />
            <span>Gelen Destek Mesajları</span>
          </button>

          <button
            onClick={() => setActiveTab('releases')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'releases'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Download size={16} />
            <span>Uygulama Dosyaları & Güncelleme</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
              activeTab === 'database'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Database size={16} />
            <span>Veritabanı Yönetimi</span>
          </button>
        </div>

        {/* Content Box (9 Columns) */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
          
          {/* TAB 1: CONTENT & CONTACT INFO */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4 mb-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Film className="text-indigo-600" size={18} />
                  Tanıtım Videosu & Genel Site Metinleri
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Ana sayfadaki video linkini, başlıkları ve iletişim kanallarını güncelleyebilirsiniz.</p>
              </div>

              {contentSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle size={16} />
                  Site ayarları ve içerikler başarıyla güncellendi!
                </div>
              )}

              <form onSubmit={handleSaveContent} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Tanıtım Videosu Embed URL (YouTube)</label>
                    <input
                      type="url" required
                      value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <span className="text-[9px] text-slate-400 block font-medium">Lütfen youtube.com/embed/... formatında bir embed linki girdiğinizden emin olun.</span>
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Ana Sayfa Hero Başlığı</label>
                    <input
                      type="text" required
                      value={heroTitle} onChange={e => setHeroTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Ana Sayfa Hero Alt Açıklaması</label>
                    <textarea
                      required rows={3}
                      value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Destek E-Posta Adresi</label>
                    <input
                      type="email" required
                      value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">İletişim Telefon No</label>
                    <input
                      type="text" required
                      value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Merkez Ofis Adresi</label>
                    <input
                      type="text" required
                      value={contactAddress} onChange={e => setContactAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save size={16} />
                  <span>Genel Ayarları Kaydet</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: RISK PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <ListTodo className="text-indigo-600" size={18} />
                    Çalışma Senaryosu Şablonları
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Yapay zeka deneme alanındaki (Playground) hazır seçim butonlarını yönetin.</p>
                </div>
                <button
                  onClick={() => setNewPresetOpen(!newPresetOpen)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-indigo-200/50 cursor-pointer transition-all active:scale-95"
                >
                  {newPresetOpen ? <X size={14} /> : <Plus size={14} />}
                  <span>{newPresetOpen ? 'Vazgeç' : 'Şablon Ekle'}</span>
                </button>
              </div>

              {/* Add New Preset Form */}
              <AnimatePresence>
                {newPresetOpen && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddPreset}
                    className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 overflow-hidden"
                  >
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Yeni Şablon Detayları</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Şablon Kısa Adı (Etiket) *</label>
                          <input
                            type="text" required
                            value={newPresetLabel} onChange={e => setNewPresetLabel(e.target.value)}
                            placeholder="Örn: Forklift Şarj İstasyonu"
                            className="mt-1 w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Detaylı İSG Senaryo Metni *</label>
                          <textarea
                            required rows={3}
                            value={newPresetText} onChange={e => setNewPresetText(e.target.value)}
                            placeholder="Örn: Fabrika içerisindeki forklift şarj istasyonunda asit sızıntıları ve havalandırma yetersizliği altında akü şarj işlemi gerçekleştirilecek."
                            className="mt-1 w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-all cursor-pointer"
                    >
                      Şablonu Ekle
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Presets List */}
              <div className="space-y-3">
                {presets.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Kayıtlı İSG şablonu bulunmuyor.</p>
                ) : (
                  presets.map(p => (
                    <div key={p.id} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-all">
                      {editingPresetId === p.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-400 block">Etiket</label>
                            <input
                              type="text"
                              value={presetLabel} onChange={e => setPresetLabel(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-400 block">Detaylı Senaryo</label>
                            <textarea
                              rows={3}
                              value={presetText} onChange={e => setPresetText(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none mt-0.5 resize-none"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingPresetId(null)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Vazgeç
                            </button>
                            <button
                              onClick={() => handleSavePresetEdit(p.id)}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Kaydet
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700 rounded">
                              {p.label}
                            </span>
                            <p className="text-xs text-slate-600 font-semibold leading-relaxed mt-1">{p.text}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handleStartEditPreset(p)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                              title="Şablonu Düzenle"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeletePreset(p.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Şablonu Sil"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <HelpCircle className="text-indigo-600" size={18} />
                    Sıkça Sorulan Sorular (S.S.S)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Sitenin alt kısmındaki sıkça sorulan sorular akordeon listesini düzenleyin.</p>
                </div>
                <button
                  onClick={() => setNewFaqOpen(!newFaqOpen)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-indigo-200/50 cursor-pointer transition-all active:scale-95"
                >
                  {newFaqOpen ? <X size={14} /> : <Plus size={14} />}
                  <span>{newFaqOpen ? 'Vazgeç' : 'Soru Ekle'}</span>
                </button>
              </div>

              {/* Add New FAQ Form */}
              <AnimatePresence>
                {newFaqOpen && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddFaq}
                    className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 overflow-hidden"
                  >
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Yeni FAQ Detayları</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Soru Metni *</label>
                          <input
                            type="text" required
                            value={newFaqQuestion} onChange={e => setNewFaqQuestion(e.target.value)}
                            placeholder="Örn: Platformu internetsiz kullanabilir miyim?"
                            className="mt-1 w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Cevap Metni *</label>
                          <textarea
                            required rows={3}
                            value={newFaqAnswer} onChange={e => setNewFaqAnswer(e.target.value)}
                            placeholder="Örn: Evet, tüm yerel veriler tarayıcınızda şifreli olarak saklanır, dolayısıyla internet bağlantınız olmadığında bile çalışmaya devam eder."
                            className="mt-1 w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-all cursor-pointer"
                    >
                      Soruyu Ekle
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* FAQ List */}
              <div className="space-y-3">
                {faqs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Kayıtlı S.S.S. bulunmuyor.</p>
                ) : (
                  faqs.map(f => (
                    <div key={f.id} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-all">
                      {editingFaqId === f.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-400 block">Soru</label>
                            <input
                              type="text"
                              value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-400 block">Cevap</label>
                            <textarea
                              rows={3}
                              value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none mt-0.5 resize-none"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingFaqId(null)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Vazgeç
                            </button>
                            <button
                              onClick={() => handleSaveFaqEdit(f.id)}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Kaydet
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Q: {f.question}</h4>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1 pl-3 border-l border-slate-200">A: {f.answer}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handleStartEditFaq(f)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                              title="Soruyu Düzenle"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(f.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Soruyu Sil"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4 mb-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <MessageSquare className="text-indigo-600" size={18} />
                  Kullanıcı Yorumları ve Feedbackler
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Kullanıcıların site genelinde yaptığı puanlamaları onaylayabilir veya silebilirsiniz.</p>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Kullanıcı yorumu bulunmuyor.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start gap-4 bg-slate-50/20">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{r.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({r.role})</span>
                          <span className="text-[9px] text-slate-400 font-mono ml-2">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              size={12} 
                              fill={idx < r.rating ? 'currentColor' : 'none'} 
                              className={idx < r.rating ? 'text-amber-500' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 font-semibold italic">"{r.comment}"</p>
                        {r.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check size={10} /> ONAYLANMIŞ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] text-amber-600 font-extrabold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded animate-pulse">
                            <Clock size={10} /> ONAY BEKLİYOR
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0 self-end sm:self-start">
                        {!r.isApproved && (
                          <button
                            onClick={() => handleApproveReview(r.id)}
                            className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <CheckCircle size={12} />
                            Onayla
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        >
                          <Trash2 size={12} />
                          Sil
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT MESSAGES INBOX */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Mail className="text-indigo-600" size={18} />
                    Gelen Destek Mesajları
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Kullanıcıların 'Bizimle İletişime Geçin' formundan gönderdikleri tüm mesajların havuzu.</p>
                </div>
                <button
                  onClick={fetchMessages}
                  disabled={messagesLoading}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCcw size={13} className={messagesLoading ? 'animate-spin' : ''} />
                  <span>Yenile</span>
                </button>
              </div>

              {messagesLoading ? (
                <div className="text-center py-12 text-xs text-slate-400">Mesajlar yükleniyor...</div>
              ) : messages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Kayıtlı iletişim/destek mesajı bulunmuyor.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map(m => (
                    <div key={m.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/30">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 pb-2">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900">{m.name}</h4>
                          <span className="text-[10px] text-indigo-600 font-semibold">{m.email}</span>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-[9px] text-slate-400 font-mono">{new Date(m.sentAt).toLocaleString('tr-TR')}</span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            m.status === 'Okundu' ? 'bg-blue-100 text-blue-700' :
                            m.status === 'Yanıtlandı' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Konu</span>
                        <p className="text-xs font-bold text-slate-800">{m.subject}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mesaj</span>
                        <p className="text-xs text-slate-600 font-semibold bg-white border border-slate-200 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                          {m.message}
                        </p>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        {m.status === 'Beklemede' && (
                          <button
                            onClick={() => handleUpdateStatus(m.id, 'Okundu')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
                          >
                            Okundu İşaretle
                          </button>
                        )}
                        {m.status !== 'Yanıtlandı' && (
                          <button
                            onClick={() => handleUpdateStatus(m.id, 'Yanıtlandı')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
                          >
                            Yanıtlandı İşaretle
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
                        >
                          Mesajı Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: APP RELEASES UPLOAD & VERSION CONTROL */}
          {activeTab === 'releases' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Download className="text-indigo-600" size={18} />
                    Uygulama Dosyaları & Güncelleme
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Sistem kullanıcıları için PC (.exe) ve Android (.apk) paketlerini buraya yükleyip güncelleyin.
                  </p>
                </div>
                <button
                  onClick={fetchReleases}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <RefreshCcw size={13} />
                  <span>Sürümleri Yenile</span>
                </button>
              </div>

              {releaseSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-4 flex items-center gap-2.5 font-semibold">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                  <span>Sürüm dosyaları ve bilgileri başarıyla sisteme kaydedildi ve yayınlandı!</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Release Form */}
                <form onSubmit={handleSaveRelease} className="lg:col-span-7 bg-slate-50/50 border border-slate-200 rounded-2xl p-6 space-y-5">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Upload size={15} className="text-indigo-600" /> Sürüm Yükle / Düzenle
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Hedef Platform</label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value as 'pc' | 'apk')}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-indigo-600 cursor-pointer"
                      >
                        <option value="pc">Windows PC Masaüstü Sürümü (.exe)</option>
                        <option value="apk">Android Mobil Saha Sürümü (.apk)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Sürüm Numarası</label>
                      <input
                        type="text"
                        value={releaseVersion}
                        onChange={(e) => setReleaseVersion(e.target.value)}
                        placeholder="Örn: 1.0.4"
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Drag and Drop Upload container */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Dosya Paketi Seçin (Maks 15MB)</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-2xl p-6 text-center transition-all cursor-pointer relative group">
                      <input
                        type="file"
                        accept={selectedPlatform === 'pc' ? '.exe,.zip,.txt' : '.apk,.txt'}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload size={24} className="text-slate-400 mx-auto mb-2 group-hover:text-indigo-600 transition-colors" />
                      <p className="text-xs font-black text-slate-800">{releaseFileName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Tıklayın veya dosyayı sürükleyip bırakın (Boyut: {releaseFileSize})
                      </p>
                      {releaseFileData && (
                        <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full mt-2">
                          HAZIR (Yüklenecek)
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Sürüm Güncelleme Notları</label>
                    <textarea
                      value={releaseNotes}
                      onChange={(e) => setReleaseNotes(e.target.value)}
                      placeholder="Yeni eklenen özellikleri, hata düzeltmelerini yazın..."
                      required
                      rows={4}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-semibold text-slate-700 focus:outline-indigo-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={releaseLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {releaseLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Dosya Yükleniyor ve Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Sürümü Kaydet ve Dosyayı Güncelle</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Info and current status */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Sistemdeki Sürümler
                    </h4>

                    {appReleases.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Yüklenmiş aktif dosya bulunmuyor. Varsayılan simülasyon dosyaları geçerli.</p>
                    ) : (
                      <div className="space-y-3">
                        {appReleases.map(rel => (
                          <div key={rel.platform} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                            <div className="space-y-1">
                              <span className="inline-block bg-indigo-100 text-indigo-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                                {rel.platform === 'pc' ? 'Masaüstü (Win)' : 'Android APK'}
                              </span>
                              <h5 className="text-xs font-extrabold text-slate-900">{rel.fileName}</h5>
                              <p className="text-[10px] text-slate-500 font-semibold">Sürüm: v{rel.version} | Boyut: {rel.fileSize}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-black text-slate-700 block">{rel.downloadsCount} indirme</span>
                              <span className="text-[8px] text-slate-400 font-mono block mt-0.5">{new Date(rel.updatedAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-2.5">
                    <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-indigo-600" /> Önemli Yönetici Bilgisi
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      Sistemimize yüklediğiniz dosyalar sunucumuzda güvenle saklanır. Kullanıcılar ana sayfadaki <strong className="text-indigo-950">"Uygulamayı İndir"</strong> sayfasından bu dosyaları anında çekebilir. Yüklenen .exe veya .apk dosyaları doğrudan indirilir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: USER DATABASE & LICENSE MANAGER */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              
              {/* Header section with export and search action */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Database className="text-indigo-600" size={18} />
                    Veritabanı & Lisans Yönetimi
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Sistemdeki kullanıcıların hesap verilerini düzenleyin, lisanslarını bir tıkla iptal edin/yenileyin veya Excel'e aktarın.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportBackup}
                    title="JSON formatında yedek al"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    Yedek Al (JSON)
                  </button>

                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95">
                    Yedek Yükle
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>

                  <button
                    onClick={() => {
                      const headers = ['Ad Soyad', 'Kullanıcı Adı', 'E-Posta', 'Telefon', 'Rol', 'Premium Lisans', 'Lisans Anahtarı', 'Lisans Tipi'];
                      const rows = dbUsers.map(u => [
                        u.name,
                        u.username,
                        u.email,
                        u.phone,
                        u.role === 'admin' ? 'Yönetici' : u.role === 'uzman' ? 'Uzman' : u.role === 'hekim' ? 'Hekim' : 'Diğer',
                        u.isPremium ? 'Aktif' : 'Pasif',
                        u.licenseKey || '',
                        u.licenseType || ''
                      ]);
                      const csvContent = "\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", `isgpro_kullanicilar_excel_${Date.now()}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showDbSuccess('Hesap bilgileri Excel dosyası (CSV) olarak indirildi!');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-600/10 active:scale-95"
                  >
                    <FileText size={13} />
                    <span>Excel'e Aktar (.csv)</span>
                  </button>

                  <button
                    onClick={() => setNewUserOpen(!newUserOpen)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-600/10 active:scale-95"
                  >
                    <UserPlus size={13} />
                    <span>Yeni Kullanıcı Ekle</span>
                  </button>
                </div>
              </div>

              {dbSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-4 flex items-center gap-2.5 font-semibold animate-fade-in">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                  <span>{dbSuccessMessage}</span>
                </div>
              )}

              {/* SEARCH BOX */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Kullanıcı adı, isim, e-posta veya telefon ile anlık ara..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold focus:ring-0 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* NEW USER ADD DRAWER */}
              {newUserOpen && (
                <form onSubmit={handleAddUser} className="bg-white border border-indigo-100 rounded-2xl p-6 space-y-4 shadow-sm relative">
                  <div className="absolute top-4 right-4">
                    <button type="button" onClick={() => setNewUserOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>

                  <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">Yeni Kullanıcı Hesabı Tanımla</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Kullanıcı Adı</label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Örn: ahmet12"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Giriş Şifresi</label>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Örn: 123456"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Ad Soyad</label>
                      <input
                        type="text"
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">E-Posta Adresi</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="Örn: ahmet@mail.com"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Telefon No</label>
                      <input
                        type="text"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="Örn: 5554443322"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mesleki Rol</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-indigo-600"
                      >
                        <option value="uzman">A/B/C Sınıfı İSG Uzmanı</option>
                        <option value="hekim">İşyeri Hekimi</option>
                        <option value="other">Diğer Personel / Destek</option>
                        <option value="admin">Sistem Yöneticisi (Admin)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <input
                      type="checkbox"
                      id="newUserIsPremium"
                      checked={newUserIsPremium}
                      onChange={(e) => setNewUserIsPremium(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="newUserIsPremium" className="text-xs text-slate-700 font-extrabold cursor-pointer">
                      Bu kullanıcıya doğrudan Premium lisans anahtarı tanımlansın mı? (Yıllık paket)
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setNewUserOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer"
                    >
                      Kullanıcıyı Kaydet
                    </button>
                  </div>
                </form>
              )}

              {/* USER DATABASE INTERACTIVE DATAGRID TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Kullanıcı Detayları</th>
                        <th className="p-4">Mesleki Profil / Rol</th>
                        <th className="p-4">İletişim</th>
                        <th className="p-4">Lisans Durumu</th>
                        <th className="p-4 text-right">Yönetici İşlemleri</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                      {dbUsers.filter(u => {
                        const term = searchUserQuery.toLowerCase().trim();
                        if (!term) return true;
                        return (
                          u.name.toLowerCase().includes(term) ||
                          u.username.toLowerCase().includes(term) ||
                          u.email.toLowerCase().includes(term) ||
                          u.phone.includes(term)
                        );
                      }).map(u => {
                        const isEditing = editingUserId === u.email;

                        return (
                          <tr key={u.email} className="hover:bg-slate-50/40 transition-colors">
                            {/* Cell 1: Username & Real Name */}
                            <td className="p-4">
                              {isEditing ? (
                                <div className="space-y-1.5 max-w-[200px]">
                                  <input
                                    type="text"
                                    value={editUserName}
                                    onChange={(e) => setEditUserName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                                    placeholder="Ad Soyad"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <h5 className="font-extrabold text-slate-900 text-sm">{u.name}</h5>
                                  <p className="text-[10px] text-slate-400 font-mono">@{u.username}</p>
                                </div>
                              )}
                            </td>

                            {/* Cell 2: Role */}
                            <td className="p-4">
                              {isEditing ? (
                                <select
                                  value={editUserRole}
                                  onChange={(e) => setEditUserRole(e.target.value as any)}
                                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px]"
                                >
                                  <option value="uzman">İSG Uzmanı</option>
                                  <option value="hekim">İşyeri Hekimi</option>
                                  <option value="other">Diğer Personel</option>
                                  <option value="admin">Yönetici (Admin)</option>
                                </select>
                              ) : (
                                <span className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                  u.role === 'uzman' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  u.role === 'hekim' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {u.role === 'admin' ? 'YÖNETİCİ' :
                                   u.role === 'uzman' ? 'İSG UZMANI' :
                                   u.role === 'hekim' ? 'İŞYERİ HEKİMİ' : 'PERSONEL'}
                                </span>
                              )}
                            </td>

                            {/* Cell 3: Contact */}
                            <td className="p-4">
                              {isEditing ? (
                                <div className="space-y-1 max-w-[180px]">
                                  <input
                                    type="email"
                                    value={editUserEmail}
                                    onChange={(e) => setEditUserEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold"
                                    placeholder="E-Posta"
                                  />
                                  <input
                                    type="text"
                                    value={editUserPhone}
                                    onChange={(e) => setEditUserPhone(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold"
                                    placeholder="Telefon"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-0.5 text-[11px]">
                                  <div className="text-slate-800 font-bold">{u.email}</div>
                                  <div className="text-slate-400 font-semibold">{u.phone || 'Telefon Yok'}</div>
                                </div>
                              )}
                            </td>

                            {/* Cell 4: License State */}
                            <td className="p-4">
                              {isEditing ? (
                                <div className="space-y-1.5">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={editUserIsPremium}
                                      onChange={(e) => setEditUserIsPremium(e.target.checked)}
                                      className="rounded"
                                    />
                                    <span className="text-[11px] font-extrabold text-slate-800">Premium Lisans</span>
                                  </label>
                                  {editUserIsPremium && (
                                    <input
                                      type="text"
                                      value={editUserLicenseKey}
                                      onChange={(e) => setEditUserLicenseKey(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-mono text-[10px]"
                                      placeholder="Lisans Anahtarı"
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {u.isPremium ? (
                                    <>
                                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-extrabold">
                                        <CheckSquare size={12} className="text-emerald-600" />
                                        <span>AKTİF (Yıllık Lisans)</span>
                                      </div>
                                      <p className="text-[9px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/80 inline-block max-w-[150px] truncate">
                                        {u.licenseKey || 'SÜRESİZ-YAPAY-ZEKA'}
                                      </p>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-extrabold">
                                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                      <span>Deneme Sürümü / Pasif</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Cell 5: Actions */}
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={handleSaveUserEdit}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                                    >
                                      Kaydet
                                    </button>
                                    <button
                                      onClick={() => setEditingUserId(null)}
                                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                                    >
                                      İptal
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {/* Cancel License directly if active */}
                                    {u.isPremium ? (
                                      <button
                                        onClick={() => {
                                          if (u.email === 'admin@isg.com') {
                                            alert('Sistem yöneticisinin lisansı iptal edilemez!');
                                            return;
                                          }
                                          if (confirm(`${u.name} kullanıcısının Premium lisans yetkisini derhal İPTAL etmek istiyor musunuz?`)) {
                                            const updated = dbUsers.map(usr => usr.email === u.email ? { ...usr, isPremium: false, licenseKey: null, licenseType: null } : usr);
                                            saveUsersToStorage(updated);
                                            showDbSuccess(`${u.name} kullanıcısının premium lisans yetkisi iptal edildi.`);
                                          }
                                        }}
                                        title="Lisansı İptal Et / Yetkileri Al"
                                        className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-extrabold px-2 py-1 rounded-lg cursor-pointer transition-all border border-red-200"
                                      >
                                        Lisansı İptal Et
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          const key = 'ISG-PRO-' + Math.random().toString(36).substr(2, 9).toUpperCase();
                                          const updated = dbUsers.map(usr => usr.email === u.email ? { ...usr, isPremium: true, licenseKey: key, licenseType: 'yearly' } : usr);
                                          saveUsersToStorage(updated);
                                          showDbSuccess(`${u.name} için premium yıllık lisans başarıyla tanımlandı.`);
                                        }}
                                        title="Kullanıcıyı Premium Yap"
                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded-lg cursor-pointer transition-all border border-emerald-200"
                                      >
                                        Lisans Tanımla
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleStartEditUser(u)}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                                    >
                                      Düzenle
                                    </button>

                                    <button
                                      onClick={() => handleDeleteUser(u.email)}
                                      className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-1 rounded cursor-pointer"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
