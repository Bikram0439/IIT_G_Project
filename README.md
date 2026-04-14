# PRATHA - Project for Recording Assam's Traditional Health Activities 🌿

[![IIT Guwahati](https://img.shields.io/badge/IIT%20Guwahati-CIKS-brightgreen)](https://www.iitg.ac.in/ciis/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Connected-brightgreen)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-ISC-blue)](LICENSE)

## 🌟 Project Overview

**PRATHA** (Project for Recording Assam's Traditional Health Activities) is a comprehensive digital archive and search platform for **370+ medicinal plants** from Assam and Northeast India. Developed by the **Center for Indian Knowledge Systems (CIKS), IIT Guwahati**, it preserves traditional Ayurvedic and folk medicine knowledge, including local Assamese names, scientific names, medicinal uses, parts used, and high-resolution plant images.

**Key Purpose**: Document, search, and AI-query traditional healing plants to support research, education, and healthcare.

**Live Demo**: [PRATHA Web App](http://localhost:5000) (after `npm start`)

## ✨ Features

- **📖 Plant Database**: 370+ medicinal plants with scientific/local/English/Hindi/Assamese names
- **🔍 Smart Search**: Full-text search by name, uses, diseases (MongoDB text indexes)
- **🤖 HerbalAI Chatbot**: AI-powered Q&A using Google Gemini + plant database fuzzy matching
  - Ask: "Plants for fever?", "Neem benefits", "Tulsi uses"
- **🖼️ Image Gallery**: High-res plant photos (200+ JPGs in `/Public/Pictures/`)
- **🌐 Responsive UI**: Modern Bootstrap/EJS design, mobile-friendly
- **📊 Admin Tools**: One-click data import from JSON to MongoDB
- **🔒 Secure**: Admin secret for data operations

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Node.js, Express.js, MongoDB/Mongoose |
| **Frontend** | EJS Templates, Bootstrap 5, Font Awesome |
| **AI/ML** | Google Generative AI (Gemini) |
| **Search** | MongoDB Text Search + Fuse.js |
| **Static** | Express Static, Image Serving |
| **Utils** | dotenv, CORS, Multer |

**Dependencies** (from `package.json`):
```
express@^5.2.1, mongoose@^9.3.3, @google/generative-ai@^0.24.1
ejs@^5.0.1, cors@^2.8.6, dotenv@^17.4.0, fuse.js@^7.2.0
```

## 📁 Project Structure

```
IIT_G/
├── .gitignore              # Git ignores
├── package.json            # NPM dependencies & scripts
├── package-lock.json       # Lockfile
├── README.md              # This file!
├── server.js              # Main Express server (routes, middleware, MongoDB)
│
├── Data/                  # Plant data JSONs
│   ├── data.json          # Primary dataset (~370 plants)
│   └── new_data.json      # Additional/updated data
│
├── model/                 # Mongoose schemas & logic
│   ├── plants.js          # Plant schema (scientificName, localName, uses, etc.)
│   └── chatbot.js         # HerbalAI logic (Gemini + DB search)
│
├── Public/                # Static assets
│   ├── assets/            # UI assets
│   │   ├── backgroung_img.png  # Hero background
│   │   ├── logo.png       # IITG logo
│   │   └── default.jpg    # Fallback plant image
│   └── Pictures/          # 200+ Plant JPGs (e.g., Abroma augusta L.f....jpg)
│
└── views/                 # EJS templates
    ├── index.ejs          # Home/Search page (plant grid, search bar)
    ├── about.ejs          # Project info
    └── chatboat.ejs       # HerbalAI chat interface
```

**Database Schema** (`model/plants.js`):
```js
{
  scientificName: String,
  localName: String,      // Assamese
  englishName: String,
  hindiName: String,
  assameseName: String,
  partsUsed: String,
  uses: String,           // Medicinal uses
  reference: String,
  picturePage: String,    // /Pictures/filename.jpg
  pictureSource: String,
  ...
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google AI API Key (for HerbalAI)

### 1. Clone & Install
```bash
cd c:/Users/LENOVO/Desktop/IIT_G
npm install
```

### 2. Environment Setup
Create `.env`:
```
MONGODB_URI=mongodb://localhost:27017/pratha
GOOGLE_AI_API_KEY=your_gemini_api_key_here
PORT=5000
ADMIN_SECRET=admin123
```

### 3. Load Data (Admin Only)
```
POST /insert-data (body: {secret: 'admin123'})
```
- Loads `Data/data.json` → MongoDB `plants` collection
- Creates text indexes for search

### 4. Run Server
```bash
npm start
# or
node server.js
```
**Server**: http://localhost:5000

### Pages
- `/` - Home + Plant Search
- `/about` - Project Info
- `/Herbal-Ai` - Chatbot
- `/search?q=neem` - Search results

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Home + plants list |
| GET | `/search?q={query}` | Search plants |
| GET | `/about` | About page |
| GET | `/Herbal-Ai` | Chatbot UI |
| POST | `/api/chat` | HerbalAI query |
| GET | `/insert` | Admin insert form |
| POST | `/insert-data` | Load JSON → DB |

**Static**: `/Public/*`, `/Pictures/*`

## 🧠 HerbalAI Chatbot

Powered by **Google Gemini + MongoDB**:
1. **Query Processing**: Cleans/extracts terms ("plants for fever" → "fever")
2. **DB Search**: Fuzzy match on names/uses
3. **AI Generation**: Structured responses with disclaimers
4. **Fallbacks**: Common queries (fever, skin, Ashwagandha)

**Example**:
```
User: "Plants for skin?"
AI: Aloe vera, Neem, Turmeric... (full details)
```

## 📸 Screenshots

**Home Page** (Plant Grid + Search):
![Home](screenshots/home.png)

**Chatbot**:
![Chatbot](screenshots/chatbot.png)

*(Add actual screenshots to `/Public/screenshots/`)*

## 🗄️ Database Setup

1. **Connect MongoDB** (uncomment in `server.js` if needed)
2. **Load Data**: Visit `http://localhost:5000/insert` → Enter admin secret
3. **Indexes**: Auto-created on `scientificName, localName, englishName, uses`

**Sample Data** (`Data/data.json`):
```json
[
  {
    "Scientific Name": "Abutilon indicum",
    "Local Name": "Jabakutari",
    "Parts Used": "Root",
    "Uses": "Diarrhoea and vomiting",
    ...
  },
  ...
]
```

## 🤝 Contributing

1. Fork & PR
2. Add new plants to `Data/new_data.json`
3. Update images in `/Public/Pictures/`
4. Enhance HerbalAI prompts/logic

**Issues**: [Create Issue](https://github.com/your-repo/issues)

## 📚 References

- **Data Sources**: Bhattacharjya et al. (2023), Chetia et al. (2023), Sikdar & Dutta (2008)
- **IIT Guwahati CIKS**: Traditional knowledge preservation
- **Plants**: Assam/Northeast India ethnomedicinal surveys

## ⚠️ Disclaimer

**Educational/Research Use Only**. Consult healthcare professionals before medicinal use. Plant identification/images may vary.

## 📄 License

ISC License - See [LICENSE](LICENSE) (create if missing)

---

**Preserving Assam's Healing Heritage** 🌱 *Center for Indian Knowledge Systems, IIT Guwahati*

