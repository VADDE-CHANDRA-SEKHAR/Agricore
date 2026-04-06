# 🌿 AgriCore — Smart Farm Management

AI-powered farming dashboard built with Java Spring Boot + React + Groq AI.

## Tech Stack
- **Backend:** Java 17 + Spring Boot 3
- **Frontend:** React 18 + Vite + Recharts
- **AI:** Groq API (Llama 3.3 70B + Llama 4 Scout Vision)
- **Weather:** Open-Meteo API (free, no key)
- **Location:** Browser Geolocation + Nominatim (free, no key)

## Prerequisites
- Java 17+  →  https://adoptium.net
- Maven 3.8+  →  https://maven.apache.org
- Node 18+  →  https://nodejs.org
- Groq API Key (free)  →  https://console.groq.com

## Setup

### 1. Clone / create the project
mkdir agricore && cd agricore

### 2. Add your Groq API key to .env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx

### 3. Run the backend
cd backend
export GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx   # Mac/Linux
set GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx      # Windows
mvn spring-boot:run

### 4. Run the frontend
cd frontend
npm install
npm run dev

### 5. Open the app
http://localhost:5173

## Features
- 📊 Dashboard with live KPI cards
- 🌾 Crops & Yield tracking with charts
- 🧪 Soil & Water health monitoring
- 🐄 Livestock management
- 🌤 Live weather + irrigation log
- 🔬 AI Disease Analysis with photo upload
- ✨ AI Farm Insights powered by Groq
- ⬇️ CSV export for all data
