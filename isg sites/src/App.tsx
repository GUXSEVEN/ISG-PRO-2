/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, LayoutGrid, Sparkles, Building2, User, KeyRound, 
  CreditCard, Mail, Phone, Lock, HeartHandshake, ArrowUp, Star 
} from 'lucide-react';
import { User as UserType, FAQItem, Review, RiskPreset, SiteConfig } from './types';

// Firebase imports
import { db } from './lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

// Component imports
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Playground from './components/Playground';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import Checkout from './components/Checkout';
import FAQ from './components/FAQ';
import Reviews from './components/Reviews';
import AdminPanel from './components/AdminPanel';
import DownloadsPage from './components/DownloadsPage';

const STORAGE_KEYS = {
  USERS: 'isg_landing_users_v1',
  CURRENT_USER: 'isg_landing_current_user_v1',
};

const INITIAL_USERS: UserType[] = [
  { 
    username: "admin", 
    password: "password", 
    name: "Sistem Yöneticisi", 
    email: "admin@isg.com", 
    phone: "5551112233", 
    role: 'admin', 
    isPremium: true,
    licenseKey: 'ISG-ADMIN-FULL-SUITE',
    licenseType: 'yearly'
  },
  { 
    username: "ali", 
    password: "123", 
    name: "Ali Yılmaz (İGU)", 
    email: "ali@isg.com", 
    phone: "5554445566", 
    role: 'uzman', 
    certificateNo: '12345-A',
    isPremium: false 
  }
];

