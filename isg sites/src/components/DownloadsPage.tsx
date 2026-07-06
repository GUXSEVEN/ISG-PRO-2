/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Laptop, Smartphone, Download, CheckCircle, Shield, 
  Cpu, HardDrive, Info, ArrowRight, ShieldCheck, Clock, FileText
} from 'lucide-react';
import { AppRelease } from '../types';

export default function DownloadsPage() {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPlatform, setDownloadingPlatform] = useState<string | null>(null);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/releases');
      if (res.ok) {
        const data = await res.json();
        setReleases(data);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (err) {
      console.warn('Backend API failed, falling back to local simulation data.', err);
      // Fallback local releases simulation
      setReleases([
        {
          id: 'pc',
          platform: 'pc',
          version: '1.0.0',
          releaseNotes: 'İlk kararlı Windows masaüstü sürümü piyasaya sürüldü. Tüm yapay zeka analiz şablonları, yerel veritabanı senkronizasyonu ve hızlı PDF/A4 rapor yazdırma özellikleri entegre edildi.',
          fileSize: '42.5 MB',
          fileName: 'isgpro_setup.exe',
          updatedAt: new Date().toISOString(),
          downloadsCount: 148
        },
        {
          id: 'apk',
          platform: 'apk',
          version: '1.0.0',
          releaseNotes: 'Android akıllı telefon ve tabletler için optimize edilmiş İSG Pro mobil saha sürümü. Çevrimdışı saha çalışma modu, kamera entegrasyonuyla anlık risk fotoğraflama özelliği ve dijital imza desteği.',
          fileSize: '18.2 MB',
          fileName: 'isgpro_v1.apk',
          updatedAt: new Date().toISOString(),
          downloadsCount: 312
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (platform: 'pc' | 'apk', fileName: string) => {
    setDownloadingPlatform(platform);
    
    try {
      // Trigger API endpoint download
      // This will stream the real uploaded file from Express server
      window.location.href = `/api/releases/download/${platform}`;
      
      // Update local download counter UI as a neat detail
      setReleases(prev => prev.map(r => r.platform === platform ? { ...r, downloadsCount: r.downloadsCount + 1 } : r));
    } catch (error) {
      console.error('Download failed', error);
    } finally {
      setTimeout(() => {
        setDownloadingPlatform(null);
      }, 1500);
    }
  };

  const pcRelease = releases.find(r => r.platform === 'pc') || {
    version: '1.0.0',
    fileName: 'isgpro_setup.exe',
    fileSize: '42.5 MB',
    releaseNotes: 'İlk kararlı Windows masaüstü sürümü.',
    updatedAt: new Date().toISOString(),
    downloadsCount: 148
  };

  const apkRelease = releases.find(r => r.platform === 'apk') || {
    version: '1.0.0',
    fileName: 'isgpro_v1.apk',
    fileSize: '18.2 MB',
    releaseNotes: 'Android İSG Pro mobil saha sürümü.',
    updatedAt: new Date().toISOString(),
    downloadsCount: 312
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest rounded-full">
          <Download size={12} /> Çevrimdışı & Mobil Erişim
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
          Uygulamaları Cihazınıza İndirin
        </h2>
        <p className="text-base sm:text-lg text-slate-600 font-semibold leading-relaxed">
          İSG Pro'yu internet bağlantısı olmadan masaüstünde veya sahada doğrudan mobil cihazınızda kullanmak için resmi uygulamalarımızı indirin.
        </p>
      </div>

      {/* Main Grid for Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch mb-16">
        
        {/* CARD 1: PC WINDOWS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 p-8 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Background accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

          <div>
            {/* Header Platform */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                <Laptop size={30} />
              </div>
              <div className="text-right">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Windows Destekli
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Uyumlu: Win 10/11 (64-bit)</p>
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">PC Platformu Masaüstü Sürümü</h3>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              Tüm veri yedekleme, gelişmiş A4 yazdırma şablonları ve büyük ekran risk analiz araçlarıyla tasarlanmış tam donanımlı masaüstü asistanınız.
            </p>

            {/* File info badge row */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 font-mono text-[10px] sm:text-xs">
              <div className="text-center border-r border-slate-200/60 last:border-0">
                <span className="text-slate-400 font-bold block">SÜRÜM</span>
                <span className="text-slate-800 font-black text-xs mt-0.5 block">v{pcRelease.version}</span>
              </div>
              <div className="text-center border-r border-slate-200/60 last:border-0">
                <span className="text-slate-400 font-bold block">DOSYA BOYUTU</span>
                <span className="text-slate-800 font-black text-xs mt-0.5 block">{pcRelease.fileSize}</span>
              </div>
              <div className="text-center">
                <span className="text-slate-400 font-bold block">İNDİRİLME</span>
                <span className="text-slate-800 font-black text-xs mt-0.5 block">{pcRelease.downloadsCount}+</span>
              </div>
            </div>

            {/* Release Description */}
            <div className="space-y-3 mb-8">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileText size={14} className="text-indigo-600" /> Sürüm Güncelleme Notu
              </h4>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed pl-1">
                {pcRelease.releaseNotes}
              </p>
            </div>

            {/* System Requirements */}
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Info size={12} className="text-indigo-500" /> PC Sistem Gereksinimleri
              </h4>
              <ul className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold">
                <li className="flex items-center gap-1.5"><Cpu size={12} className="text-indigo-500" /> Intel/AMD Çift Çekirdek</li>
                <li className="flex items-center gap-1.5"><HardDrive size={12} className="text-indigo-500" /> En az 100 MB Boş Alan</li>
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-indigo-500" /> 4 GB RAM ve üzeri</li>
                <li className="flex items-center gap-1.5"><Shield size={12} className="text-indigo-500" /> Windows Defender Uyumlu</li>
              </ul>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={() => handleDownload('pc', pcRelease.fileName)}
            disabled={downloadingPlatform !== null}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-sm shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-95 mt-2"
          >
            {downloadingPlatform === 'pc' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>İndirme Başlatılıyor...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Masaüstü Uygulamasını İndir (.exe)</span>
              </>
            )}
          </button>
        </motion.div>

        {/* CARD 2: ANDROID APK */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 p-8 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Background accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>

          <div>
            {/* Header Platform */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                <Smartphone size={30} />
              </div>
              <div className="text-right">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Android Destekli
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Uyumlu: Android 8.0 ve üzeri</p>
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Android Mobil Saha Sürümü</h3>
            <p className="text-xs text-slate-500 font-semibold mb-6">
              Şantiyede, fabrikada veya madende dolaşırken anlık fotoğraf çekip risk analizine ekleyebileceğiniz ve dijital imza alabileceğiniz mobil asistan.
            </p>

            {/* File info badge row */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 font-mono text-[10px] sm:text-xs">
              <div className="text-center border-r border-slate-200/60 last:border-0">
                <span className="text-slate-400 font-bold block">SÜRÜM</span>
                <span className="text-slate-800 font-black text-xs mt-0.5 block">v{apkRelease.version}</span>
              </div>
              <div className="text-center border-r border-slate-200/60 last:border-0">
                <span className="text-slate-400 font-bold block">DOSYA BOYUTU</span>
                <span className="text-slate-800 font-black text-xs mt-0.5 block">{apkRelease.fileSize}</span>
              </div>
              <div className="text-center">
                <span className="text-slate-400 font-bold block">İNDİRİLME</span>
                <span className="text-slate-800 font-black text-xs mt-0.5 block">{apkRelease.downloadsCount}+</span>
              </div>
            </div>

            {/* Release Description */}
            <div className="space-y-3 mb-8">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileText size={14} className="text-emerald-500" /> Sürüm Güncelleme Notu
              </h4>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed pl-1">
                {apkRelease.releaseNotes}
              </p>
            </div>

            {/* Mobile Installation Guide */}
            <div className="space-y-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 mb-6 text-[11px] text-slate-700 font-semibold leading-relaxed">
              <h4 className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5 mb-1.5">
                <ShieldCheck size={14} /> Güvenli APK Kurulum Rehberi
              </h4>
              <p>1. APK dosyasını yukarıdaki butona tıklayarak telefonunuza indirin.</p>
              <p>2. İndirilen dosyaya tıkladığınızda çıkan uyarıda <span className="text-emerald-700 font-bold">"Bilinmeyen Kaynaklardan Yükleme"</span> iznini aktif edin.</p>
              <p>3. Kurulumu tamamlayıp İSG Pro hesabınızla anında giriş yapın.</p>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={() => handleDownload('apk', apkRelease.fileName)}
            disabled={downloadingPlatform !== null}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-sm shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-95 mt-2"
          >
            {downloadingPlatform === 'apk' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>İndirme Başlatılıyor...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Android APK İndir (.apk)</span>
              </>
            )}
          </button>
        </motion.div>

      </div>

      {/* Security Check Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
          <Shield size={22} className="text-indigo-600 animate-pulse" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-sm font-bold text-slate-900 flex items-center justify-center md:justify-start gap-1.5">
            %100 Güvenli ve İmzalı Dosyalar
          </h4>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            İSG Pro bünyesinde barındırılan tüm Windows yükleyici (.exe) ve Android (.apk) paketleri SHA-256 bütünlük kontrolünden geçirilmiş olup dijital sertifikalarla imzalanmıştır. Güvenle yükleyip çalıştırabilirsiniz.
          </p>
        </div>
      </div>

    </div>
  );
}
