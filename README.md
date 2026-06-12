# 🧬 GameDNA — AI-Powered Gaming DNA Intelligence Platform

GameDNA is a highly polished, full-stack gaming intelligence platform that analyzes gameplay history, preferred genres, play hours, and player attributes to discover their playstyle **"DNA Profile"**. It utilizes Google's Gemini models (or falls back to a rules-based classification engine) to deliver tailored game recommendations and squadmate matching suggestions.

---

## 🚀 Tehnoloji Struktur / Tech Stack

### 💻 Frontend (Müştəri Tərəfi)
*   **Vite + React (TypeScript):** Müasir, sürətli və tip sınaqları ilə gücləndirilmiş tətbiq mühiti.
*   **Tailwind CSS (v4):** Estetik, futuristik kibertəhlükəsizlik və "Neon Slate" dizayn mühiti.
*   **D3.js:** Oyunçu göstəricilərini (Aqressivlik, Strategiya, Komanda Oyunu) vizuallaşdırmaq üçün inteqrasiya edilmiş xüsusi interaktiv **Radar diaqramı (RadarChart)**.
*   **Lucide React:** Minimalist və müasir interfeys nişanları (icons).
*   **Motion (React):** Təsirli səhifə keçidləri və dinamik animasialar.
*   **jsPDF:** Oyunçunun seçilmiş DNA nəticələrini təmizlənmiş ASCII tərzi ilə PDF formatında yükləməsi üçün müştəri tərəfli PDF generatoru.

### ⚙️ Backend (Server Tərəfi)
*   **Node.js & Express:** Sürətli və etibarlı REST API qurğuları.
*   **Google Gemini AI (`@google/genai` TypeScript SDK):** Oyunçu biotexnologiyasını və profillərini təhlil edən, model ehtiyat fallback sisteminə malik (`gemini-3.5-flash`, `gemini-flash-latest`, `gemini-3.1-flash-lite`) əsas AI mexanizmi.
*   **Lokal Qaydalar Sistemi (Rules Engine):** Aktiv `GEMINI_API_KEY` tapılmadıqda və ya şəbəkə kəsildikdə işə düşən loqarifmik çəki əsaslı ehtiyat profil analizatoru.
*   **JSON Alətlər Bazası (Local DB):** Oyun tənzimləmələri, CMS məlumatları, istifadəçi profilləri və analitika qeydlərini (`data_gamedna.json`) idarə edən verilənlər bazası servisi (`dbService`).
*   **Esbuild Bundling:** `package.json` build skripti vasitəsilə backend TypeScript fayllarını birbaşa tək bir CommonJS (`dist/server.cjs`) altında sıxaraq Node tətbiqinin problemsiz, sürətli və kəsilməsiz icrasını sığortalayır.

---

## 🛠️ Əsas Funksionallıqlar / Key Features

1.  **🧬 DNA Analiz Protokolu (Profile Setup Form & Scanning):**
    *   İstifadəçi adını daxil edir, oynadığı oyunları (saat çəkisi ilə) və sevdiyi janrları seçir.
    *   Futuristik təhlükəsizlik animasiyaları (`AnalysisScanning`) ilə təchiz edilən AI Wow Ekranı müştərini cəlb edir.
    *   Detallı oyunçu bio mətnindəki `"headshot master"`, `"aim"`, `"reaksiya"`, `"sens"`, `"suret"` kimilərini taparaq oyun daxili stats göstəricilərini dinamik olaraq formalaşdırır.

2.  **📊 Oyun Tərzi Göstəriciləri (Interactive Radar Chart):**
    *   Oyunçunun Aqressivlik (Aggression), Strategiya (Strategy) və Komanda Oyunu (Teamwork) göstəriciləri **D3.js SVG** üzərində canlı simmetriya ilə əks olunur.

3.  **🎮 Fərdiləşdirilmiş AI Oyun Tövsiyələri (Recommendations Engine):**
    *   İstifadəçinin keçmiş oyun vaxtlarına, hədəfləmə tərzinə əsasən bənzərsiz, dille uyğun ("why recommended") 3 ədəd populyar oyun tövsiyə edilir.