export default function App() {
  const [users, setUsers] = useState<UserType[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeSection, setActiveSection] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Helper to save user to Firestore
  const saveUserToFirestore = async (user: UserType) => {
    if (!db) return;
    try {
      const userDocRef = doc(db, 'users', user.username.toLowerCase());
      await setDoc(userDocRef, user, { merge: true });
      console.log(`User ${user.username} saved/updated in Firestore.`);
    } catch (err) {
      console.warn("Error saving user to Firestore:", err);
    }
  };

  // Sync users with Firestore on mount
  useEffect(() => {
    const syncUsersFromFirestore = async () => {
      if (!db) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const cloudUsers: UserType[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserType;
          if (data && data.username) {
            cloudUsers.push(data);
          }
        });

        if (cloudUsers.length > 0) {
          setUsers(prev => {
            const merged = [...prev];
            cloudUsers.forEach(cu => {
              const idx = merged.findIndex(u => u.username.toLowerCase() === cu.username.toLowerCase());
              if (idx > -1) {
                merged[idx] = { ...merged[idx], ...cu };
              } else {
                merged.push(cu);
              }
            });
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
            return merged;
          });
        } else {
          // Seed the database with initial users if empty
          for (const u of INITIAL_USERS) {
            const userDocRef = doc(db, 'users', u.username.toLowerCase());
            await setDoc(userDocRef, u);
          }
        }
      } catch (error) {
        console.warn("Firestore sync failed, using localStorage fallback:", error);
      }
    };
    syncUsersFromFirestore();
  }, []);
  const [checkoutPlan, setCheckoutPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Dynamic Site Administration states
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const stored = localStorage.getItem('isg_site_config_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      heroTitle: "İSG Süreçlerinizi Yapay Zeka Gücüyle Dijitalleştirin",
      heroSubtitle: "Saha risk analizleri, acil durum eylem planları, ekip imzalı kapak sayfaları, detaylı PDF raporları ve online kütüphane entegrasyonu. Hepsi tek bir platformda.",
      contactEmail: "destek@isgpro.com",
      contactPhone: "+90 (212) 555 4744",
      contactAddress: "Teknokent Blok A, Maslak, İstanbul"
    };
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    try {
      const stored = localStorage.getItem('isg_faqs_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'faq-1', question: 'İSG Pro yapay zeka sistemi hangi mevzuatları baz alıyor?', answer: 'Yapay zeka motorumuz, başta 6331 sayılı İş Sağlığı ve Güvenliği Kanunu olmak üzere, Yapı İşlerinde İş Sağlığı ve Güvenliği Yönetmeliği ve ilgili tüm alt tebliğleri güncel olarak tarayarak çıktı üretir.' },
      { id: 'faq-2', question: 'Üretilen risk analizi raporları müfettiş denetiminde geçerli midir?', answer: 'Evet, üretilen PDF ve Excel raporları, Çalışma Bakanlığı resmi 5x5 L Tipi ve FK Matris standartlarına %100 uyumludur. İmza alanları, kapak sayfası ve revizyon numarasıyla resmi evrak olarak teslim edilebilir.' },
      { id: 'faq-3', question: 'İnternet bağlantısı olmadan platformu kullanabilir miyim?', answer: 'Giriş ve veri görüntüleme işlemlerinizi tarayıcı önbelleği (Local Cache) sayesinde internetsiz de yapabilirsiniz. Ancak yapay zekayla yeni risk analizi üretmek için internet bağlantısı gerekmektedir.' },
      { id: 'faq-4', question: 'Kurumsal veya OSGB çoklu lisans avantajları nelerdir?', answer: 'OSGB ve çok şubeli firmalar için sınırsız alt uzman hesabı ekleme, merkezi kontrol ve ortak kütüphane paylaşımı sunulur. Yıllık paketlerde %40 tasarruf imkanı vardır.' }
    ];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const stored = localStorage.getItem('isg_reviews_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'rev-1', name: 'Mustafa Demir', role: 'A Sınıfı İSG Uzmanı', rating: 5, comment: 'Daha önce saatlerimi alan şantiye risk değerlendirmesini İSG Pro sayesinde 10 dakikada hazırladım. Rapor çıktısı şahane!', createdAt: new Date().toISOString(), isApproved: true },
      { id: 'rev-2', name: 'Zeynep Yılmaz', role: 'İşyeri Hekimi', rating: 5, comment: 'Eğitim takip çizelgesi ve acil durum eylem planı şablonları tam yönetmeliğe uygun. İşimizi inanılmaz kolaylaştırdı.', createdAt: new Date().toISOString(), isApproved: true },
      { id: 'rev-3', name: 'Caner Şahin', role: 'OSGB Müdürü', rating: 4, comment: 'Tüm ekibimiz için kurumsal pakete geçiş yaptık. Uzmanların raporlarını tek panelden onaylayabilmek çok pratik.', createdAt: new Date().toISOString(), isApproved: true }
    ];
  });

  const [presets, setPresets] = useState<RiskPreset[]>(() => {
    try {
      const stored = localStorage.getItem('isg_presets_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'preset-1', label: 'Dış Cephe İskele Sökümü', text: '5. katta dış cephe boya işleri için kurulan demir boru iskelenin söküm faaliyeti gerçekleştirilecek.' },
      { id: 'preset-2', label: 'Sıcak Kaynak İşleri', text: 'Üretim holündeki metal borular için gazaltı kaynak makinesiyle sıcak kaynak işleri yapılacaktır.' },
      { id: 'preset-3', label: 'Dar Alanda Kazı Çalışması', text: 'Fabrika sahası içerisinde 2.5 metre derinliğinde altyapı su hattı için kanal kazısı ve dolgu işleri.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('isg_site_config_v1', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('isg_faqs_v1', JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem('isg_reviews_v1', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('isg_presets_v1', JSON.stringify(presets));
  }, [presets]);

  // Monitor scroll for Scroll-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      
      // Determine active section based on scroll
      const sections = ['home', 'features', 'playground', 'pricing', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync users with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  // Sync currentUser with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // ==========================================
  // AUTHENTICATION HANDLERS
  // ==========================================

  const handleLogin = (usernameInput: string, passwordInput: string): boolean => {
    const found = users.find(
      u => u.username.toLowerCase() === usernameInput.toLowerCase().trim() && u.password === passwordInput
    );
    if (found) {
      if (found.username.toLowerCase() === 'admin') {
        found.role = 'admin';
      }
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const handleRegister = (newUser: UserType): boolean => {
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      return false;
    }
    const updated = [...users, newUser];
    setUsers(updated);
    setCurrentUser(newUser);
    saveUserToFirestore(newUser);
    return true;
  };

  const checkUserExists = (usernameInput: string): UserType | undefined => {
    return users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase().trim());
  };

  const handleResetPassword = (usernameInput: string, newPass: string): boolean => {
    const updated = users.map(u => {
      if (u.username.toLowerCase() === usernameInput.toLowerCase().trim()) {
        const updatedUser = { ...u, password: newPass };
        saveUserToFirestore(updatedUser);
        return updatedUser;
      }
      return u;
    });
    setUsers(updated);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSection('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // PROFILE UPDATE & TRANSACTION PORTAL
  // ==========================================

  const handleUpdateProfile = async (updatedFields: Partial<UserType>): Promise<any> => {
    if (!currentUser) return { success: false };

    const updatedUser = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);

    // Update in users array
    const updatedUsers = users.map(u => 
      u.username.toLowerCase() === currentUser.username.toLowerCase() 
        ? { ...u, ...updatedFields } 
        : u
    );
    setUsers(updatedUsers);

    saveUserToFirestore(updatedUser);

    return { success: true };
  };

  const handlePurchaseSelect = (planId: 'monthly' | 'yearly') => {
    if (!currentUser) {
      setAuthModalOpen(true);
      alert('Lisans satın alma işlemlerini tamamlamak için lütfen önce üye olun veya giriş yapın.');
      return;
    }
    setCheckoutPlan(planId);
  };

  const handleCheckoutSuccess = (licenseKey: string) => {
    if (!currentUser) return;

    const purchaseDate = new Date().toISOString();
    const expiryDate = new Date();
    if (checkoutPlan === 'yearly') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    else expiryDate.setMonth(expiryDate.getMonth() + 1);

    const upgradeFields: Partial<UserType> = { 
      isPremium: true, 
      licenseKey, 
      licensePurchasedAt: purchaseDate, 
      licenseExpiresAt: expiryDate.toISOString(),
      licenseType: checkoutPlan as any
    };

    handleUpdateProfile(upgradeFields);

    // Send license confirmation email via secure server API proxy
    if (currentUser.email) {
      fetch('/api/send-email-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: currentUser.name || currentUser.username,
          licenseKey,
          planName: checkoutPlan === 'yearly' ? 'Yıllık Premium Plan' : 'Aylık Standart Plan',
          planType: checkoutPlan === 'yearly' ? 'Yıllık' : 'Aylık',
          price: checkoutPlan === 'yearly' ? '₺2.990' : '₺299',
          purchaseDate,
          expiryDate: expiryDate.toISOString()
        })
      }).catch(err => console.warn('Could not send license email:', err));
    }

    // Smooth return to dashboard view
    setTimeout(() => {
      setCheckoutPlan(null);
      setActiveSection('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2800);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-slate-800 antialiased">
      
      {/* Dynamic Header */}
      {checkoutPlan === null && (
        <Navbar 
          currentUser={currentUser} 
          onLogout={handleLogout}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
      )}

      {/* Main Container Switching */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* CHECKOUT WIZARD VIEW */}
          {checkoutPlan !== null ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Checkout 
                planId={checkoutPlan}
                onSubmitSuccess={handleCheckoutSuccess}
                onCancel={() => setCheckoutPlan(null)}
              />
            </motion.div>
          ) : activeSection === 'dashboard' && currentUser ? (
            // CUSTOMER PORTAL/DASHBOARD VIEW
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard 
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
              />
            </motion.div>
          ) : activeSection === 'downloads' ? (
            // DOWNLOADS PAGE VIEW
            <motion.div
              key="downloads"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DownloadsPage />
            </motion.div>
          ) : activeSection === 'admin' && currentUser && (currentUser.role === 'admin' || currentUser.username === 'admin') ? (
            // SYSTEM ADMIN PANEL VIEW
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel
                siteConfig={siteConfig}
                onUpdateSiteConfig={setSiteConfig}
                faqs={faqs}
                onUpdateFaqs={setFaqs}
                reviews={reviews}
                onUpdateReviews={setReviews}
                presets={presets}
                onUpdatePresets={setPresets}
              />
            </motion.div>
          ) : (
            // SINGLE PAGE MARKETING LANDING VIEW
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0"
            >
              {/* Hero Section */}
              <div id="home" className="pt-2 md:pt-6">
                <Hero 
                  onExploreClick={() => {
                    setActiveSection('pricing');
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  onPlaygroundClick={() => {
                    setActiveSection('playground');
                    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  siteConfig={siteConfig}
                />
              </div>

              {/* Modular Features */}
              <Features />

              {/* Active AI Playground / Live Demo */}
              <div id="playground">
                <Playground presets={presets} />
              </div>

              {/* Pricing Cards */}
              <Pricing onSelectPlan={handlePurchaseSelect} />

              {/* Support & Contact Form */}
              <Contact 
                currentUserEmail={currentUser?.email} 
                onMailSent={() => {
                  // If logged in, fetch support emails list again
                }}
                siteConfig={siteConfig}
              />

              {/* FAQ Accordion Section */}
              <FAQ faqs={faqs} />

              {/* Reviews & Feedback Section */}
              <Reviews 
                reviews={reviews}
                currentUser={currentUser}
                onAddReview={(newReview) => {
                  setReviews(prev => [...prev, newReview]);
                }}
                onOpenAuthModal={() => setAuthModalOpen(true)}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* PERSISTENT FOOTER */}
      {checkoutPlan === null && (
        <footer className="bg-slate-900 text-white border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Brand Col */}
              <div className="space-y-4 col-span-1 md:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-base font-bold text-white">İSG Pro</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Müfettiş denetimlerine tam uyumlu, yapay zeka entegrasyonlu ve A4 resmi şablon çıktı garanti olan İSG yönetim asistanı.
                </p>
              </div>

              {/* Site Links Col */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Hızlı Bağlantılar</h5>
                <ul className="space-y-2 text-xs font-semibold text-slate-400">
                  <li><button onClick={() => { setActiveSection('home'); document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Ana Sayfa</button></li>
                  <li><button onClick={() => { setActiveSection('features'); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Özellikler</button></li>
                  <li><button onClick={() => { setActiveSection('playground'); document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">AI Oyun Alanı</button></li>
                  <li><button onClick={() => { setActiveSection('pricing'); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Fiyatlandırma</button></li>
                </ul>
              </div>

              {/* Legal & Compliance Col */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Yasal & Mevzuat</h5>
                <ul className="space-y-2 text-xs font-semibold text-slate-400">
                  <li className="hover:text-white cursor-pointer transition-colors">6331 Sayılı İSG Kanunu</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Risk Değerlendirmesi Yönetmeliği</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Kullanım Koşulları & Gizlilik</li>
                  <li className="hover:text-white cursor-pointer transition-colors">KVKK Aydınlatma Metni</li>
                </ul>
              </div>

              {/* Support info Col */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Müşteri İlişkileri</h5>
                <div className="space-y-2.5 text-xs font-semibold text-slate-400">
                  <p className="flex items-center gap-2"><Mail size={12} className="text-indigo-400" /> destek@isgpro.com</p>
                  <p className="flex items-center gap-2"><Phone size={12} className="text-indigo-400" /> +90 (212) 555 4744</p>
                  <p className="flex items-center gap-2"><Lock size={12} className="text-indigo-400" /> 14 Gün İade Garantisi</p>
                </div>
              </div>

            </div>

            <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-semibold flex flex-col sm:flex-row justify-between items-center gap-4">
              <span>© 2026 İSG Pro Teknolojileri. Tüm hakları saklıdır.</span>
              <span className="flex items-center gap-1.5"><HeartHandshake size={14} className="text-indigo-500" /> Güvenli saha yönetimi için tasarlandı.</span>
            </div>
          </div>
        </footer>
      )}

      {/* FLOAT SCROLL TO TOP */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-lg shadow-xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
            title="Yukarı Çık"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AUTH MODAL DIALOG */}
      <AnimatePresence>
        {authModalOpen && (
          <Auth 
            onClose={() => setAuthModalOpen(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
            checkUserExists={checkUserExists}
            onResetPassword={handleResetPassword}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
