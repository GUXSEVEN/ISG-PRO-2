/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini SDK with server-side environment key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory array for simulated email/contact requests
interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
  status: 'Beklemede' | 'Okundu' | 'Yanıtlandı';
}

const messageQueue: Message[] = [];

// App Releases configuration storage
interface Release {
  id: string;
  platform: 'pc' | 'apk';
  version: string;
  releaseNotes: string;
  fileSize: string;
  fileName: string;
  updatedAt: string;
  downloadsCount: number;
  fileData?: string; // base64 string
}

let releases: Release[] = [
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
];

// ==========================================
// 1. FULL-STACK API ENDPOINTS
// ==========================================

// AI Risk Generation API (Proxied server-side to hide API key)
app.post('/api/generate-risk', async (req, res) => {
  const { description, method } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Açıklama alanı zorunludur.' });
  }

  try {
    const prompt = `Sen uzman bir İş Sağlığı ve Güvenliği (İSG / OHS) danışmanısın.
Aşağıda belirtilen çalışma senaryosu veya iş faaliyeti için detaylı bir risk değerlendirmesi yap.
Senaryo: "${description}"

Yanıtı sadece geçerli bir JSON olarak döndür. Markdown etiketleri (örn. \`\`\`json) veya başka açıklama metni ekleme. Sadece saf JSON string döndür.
Yöntem: ${method || 'MATRIX_L'} (L Tipi 5x5 Matris)

JSON şeması:
{
  "category": "Kısa ve öz kategori adı (Örn: Yüksekte Çalışma, Elektrik Güvenliği, Kişisel Koruyucu Donanım)",
  "hazard": "Tehlike kaynağı (kısa ve teknik, örn: Korkuluksuz iskele platformu)",
  "risk": "Olası kaza / sonuç (örn: Yüksekten düşme sonucu ağır yaralanma veya can kaybı)",
  "precaution": "Alınması gereken teknik ve idari İSG önlemleri (örneğin: Korkuluk montajı, yaşam hatları, dikey yaşam hattına paraşüt tipi emniyet kemeriyle bağlanma, eğitim ve gözetim)",
  "L": 4, 
  "S": 5
}

Not: L (Olasılık) ve S (Şiddet) değerleri 1 ile 5 arasında tam sayılar olmalıdır.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    // Clean potential markdown wrappers
    const cleanJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsedData = JSON.parse(cleanJsonText);
      return res.json(parsedData);
    } catch (parseError) {
      console.warn('AI returned invalid JSON, fallback to basic parsing', responseText);
      return res.status(500).json({ 
        error: 'Yapay zeka yanıtı ayrıştırılamadı.',
        rawText: responseText
      });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'İSG yapay zeka analizi başarısız oldu.',
      details: error.message 
    });
  }
});

// Contact Support / Mail Sending Simulation API
app.post('/api/send-email', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Tüm alanları doldurmak zorunludur.' });
  }

  // Simulate mail delivery logs
  console.log(`[SMTP SIMULATOR] Email sent successfully!`);
  console.log(`To: support@isgpro.com`);
  console.log(`From: ${name} <${email}>`);
  console.log(`Subject: ${subject}`);
  console.log(`Message Length: ${message.length} chars`);

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    name,
    email,
    subject,
    message,
    sentAt: new Date().toISOString(),
    status: 'Beklemede'
  };

  messageQueue.unshift(newMessage);

  return res.json({ 
    success: true, 
    message: 'Destek talebiniz ve e-postanız başarıyla iletildi!',
    data: newMessage
  });
});

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "service_uqwc0fd";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "template_g923r5o";
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "EjgR1VNaFhYfJtFvq";
const EMAILJS_LICENSE_TEMPLATE_ID = "template_s4rysr5";

// Proxy endpoint for OTP email
app.post('/api/send-email-otp', async (req, res) => {
  const { email, code, name } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  console.log(`[Email Simulation] To: ${email}, Code: ${code}`);

  try {
    const expTime = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          email: email,
          to: email,
          to_name: name || email,
          otp_code: code,
          passcode: code,
          time: expTime,
          project_name: "İSG Pro"
        }
      })
    });

    if (response.ok) {
      return res.json({ success: true });
    } else {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText || "E-posta gönderilemedi." });
    }
  } catch (error: any) {
    console.error("EmailJS OTP Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for License email
app.post('/api/send-email-license', async (req, res) => {
  const { email, name, licenseKey, planName, planType, price, purchaseDate, expiryDate } = req.body;
  if (!email || !licenseKey) {
    return res.status(400).json({ error: 'Email and licenseKey are required.' });
  }

  console.log(`[Email Simulation] To: ${email}, Plan: ${planName}, Key: ${licenseKey}`);

  const formatDateTR = (dateVal: string) => {
    if (!dateVal) return '—';
    try {
      return new Date(dateVal).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_LICENSE_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          email: email,
          to: email,
          user_name: name || email,
          licenseKey: licenseKey,
          plan_name: planName,
          plan_type: planType,
          price: price,
          licensePurchasedAt: formatDateTR(purchaseDate),
          licenseExpiresAt: formatDateTR(expiryDate)
        }
      })
    });

    if (response.ok) {
      console.log(`[EmailJS] Lisans onay e-postası başarıyla gönderildi: ${email}`);
      return res.json({ success: true });
    } else {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText || "Lisans e-postası gönderilemedi." });
    }
  } catch (error: any) {
    console.error("EmailJS License Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for Iyzico pay-direct simulation
app.post('/api/iyzico/pay-direct', (req, res) => {
  const { name, cardNumber, cardExpiry, cardCvv } = req.body;

  if (!cardNumber || !cardExpiry || !cardCvv || !name) {
    return res.status(400).json({ error: 'Kart bilgileri eksiksiz doldurulmalıdır.' });
  }

  const rawCard = cardNumber.replace(/\s+/g, '');
  if (rawCard === '5890040000000024') {
    return res.status(400).json({ message: 'İyzico Ödeme Hatası: Yetersiz bakiye. (Hata Kodu: 51)' });
  } else if (rawCard === '5890040000000032') {
    return res.status(400).json({ message: 'İyzico Ödeme Hatası: Geçersiz Kart. (Hata Kodu: 14)' });
  } else if (rawCard === '5890040000000040') {
    return res.status(400).json({ message: 'İyzico Ödeme Hatası: Kart limiti aşılmıştır. (Hata Kodu: 54)' });
  }

  // Generate license key on success
  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `ISG-${segment()}-${segment()}-${segment()}-${segment()}`;
  };

  const licenseKey = generateLicenseKey();

  return res.json({
    status: 'success',
    message: 'Ödeme iyzico simülasyonu üzerinden başarıyla tamamlandı.',
    licenseKey
  });
});

// Fetch simulated inbox messages (for user dashboard to check their sent e-mails)
app.get('/api/my-emails', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.json(messageQueue);
  }
  const filtered = messageQueue.filter(m => m.email === email);
  return res.json(filtered);
});

// Fetch all active application releases (excludes heavy base64 fileData to save bandwidth)
app.get('/api/releases', (req, res) => {
  const sanitized = releases.map(({ fileData, ...rest }) => rest);
  return res.json(sanitized);
});

// Create/Update a release with custom file data
app.post('/api/releases', (req, res) => {
  const { platform, version, releaseNotes, fileSize, fileName, fileData } = req.body;
  if (!platform || !version) {
    return res.status(400).json({ error: 'Platform ve sürüm bilgisi zorunludur.' });
  }

  const index = releases.findIndex(r => r.platform === platform);
  const updatedRelease: Release = {
    id: platform,
    platform: platform as 'pc' | 'apk',
    version,
    releaseNotes: releaseNotes || '',
    fileSize: fileSize || '0 MB',
    fileName: fileName || (platform === 'pc' ? 'isgpro_setup.exe' : 'isgpro_v1.apk'),
    updatedAt: new Date().toISOString(),
    downloadsCount: index !== -1 ? releases[index].downloadsCount : 0,
    fileData: fileData || (index !== -1 ? releases[index].fileData : undefined)
  };

  if (index !== -1) {
    releases[index] = updatedRelease;
  } else {
    releases.push(updatedRelease);
  }

  return res.json({ success: true, release: { ...updatedRelease, fileData: undefined } });
});

// Stream or download release binary package
app.get('/api/releases/download/:platform', (req, res) => {
  const { platform } = req.params;
  const release = releases.find(r => r.platform === platform);
  if (!release) {
    return res.status(404).send('Release not found');
  }
  release.downloadsCount += 1;

  if (release.fileData) {
    try {
      const base64Data = release.fileData.split(';base64,').pop() || release.fileData;
      const fileBuffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', platform === 'pc' ? 'application/octet-stream' : 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${release.fileName}"`);
      return res.send(fileBuffer);
    } catch (err) {
      console.error('Error serving custom file buffer:', err);
    }
  }

  // Fallback beautiful setup info text file
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${release.fileName}.txt"`);
  res.send(`İSG Pro Yapay Zeka Destekli Platform - ${platform.toUpperCase()} Kurulum Dosyası
============================================================
Sürüm: v${release.version}
Dosya Adı: ${release.fileName}
Platform: ${platform === 'pc' ? 'Windows Desktop Client' : 'Android Mobile Sürümü'}
Güncelleme Tarihi: ${release.updatedAt}

Not: Bu dosya, sistem yöneticisi tarafından panele yüklenen gerçek uygulama paketinin simülasyonudur.
Eğer yönetici kendi özel .exe/.apk dosyasını yüklediyse, o dosya doğrudan buraya inecektir.

Kurulum Talimatları:
1. Kurulumu başlatmak için indirilen dosyayı çalıştırın.
2. Karşınıza çıkan pencerelerde "İleri" ve "Yükle" adımlarını takip edin.
3. Uygulama açıldığında hesabınızla giriş yaparak kullanmaya başlayın.`);
});

// ==========================================
// 2. VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Running successfully on http://localhost:${PORT}`);
  });
}

startServer();