4.  **🤝 Squadmate Uyğunlaşdırılması (Matchmaking Engine):**
    *   İstifadəçinin profili ilə digər oyunçular arasındakı uyğunluq faizini, taktika səviyyəsini tənzimləyən dinamik komanda yoldaşı tapma modulu.

5.  **📥 DNA Profili PDF Eksportu (Clean PDF Downloader):**
    *   Skan nəticələrini estetika ilə PDF şəklinə gətirən modul. Azərbaycan/Türk hərflərinin və emojilərin PDF mühərriklərində xəta verməməsi üçün xüsusi olaraq hazırlanmış `cleanForPdf` filtri ilə təmin olunmuşdur.

---

## 📂 Layihə Strukturu / Project Architecture

```
├── assets/                  # Vizual resurslar və nişanlar
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Futuristik naviqasiya zolağı
│   │   ├── ProfileSetupForm.tsx   # Oyunçu daxiletmə və analiz formu
│   │   ├── AnalysisScanning.tsx   # AI skanetmə Wow ekranı
│   │   ├── IdentityResultCard.tsx # DNA hesabatı paneli və PDF Yükləyici
│   │   ├── RadarChart.tsx         # D3.js əsaslı vizual radar qrafiki
│   │   ├── RecommendationsView.tsx# AI tövsiyə etdiyi oyunlar siyahısı
│   │   └── MatchmakingView.tsx    # Komanda yoldaşı uyğunlaşma siyahısı
│   │
│   ├── db/
│   │   └── json_db.ts             # data_gamedna.json lokal bazası üçün servis
│   │
│   ├── App.tsx                    # Layihənin əsas idarəetmə React nodu
│   ├── index.css                  # Tailwind CSS və Neon Qlow kökləri
│   ├── main.tsx                   # React Client giriş nöqtəsi
│   └── types.ts                   # Qlobal TypeScript interfeysləri
│
├── data_gamedna.json        # Lokal tənzimləmə və CMS verilənlər bazası faylı
├── metadata.json            # AI Studio applet tənzimləməsi
├── server.ts                # Express, Gemini AI və API qapıları (Vite Middleware)
├── vite.config.ts           # Vite layihə tənzimləməsi
└── package.json             # Modul və asılılıqların deklarasiyası
```

---

## ⚙️ Quraşdırılma və Başlanğıc / Setup and Installation

### 1️⃣ Asılılıqları Quraşdırın:
```bash
npm install
```

### 2️⃣ Ətraf Mühit Dəyişənləri (Environment Variables):
Layihənin kök qovluğunda `.env` faylı yaradın və Gemini API açarını təyin edin:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Qeyd: Əgər bu açar boş buraxılarsa, tətbiq avtomatik olaraq **Rules-Engine** fallback rejiminə keçid edəcək və heç bir kəsilmə baş verməyəcək.)*

### 3️⃣ İnkişaf Mühitini Başladın (Development):
```bash
npm run dev
```

### 4️⃣ İstehsalat Formatında Qurulması (Production Build & Start):
```bash
npm run build
npm start
```
*(Build skripti həm müştəri fayllarını `dist/` qovluğuna çıxarır, həm də `server.ts` faylını tək bir `dist/server.cjs` olaraq paketləyir).*

---

## 🛡️ API Endpoints (Məlumat Xəritəsi)

*   `GET /api/health` - AI və Serverin canlılıq testi.
*   `GET /api/cms` - Başlıqlar və çəki parametrlərini çəkir.
*   `POST /api/cms` - CMS tənzimləmələrini yeniləyir.
*   `GET /api/games` - Tətbiqdəki mövcud oyun siyahısını çəkir.
*   `POST /api/games` - Yeni oyun əlavə edir.
*   `POST /api/analyze` - İstifadəçi daxiletmələrini analiz edərək oyunçu DNA profilini, 3 tövsiyəni və digər oyunçularla uyğunluğu generation edir.
*   `POST /api/analytics/click` - Oyun tövsiyələrinə olan klik analitikasını qeyd edir.
*   `GET /api/analytics` - Admin paneli üçün analitika məlumatlarını təqdim edir.
