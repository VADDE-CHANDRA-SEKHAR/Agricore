import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// ─── Seed Data ───────────────────────────────────────────────────────────────
const initCrops = [
  { id:1, name:"Wheat",  stage:"Growing",   area:12, yield:4.2, planted:"2026-01-15", season:"Rabi"   },
  { id:2, name:"Rice",   stage:"Harvested", area:8,  yield:6.1, planted:"2025-10-01", season:"Kharif" },
  { id:3, name:"Corn",   stage:"Seedling",  area:5,  yield:0,   planted:"2026-03-10", season:"Zaid"   },
];
const initSoil = [
  { id:1, field:"Field A", ph:6.8, moisture:45, nitrogen:72,  phosphorus:58, date:"2026-03-20" },
  { id:2, field:"Field B", ph:5.9, moisture:38, nitrogen:61,  phosphorus:44, date:"2026-03-22" },
];
const initLivestock = [
  { id:1, type:"Cattle",  count:24,  healthy:22,  status:"Good",    feed:"Hay + Grain" },
  { id:2, type:"Poultry", count:150, healthy:148, status:"Good",    feed:"Corn Feed"   },
  { id:3, type:"Goats",   count:18,  healthy:16,  status:"Monitor", feed:"Grass"       },
];
const initWeather = [
  { id:1, day:"Mon", date:"2026-03-23", temp:28, rain:0,  humidity:60, irrigation:20 },
  { id:2, day:"Tue", date:"2026-03-24", temp:30, rain:5,  humidity:72, irrigation:10 },
  { id:3, day:"Wed", date:"2026-03-25", temp:27, rain:12, humidity:85, irrigation:0  },
  { id:4, day:"Thu", date:"2026-03-26", temp:29, rain:0,  humidity:58, irrigation:25 },
  { id:5, day:"Fri", date:"2026-03-27", temp:32, rain:0,  humidity:50, irrigation:30 },
  { id:6, day:"Sat", date:"2026-03-28", temp:26, rain:8,  humidity:78, irrigation:5  },
  { id:7, day:"Sun", date:"2026-03-29", temp:25, rain:15, humidity:90, irrigation:0  },
];

const WX_CODES = {
  0:"Clear", 1:"Mainly Clear", 2:"Partly Cloudy", 3:"Overcast",
  45:"Foggy", 48:"Icy Fog", 51:"Light Drizzle", 53:"Drizzle",
  55:"Heavy Drizzle", 61:"Light Rain", 63:"Rain", 65:"Heavy Rain",
  71:"Light Snow", 73:"Snow", 75:"Heavy Snow",
  80:"Rain Showers", 81:"Heavy Showers", 82:"Violent Showers",
  95:"Thunderstorm", 96:"Thunderstorm+Hail",
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  app:        { display:"flex", height:"100vh", fontFamily:"'Segoe UI',sans-serif", background:"#0f1117", color:"#e2e8f0", overflow:"hidden" },
  sidebar:    { width:234, background:"#161b27", borderRight:"1px solid #1e2535", display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto" },
  logo:       { padding:"16px 16px 12px", borderBottom:"1px solid #1e2535" },
  logoText:   { fontSize:20, fontWeight:700, color:"#4ade80", letterSpacing:1 },
  logoSub:    { fontSize:11, color:"#64748b", marginTop:2 },
  wxWidget:   { margin:"10px 10px 0", background:"#0d1f17", border:"1px solid #166534", borderRadius:10, padding:"12px 14px" },
  wxBadge:    { display:"inline-flex", alignItems:"center", gap:4, background:"#14532d", borderRadius:6, padding:"2px 7px", fontSize:10, color:"#4ade80", fontWeight:600 },
  wxTemp:     { fontSize:28, fontWeight:700, color:"#fbbf24", lineHeight:1 },
  wxDesc:     { fontSize:12, color:"#86efac", marginTop:4 },
  wxMeta:     { fontSize:11, color:"#4ade80", marginTop:2 },
  wxLoc:      { fontSize:12, color:"#f1f5f9", fontWeight:600, marginTop:8 },
  wxDetails:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:10 },
  wxDetail:   { background:"#0f1117", borderRadius:6, padding:"6px 8px" },
  wxDLabel:   { fontSize:9, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 },
  wxDVal:     { fontSize:13, fontWeight:600, color:"#e2e8f0", marginTop:1 },
  keyBox:     { margin:"10px 10px 0", borderRadius:8, padding:"8px 10px" },
  nav:        { flex:1, padding:"8px 0" },
  navItem:  a=>({ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", cursor:"pointer", borderRadius:8, margin:"2px 8px", background:a?"#1e3a2f":"transparent", color:a?"#4ade80":"#94a3b8", fontSize:14, fontWeight:a?600:400 }),
  main:       { flex:1, overflow:"auto", padding:24 },
  pageTitle:  { fontSize:22, fontWeight:700, color:"#f1f5f9", marginBottom:4 },
  pageSub:    { fontSize:13, color:"#64748b", marginBottom:22 },
  grid4:      { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 },
  grid2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 },
  card:       { background:"#161b27", border:"1px solid #1e2535", borderRadius:12, padding:20 },
  kpiLabel:   { fontSize:11, color:"#64748b", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 },
  kpiValue:   { fontSize:26, fontWeight:700, color:"#f1f5f9" },
  kpiSub:     { fontSize:12, color:"#4ade80", marginTop:4 },
  secTitle:   { fontSize:15, fontWeight:600, color:"#f1f5f9", marginBottom:14 },
  table:      { width:"100%", borderCollapse:"collapse", fontSize:13 },
  th:         { textAlign:"left", padding:"9px 12px", color:"#64748b", borderBottom:"1px solid #1e2535", fontWeight:500, fontSize:11, textTransform:"uppercase" },
  td:         { padding:"9px 12px", borderBottom:"1px solid #1e2535", color:"#cbd5e1" },
  badge:    c=>({ display:"inline-block", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:c==="green"?"#14532d":c==="yellow"?"#713f12":"#7f1d1d", color:c==="green"?"#4ade80":c==="yellow"?"#fbbf24":"#f87171" }),
  btn:        { padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600 },
  btnG:       { background:"#16a34a", color:"#fff" },
  btnO:       { background:"transparent", color:"#4ade80", border:"1px solid #16a34a" },
  input:      { background:"#0f1117", border:"1px solid #1e2535", borderRadius:8, padding:"8px 12px", color:"#e2e8f0", fontSize:13, width:"100%", boxSizing:"border-box" },
  fgrid:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 },
  label:      { fontSize:12, color:"#94a3b8", marginBottom:4, display:"block" },
  aiBox:      { background:"#0d1f17", border:"1px solid #166534", borderRadius:10, padding:16, fontSize:13, color:"#86efac", lineHeight:1.8, whiteSpace:"pre-wrap", minHeight:80 },
  topBar:     { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  textarea:   { background:"#0f1117", border:"1px solid #1e2535", borderRadius:8, padding:"10px 12px", color:"#e2e8f0", fontSize:13, width:"100%", boxSizing:"border-box", resize:"vertical", minHeight:90 },
  refreshBtn: { background:"transparent", border:"none", color:"#4ade80", cursor:"pointer", fontSize:14 },
};

const tt = { contentStyle:{ background:"#161b27", border:"1px solid #1e2535", color:"#e2e8f0", fontSize:12 } };

// ─── Shared FormField ─────────────────────────────────────────────────────────
const FF = ({ label, fkey, type, value, onChange, step }) => (
  <div>
    <label style={S.label}>{label}</label>
    <input style={S.input} type={type} step={step} value={value}
      onChange={e => onChange(fkey, e.target.value)} />
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function AgriCore() {

  // ── Global state ──
  const [tab, setTab]                   = useState("dashboard");
  const [groqKey, setGroqKey]           = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // ── Weather / location ──
  const [liveWx, setLiveWx]       = useState(null);
  const [wxLoading, setWxLoading] = useState(false);
  const [wxError, setWxError]     = useState("");
  const [locationName, setLocName]= useState("");

  // ── Farm data ──
  const [crops,     setCrops]     = useState(initCrops);
  const [soil,      setSoil]      = useState(initSoil);
  const [livestock, setLivestock] = useState(initLivestock);
  const [weather,   setWeather]   = useState(initWeather);

  // ── Form visibility toggles ──
  const [showCropForm, setShowCropForm] = useState(false);
  const [showSoilForm, setShowSoilForm] = useState(false);
  const [showLsForm,   setShowLsForm]   = useState(false);
  const [showWxForm,   setShowWxForm]   = useState(false);

  // ── Form field state ──
  const [cropF, setCropF] = useState({ name:"", stage:"Seedling", area:"", yield:"", planted:"", season:"Rabi" });
  const [soilF, setSoilF] = useState({ field:"", ph:"", moisture:"", nitrogen:"", phosphorus:"" });
  const [lsF,   setLsF]   = useState({ type:"", count:"", healthy:"", status:"Good", feed:"" });
  const [wxF,   setWxF]   = useState({ day:"", date:"", temp:"", rain:"", humidity:"", irrigation:"" });

  // ── AI state ──
  const [aiInsight,     setAiInsight]     = useState("");
  const [aiLoading,     setAiLoading]     = useState(false);
  const [symptoms,      setSymptoms]      = useState("");
  const [diseaseResult, setDiseaseResult] = useState("");
  const [disLoading,    setDisLoading]    = useState(false);
  const [diseaseImage,  setDiseaseImage]  = useState(null);

  // ── Search ──
  const [cropSearch, setCropSearch] = useState("");
  const [lsSearch,   setLsSearch]   = useState("");

  // ─── Live weather fetch ───────────────────────────────────────────────────
  const fetchWeather = async (lat, lon) => {
    setWxLoading(true); setWxError("");
    try {
      const [wxRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&wind_speed_unit=kmh&timezone=auto`),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
      ]);
      const wx  = await wxRes.json();
      const geo = await geoRes.json();
      const c   = wx.current;
      setLiveWx({
        temp:          Math.round(c.temperature_2m),
        feelsLike:     Math.round(c.apparent_temperature),
        humidity:      c.relative_humidity_2m,
        windSpeed:     Math.round(c.wind_speed_10m),
        precipitation: c.precipitation,
        condition:     WX_CODES[c.weather_code] || "Unknown",
        code:          c.weather_code,
        updated:       new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
      });
      const a   = geo.address;
      const loc = a.state_district || a.county || a.city || a.town || a.state || "Unknown";
      setLocName(a.state ? `${loc}, ${a.state}` : loc);
    } catch { setWxError("Could not fetch weather."); }
    setWxLoading(false);
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setWxError("Geolocation not supported."); return; }
    setWxLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      ()  => { setWxError("Location permission denied."); setWxLoading(false); }
    );
  };

  useEffect(() => { getLocation(); }, []);

  // ─── Groq AI — text only ─────────────────────────────────────────────────
  const callAI = async (prompt, onResult, setLoad) => {
    if (!groqKey.trim()) {
      onResult("⚠️ Please enter your Groq API key in the sidebar first.\nGet a free key at: https://console.groq.com");
      return;
    }
    setLoad(true); onResult("");
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer " + groqKey.trim(),
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [{ role:"user", content:prompt }],
        }),
      });
      const d = await r.json();
      if (d.error) { onResult("Groq Error: " + d.error.message); }
      else onResult(d.choices[0].message.content);
    } catch { onResult("Failed to connect. Check your Groq API key."); }
    setLoad(false);
  };

  // ─── Groq AI — with optional image (vision) ──────────────────────────────
  const callAIWithImage = async (prompt, img, onResult, setLoad) => {
    if (!groqKey.trim()) {
      onResult("⚠️ Please enter your Groq API key in the sidebar first.\nGet a free key at: https://console.groq.com");
      return;
    }
    setLoad(true); onResult("");
    try {
      const content = [];
      if (img) {
        content.push({
          type: "image_url",
          image_url: { url: `data:${img.mediaType};base64,${img.base64}` },
        });
      }
      content.push({ type:"text", text:prompt });

      const model = img
        ? "meta-llama/llama-4-scout-17b-16e-instruct"
        : "llama-3.3-70b-versatile";

      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer " + groqKey.trim(),
        },
        body: JSON.stringify({ model, max_tokens:1200, messages:[{ role:"user", content }] }),
      });
      const d = await r.json();
      if (d.error) { onResult("Groq Error: " + d.error.message); }
      else onResult(d.choices[0].message.content);
    } catch { onResult("Failed to connect. Check your Groq API key."); }
    setLoad(false);
  };

  // ─── Image upload ─────────────────────────────────────────────────────────
  const handleImageUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      setDiseaseImage({ base64:dataUrl.split(",")[1], mediaType:file.type, previewUrl:dataUrl, name:file.name });
    };
    reader.readAsDataURL(file);
  };

  // ─── CSV Export ───────────────────────────────────────────────────────────
  const exportCSV = (data, name) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv  = [keys.join(","), ...data.map(r => keys.map(k => r[k]).join(","))].join("\n");
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = name + ".csv";
    a.click();
  };

  // ─── Derived values ───────────────────────────────────────────────────────
  const totalArea   = crops.reduce((s,c) => s + Number(c.area), 0);
  const totalLs     = livestock.reduce((s,l) => s + Number(l.count), 0);
  const avgPh       = soil.length ? (soil.reduce((s,r) => s + r.ph, 0) / soil.length).toFixed(1) : 0;
  const avgMoisture = soil.length ? Math.round(soil.reduce((s,r) => s + r.moisture, 0) / soil.length) : 0;
  const currentTemp = liveWx ? liveWx.temp : (weather.length ? weather[weather.length-1].temp : "—");

  const wxIcon = code => {
    if (code===0||code===1) return "☀️";
    if (code===2||code===3) return "⛅";
    if (code>=45&&code<=48) return "🌫️";
    if (code>=51&&code<=67) return "🌧️";
    if (code>=71&&code<=77) return "❄️";
    if (code>=80&&code<=82) return "🌦️";
    if (code>=95)           return "⛈️";
    return "🌤️";
  };

  const navItems = [
    { id:"dashboard", icon:"⊞", label:"Dashboard"        },
    { id:"crops",     icon:"🌾", label:"Crops & Yield"    },
    { id:"soil",      icon:"🧪", label:"Soil & Water"     },
    { id:"livestock", icon:"🐄", label:"Livestock"        },
    { id:"weather",   icon:"🌤", label:"Weather"          },
    { id:"disease",   icon:"🔬", label:"Disease Analysis" },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Weather Widget (sidebar) ──────────────────────────────────────────────
  const WeatherWidget = () => (
    <div style={S.wxWidget}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={S.wxBadge}>🔴 LIVE</span>
        <button style={S.refreshBtn} onClick={getLocation} title="Refresh">↻</button>
      </div>
      {wxLoading && <div style={{ fontSize:12, color:"#64748b", padding:"8px 0" }}>Fetching weather…</div>}
      {wxError && (
        <div style={{ fontSize:12, color:"#f87171" }}>
          {wxError}
          <button style={{ ...S.btn, ...S.btnG, marginTop:6, padding:"4px 10px", fontSize:11, display:"block" }}
            onClick={getLocation}>Retry</button>
        </div>
      )}
      {liveWx && !wxLoading && (
        <>
          <div style={S.wxTemp}>{wxIcon(liveWx.code)} {liveWx.temp}°C</div>
          <div style={S.wxDesc}>{liveWx.condition}</div>
          <div style={S.wxMeta}>Feels like {liveWx.feelsLike}°C</div>
          <div style={S.wxLoc}>📍 {locationName || "Locating…"}</div>
          <div style={S.wxDetails}>
            {[
              { label:"Humidity",      val:liveWx.humidity + "%" },
              { label:"Wind",          val:liveWx.windSpeed + " km/h" },
              { label:"Precipitation", val:liveWx.precipitation + "mm" },
              { label:"Updated",       val:liveWx.updated },
            ].map(d => (
              <div key={d.label} style={S.wxDetail}>
                <div style={S.wxDLabel}>{d.label}</div>
                <div style={S.wxDVal}>{d.val}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ── Groq Key Widget (sidebar) ─────────────────────────────────────────────
  const KeyWidget = () => (
    <div style={{ ...S.keyBox, background:"#0f1117", border:`1px solid ${groqKey ? "#166534" : "#713f12"}` }}>
      <div style={{ fontSize:10, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>
        🔑 Groq API Key
      </div>
      {showKeyInput ? (
        <input
          autoFocus
          style={{ ...S.input, fontSize:11, padding:"4px 8px" }}
          type="password"
          placeholder="gsk_xxxxxxxxxxxx"
          value={groqKey}
          onChange={e => setGroqKey(e.target.value)}
          onBlur={() => setShowKeyInput(false)}
          onKeyDown={e => e.key === "Enter" && setShowKeyInput(false)}
        />
      ) : (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}
          onClick={() => setShowKeyInput(true)}>
          <span style={{ fontSize:12, color:groqKey ? "#4ade80" : "#fbbf24", fontWeight:600 }}>
            {groqKey ? "✅ Key saved" : "⚠️ Enter key"}
          </span>
          <span style={{ fontSize:11, color:"#4ade80" }}>✏️</span>
        </div>
      )}
    </div>
  );

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const Dashboard = () => (
    <div>
      <div style={S.pageTitle}>Farm Overview</div>
      <div style={S.pageSub}>
        {locationName && <>{`📍 ${locationName}`} &nbsp;·&nbsp;</>}
        🌡 Live: <strong style={{ color:"#fbbf24" }}>{currentTemp}°C</strong>
        {liveWx && <> &nbsp;·&nbsp; {wxIcon(liveWx.code)} {liveWx.condition}</>}
      </div>

      <div style={S.grid4}>
        {[
          { label:"Total Crop Area",   value:totalArea + " ac",  sub:"across " + crops.length + " crops" },
          { label:"Live Temperature",  value:currentTemp + "°C", sub:liveWx ? liveWx.condition : "from log" },
          { label:"Total Livestock",   value:totalLs,            sub:livestock.length + " animal types" },
          { label:"Avg Soil pH",       value:avgPh,              sub:soil.length + " fields" },
          { label:"Avg Soil Moisture", value:avgMoisture + "%",  sub:"soil water content" },
          { label:"Active Crops",      value:crops.filter(c => c.stage !== "Harvested").length, sub:"growing / seedling" },
          { label:"Humidity",          value:liveWx ? liveWx.humidity + "%" : "—",         sub:"live reading" },
          { label:"Wind Speed",        value:liveWx ? liveWx.windSpeed + " km/h" : "—",   sub:"live reading" },
        ].map((k, i) => (
          <div key={i} style={S.card}>
            <div style={S.kpiLabel}>{k.label}</div>
            <div style={S.kpiValue}>{k.value}</div>
            <div style={S.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <div style={S.secTitle}>Crop Yield (t/a)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={crops}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
              <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:11 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:11 }} />
              <Tooltip {...tt} />
              <Bar dataKey="yield" fill="#4ade80" radius={[4,4,0,0]} name="Yield (t/a)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <div style={S.secTitle}>Temperature & Rainfall</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weather}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
              <XAxis dataKey="day" tick={{ fill:"#64748b", fontSize:11 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:11 }} />
              <Tooltip {...tt} />
              <Line type="monotone" dataKey="temp" stroke="#fbbf24" strokeWidth={2} dot={false} name="Temp °C" />
              <Line type="monotone" dataKey="rain" stroke="#60a5fa" strokeWidth={2} dot={false} name="Rain mm" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.secTitle}>✨ AI Farm Insights</div>
        <div style={S.aiBox}>{aiInsight || "Click 'Get AI Insights' to receive personalised recommendations for your farm."}</div>
        <button style={{ ...S.btn, ...S.btnG, marginTop:12 }} disabled={aiLoading}
          onClick={() => callAI(
            `You are an expert agricultural advisor. Farm location: ${locationName || "India"}. ` +
            `Live weather: ${liveWx ? `${liveWx.temp}°C, ${liveWx.condition}, humidity ${liveWx.humidity}%, wind ${liveWx.windSpeed}km/h` : currentTemp + "°C"}.\n` +
            `Give 4 concise actionable insights based on:\n` +
            `Crops: ${JSON.stringify(crops.map(c => ({ name:c.name, stage:c.stage, area:c.area, yield:c.yield })))}\n` +
            `Soil: ${JSON.stringify(soil.map(s => ({ field:s.field, ph:s.ph, moisture:s.moisture })))}\n` +
            `Livestock: ${JSON.stringify(livestock.map(l => ({ type:l.type, count:l.count, status:l.status })))}`,
            setAiInsight, setAiLoading
          )}>
          {aiLoading ? "Analysing…" : "✨ Get AI Insights"}
        </button>
      </div>
    </div>
  );

  // ── Crops ─────────────────────────────────────────────────────────────────
  const Crops = () => (
    <div>
      <div style={S.topBar}>
        <div>
          <div style={S.pageTitle}>Crops & Yield</div>
          <div style={S.pageSub}>
            Total area: <strong style={{ color:"#4ade80" }}>{totalArea} acres</strong> · {crops.length} crops
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ ...S.btn, ...S.btnO }} onClick={() => exportCSV(crops, "crops")}>⬇ Export CSV</button>
          <button style={{ ...S.btn, ...S.btnG }} onClick={() => setShowCropForm(!showCropForm)}>+ Add Crop</button>
        </div>
      </div>

      {showCropForm && (
        <div style={{ ...S.card, marginBottom:20 }}>
          <div style={S.secTitle}>Add New Crop</div>
          <div style={S.fgrid}>
            <FF label="Crop Name"    fkey="name"    type="text"   value={cropF.name}    onChange={(k,v) => setCropF({ ...cropF, [k]:v })} />
            <FF label="Area (acres)" fkey="area"    type="number" value={cropF.area}    onChange={(k,v) => setCropF({ ...cropF, [k]:v })} />
            <FF label="Yield (t/a)"  fkey="yield"   type="number" step="0.1" value={cropF.yield} onChange={(k,v) => setCropF({ ...cropF, [k]:v })} />
            <FF label="Planted Date" fkey="planted" type="date"   value={cropF.planted} onChange={(k,v) => setCropF({ ...cropF, [k]:v })} />
            <div>
              <label style={S.label}>Growth Stage</label>
              <select style={S.input} value={cropF.stage} onChange={e => setCropF({ ...cropF, stage:e.target.value })}>
                {["Seedling","Growing","Flowering","Harvested"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Season</label>
              <select style={S.input} value={cropF.season} onChange={e => setCropF({ ...cropF, season:e.target.value })}>
                {["Kharif","Rabi","Zaid","Year-round"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button style={{ ...S.btn, ...S.btnG }} onClick={() => {
            if (!cropF.name) return;
            setCrops([...crops, { ...cropF, id:Date.now(), area:Number(cropF.area), yield:Number(cropF.yield) }]);
            setCropF({ name:"", stage:"Seedling", area:"", yield:"", planted:"", season:"Rabi" });
            setShowCropForm(false);
          }}>Save Crop</button>
        </div>
      )}

      <div style={{ marginBottom:14 }}>
        <input style={{ ...S.input, maxWidth:280 }} placeholder="Search crops…"
          value={cropSearch} onChange={e => setCropSearch(e.target.value)} />
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead><tr>{["Crop","Season","Stage","Area (ac)","Yield (t/a)","Planted"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {crops.filter(c => c.name.toLowerCase().includes(cropSearch.toLowerCase())).map(c => (
              <tr key={c.id}>
                <td style={S.td}><strong>{c.name}</strong></td>
                <td style={S.td}>{c.season}</td>
                <td style={S.td}><span style={S.badge(c.stage==="Harvested"?"green":c.stage==="Seedling"?"yellow":"green")}>{c.stage}</span></td>
                <td style={S.td}>{c.area}</td>
                <td style={S.td}>{c.yield || "—"}</td>
                <td style={S.td}>{c.planted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...S.card, marginTop:20 }}>
        <div style={S.secTitle}>Yield vs Area</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={crops}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
            <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:11 }} />
            <YAxis tick={{ fill:"#64748b", fontSize:11 }} />
            <Tooltip {...tt} />
            <Bar dataKey="yield" fill="#4ade80" radius={[4,4,0,0]} name="Yield (t/a)" />
            <Bar dataKey="area"  fill="#60a5fa" radius={[4,4,0,0]} name="Area (ac)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // ── Soil ──────────────────────────────────────────────────────────────────
  const Soil = () => (
    <div>
      <div style={S.topBar}>
        <div><div style={S.pageTitle}>Soil & Water Health</div><div style={S.pageSub}>pH, moisture and nutrient levels.</div></div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ ...S.btn, ...S.btnO }} onClick={() => exportCSV(soil, "soil")}>⬇ Export CSV</button>
          <button style={{ ...S.btn, ...S.btnG }} onClick={() => setShowSoilForm(!showSoilForm)}>+ Add Reading</button>
        </div>
      </div>

      {showSoilForm && (
        <div style={{ ...S.card, marginBottom:20 }}>
          <div style={S.secTitle}>New Soil Reading</div>
          <div style={S.fgrid}>
            {[
              { l:"Field Name", k:"field", t:"text" },
              { l:"pH (0–14)", k:"ph", t:"number" },
              { l:"Moisture %", k:"moisture", t:"number" },
              { l:"Nitrogen kg/ha", k:"nitrogen", t:"number" },
              { l:"Phosphorus kg/ha", k:"phosphorus", t:"number" },
            ].map(f => <FF key={f.k} label={f.l} fkey={f.k} type={f.t} value={soilF[f.k]} onChange={(k,v) => setSoilF({ ...soilF, [k]:v })} />)}
          </div>
          <button style={{ ...S.btn, ...S.btnG }} onClick={() => {
            if (!soilF.field) return;
            setSoil([...soil, {
              ...soilF, id:Date.now(),
              ph:Number(soilF.ph), moisture:Number(soilF.moisture),
              nitrogen:Number(soilF.nitrogen), phosphorus:Number(soilF.phosphorus),
              date:new Date().toISOString().split("T")[0],
            }]);
            setSoilF({ field:"", ph:"", moisture:"", nitrogen:"", phosphorus:"" });
            setShowSoilForm(false);
          }}>Save Reading</button>
        </div>
      )}

      <div style={S.grid2}>
        {soil.map(s => (
          <div key={s.id} style={S.card}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <strong style={{ color:"#f1f5f9" }}>{s.field}</strong>
              <span style={{ fontSize:12, color:"#64748b" }}>{s.date}</span>
            </div>
            {[
              { label:"pH",         value:s.ph,         max:14,  unit:"",       color:s.ph>=6&&s.ph<=7.5 ? "#4ade80":"#fbbf24" },
              { label:"Moisture",   value:s.moisture,   max:100, unit:"%",      color:s.moisture>=30&&s.moisture<=60 ? "#60a5fa":"#fbbf24" },
              { label:"Nitrogen",   value:s.nitrogen,   max:150, unit:" kg/ha", color:"#a78bfa" },
              { label:"Phosphorus", value:s.phosphorus, max:100, unit:" kg/ha", color:"#f472b6" },
            ].map(m => (
              <div key={m.label} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94a3b8", marginBottom:4 }}>
                  <span>{m.label}</span>
                  <span style={{ color:m.color }}>{m.value}{m.unit}</span>
                </div>
                <div style={{ background:"#1e2535", borderRadius:4, height:6 }}>
                  <div style={{ width:Math.min((m.value/m.max)*100,100) + "%", background:m.color, height:6, borderRadius:4 }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Livestock ─────────────────────────────────────────────────────────────
  const Livestock = () => (
    <div>
      <div style={S.topBar}>
        <div><div style={S.pageTitle}>Livestock</div><div style={S.pageSub}>Animals, health status and feeding.</div></div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ ...S.btn, ...S.btnO }} onClick={() => exportCSV(livestock, "livestock")}>⬇ Export CSV</button>
          <button style={{ ...S.btn, ...S.btnG }} onClick={() => setShowLsForm(!showLsForm)}>+ Add Animal</button>
        </div>
      </div>

      {showLsForm && (
        <div style={{ ...S.card, marginBottom:20 }}>
          <div style={S.secTitle}>Add Livestock</div>
          <div style={S.fgrid}>
            {[
              { l:"Animal Type", k:"type", t:"text" },
              { l:"Total Count", k:"count", t:"number" },
              { l:"Healthy Count", k:"healthy", t:"number" },
              { l:"Feed Type", k:"feed", t:"text" },
            ].map(f => <FF key={f.k} label={f.l} fkey={f.k} type={f.t} value={lsF[f.k]} onChange={(k,v) => setLsF({ ...lsF, [k]:v })} />)}
            <div>
              <label style={S.label}>Health Status</label>
              <select style={S.input} value={lsF.status} onChange={e => setLsF({ ...lsF, status:e.target.value })}>
                {["Good","Monitor","Critical"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button style={{ ...S.btn, ...S.btnG }} onClick={() => {
            if (!lsF.type) return;
            setLivestock([...livestock, { ...lsF, id:Date.now(), count:Number(lsF.count), healthy:Number(lsF.healthy) }]);
            setLsF({ type:"", count:"", healthy:"", status:"Good", feed:"" });
            setShowLsForm(false);
          }}>Save</button>
        </div>
      )}

      <div style={{ marginBottom:14 }}>
        <input style={{ ...S.input, maxWidth:280 }} placeholder="Search livestock…"
          value={lsSearch} onChange={e => setLsSearch(e.target.value)} />
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead><tr>{["Animal","Total","Healthy","Status","Feed"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {livestock.filter(l => l.type.toLowerCase().includes(lsSearch.toLowerCase())).map(l => (
              <tr key={l.id}>
                <td style={S.td}><strong>{l.type}</strong></td>
                <td style={S.td}>{l.count}</td>
                <td style={S.td}>{l.healthy}</td>
                <td style={S.td}><span style={S.badge(l.status==="Good"?"green":l.status==="Monitor"?"yellow":"red")}>{l.status}</span></td>
                <td style={S.td}>{l.feed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Weather Page ──────────────────────────────────────────────────────────
  const WeatherPage = () => {
    const totalRain = weather.reduce((s,d) => s + Number(d.rain), 0);
    const totalIrr  = weather.reduce((s,d) => s + Number(d.irrigation), 0);
    const avgTemp   = weather.length ? Math.round(weather.reduce((s,d) => s + Number(d.temp), 0) / weather.length) : 0;
    return (
      <div>
        <div style={S.topBar}>
          <div><div style={S.pageTitle}>Weather & Irrigation</div><div style={S.pageSub}>Live conditions + manual irrigation log.</div></div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ ...S.btn, ...S.btnO }} onClick={() => exportCSV(weather, "weather")}>⬇ Export CSV</button>
            <button style={{ ...S.btn, ...S.btnG }} onClick={() => setShowWxForm(!showWxForm)}>+ Log Day</button>
          </div>
        </div>

        {liveWx && (
          <div style={{ ...S.card, marginBottom:20, background:"#0d1f17", border:"1px solid #166534" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={S.secTitle}>🔴 Live Weather — {locationName}</div>
              <button style={{ ...S.btn, ...S.btnO, fontSize:11, padding:"4px 12px" }} onClick={getLocation}>↻ Refresh</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
              {[
                { label:"Temperature",   val:`${liveWx.temp}°C` },
                { label:"Feels Like",    val:`${liveWx.feelsLike}°C` },
                { label:"Humidity",      val:`${liveWx.humidity}%` },
                { label:"Wind",          val:`${liveWx.windSpeed} km/h` },
                { label:"Precipitation", val:`${liveWx.precipitation}mm` },
              ].map(d => (
                <div key={d.label} style={{ background:"#0f1117", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 }}>{d.label}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#4ade80", marginTop:4 }}>{d.val}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:"#4ade80", marginTop:10 }}>
              {wxIcon(liveWx.code)} {liveWx.condition} · Updated {liveWx.updated}
            </div>
          </div>
        )}

        {showWxForm && (
          <div style={{ ...S.card, marginBottom:20 }}>
            <div style={S.secTitle}>Log Weather Entry</div>
            <div style={S.fgrid}>
              {[
                { l:"Day (e.g. Mon)", k:"day", t:"text" },
                { l:"Date", k:"date", t:"date" },
                { l:"Temperature (°C)", k:"temp", t:"number" },
                { l:"Rainfall (mm)", k:"rain", t:"number" },
                { l:"Humidity (%)", k:"humidity", t:"number" },
                { l:"Irrigation (L)", k:"irrigation", t:"number" },
              ].map(f => <FF key={f.k} label={f.l} fkey={f.k} type={f.t} value={wxF[f.k]} onChange={(k,v) => setWxF({ ...wxF, [k]:v })} />)}
            </div>
            <button style={{ ...S.btn, ...S.btnG }} onClick={() => {
              if (!wxF.day) return;
              setWeather([...weather, {
                ...wxF, id:Date.now(),
                temp:Number(wxF.temp), rain:Number(wxF.rain),
                humidity:Number(wxF.humidity), irrigation:Number(wxF.irrigation),
              }]);
              setWxF({ day:"", date:"", temp:"", rain:"", humidity:"", irrigation:"" });
              setShowWxForm(false);
            }}>Save Entry</button>
          </div>
        )}

        <div style={S.grid4}>
          {[
            { label:"Avg Logged Temp",  value:avgTemp + "°C", sub:"from log" },
            { label:"Total Rainfall",   value:totalRain + "mm", sub:"logged period" },
            { label:"Total Irrigation", value:totalIrr + "L",   sub:"applied" },
            { label:"Dry Days",         value:weather.filter(d => Number(d.rain) === 0).length, sub:"no rainfall" },
          ].map((k,i) => (
            <div key={i} style={S.card}>
              <div style={S.kpiLabel}>{k.label}</div>
              <div style={S.kpiValue}>{k.value}</div>
              <div style={S.kpiSub}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={S.secTitle}>Temperature, Rainfall & Irrigation Log</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weather}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
              <XAxis dataKey="day" tick={{ fill:"#64748b", fontSize:11 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:11 }} />
              <Tooltip {...tt} />
              <Line type="monotone" dataKey="temp"       stroke="#fbbf24" strokeWidth={2} dot={false} name="Temp (°C)" />
              <Line type="monotone" dataKey="rain"       stroke="#60a5fa" strokeWidth={2} dot={false} name="Rain (mm)" />
              <Line type="monotone" dataKey="irrigation" stroke="#4ade80" strokeWidth={2} dot={false} name="Irrigation (L)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // ── Disease Analysis ──────────────────────────────────────────────────────
  const Disease = () => (
    <div>
      <div style={S.pageTitle}>Disease Analysis</div>
      <div style={S.pageSub}>Upload a photo and/or describe symptoms for AI-powered diagnosis, severity assessment and prevention steps.</div>

      {/* Photo Upload */}
      <div style={{ ...S.card, marginBottom:18 }}>
        <div style={S.secTitle}>📷 Upload Photo (Optional)</div>
        <div style={{ display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <label
              style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:"2px dashed #1e2535", borderRadius:10, padding:"24px 16px", cursor:"pointer", background:"#0f1117", gap:8 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#4ade80"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2535"}
            >
              <span style={{ fontSize:28 }}>🖼️</span>
              <span style={{ fontSize:13, color:"#64748b", textAlign:"center" }}>
                Click to upload or drag & drop<br />
                <span style={{ fontSize:11 }}>JPG, PNG, WEBP · max 10MB</span>
              </span>
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageUpload} />
            </label>
            {diseaseImage && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, background:"#0d1f17", border:"1px solid #166534", borderRadius:8, padding:"8px 12px" }}>
                <span>✅</span>
                <span style={{ fontSize:12, color:"#86efac", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{diseaseImage.name}</span>
                <button style={{ background:"transparent", border:"none", color:"#f87171", cursor:"pointer", fontSize:16 }} onClick={() => setDiseaseImage(null)}>✕</button>
              </div>
            )}
          </div>
          {diseaseImage && (
            <div>
              <div style={S.label}>Preview</div>
              <img src={diseaseImage.previewUrl} alt="preview"
                style={{ width:160, height:160, objectFit:"cover", borderRadius:10, border:"1px solid #1e2535" }} />
            </div>
          )}
        </div>
      </div>

      {/* Symptom Text */}
      <div style={S.card}>
        <div style={S.secTitle}>🔬 Symptom Description</div>
        <label style={S.label}>Describe observed symptoms (optional if photo uploaded)</label>
        <textarea style={S.textarea}
          placeholder="e.g. Wheat leaves have yellow spots and brown edges, plants look stunted, some leaves are wilting…"
          value={symptoms} onChange={e => setSymptoms(e.target.value)} />
        <button
          style={{ ...S.btn, ...S.btnG, marginTop:12, opacity:(disLoading || (!symptoms.trim() && !diseaseImage)) ? 0.5 : 1 }}
          disabled={disLoading || (!symptoms.trim() && !diseaseImage)}
          onClick={() => {
            const prompt =
              `You are an expert plant and animal disease specialist. ` +
              `Farm location: ${locationName || "India"}. ` +
              `Live weather: ${liveWx ? `${liveWx.temp}°C, ${liveWx.condition}, humidity ${liveWx.humidity}%` : "N/A"}.` +
              (symptoms.trim() ? `\nDescribed symptoms: "${symptoms}"` : "") +
              (diseaseImage ? "\nAn image of the affected plant/animal has been provided — analyse it visually." : "") +
              `\n\n1. Identify visible symptoms from image and/or description` +
              `\n2. Predict the most likely disease(s)` +
              `\n3. Severity: Low / Medium / High` +
              `\n4. Explain the cause` +
              `\n5. Step-by-step preventive measures` +
              `\n6. Treatment & remedy steps`;
            callAIWithImage(prompt, diseaseImage, setDiseaseResult, setDisLoading);
          }}>
          {disLoading ? "Analysing…" : diseaseImage ? "🧬 Analyse Photo + Symptoms" : "🧬 Analyse Symptoms"}
        </button>
      </div>

      {(diseaseResult || disLoading) && (
        <div style={{ ...S.card, marginTop:20 }}>
          <div style={S.secTitle}>🩺 AI Disease Report</div>
          <div style={S.aiBox}>{disLoading ? "Analysing image and symptoms, generating report…" : diseaseResult}</div>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  const pages = {
    dashboard: Dashboard,
    crops:     Crops,
    soil:      Soil,
    livestock: Livestock,
    weather:   WeatherPage,
    disease:   Disease,
  };
  const Page = pages[tab] || Dashboard;

  return (
    <div style={S.app}>
      {/* ── Sidebar ── */}
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoText}>🌿 AgriCore</div>
          <div style={S.logoSub}>Smart Farm Management</div>
        </div>

        <WeatherWidget />
        <KeyWidget />

        <div style={S.nav}>
          {navItems.map(item => (
            <div key={item.id} style={S.navItem(tab === item.id)} onClick={() => setTab(item.id)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ padding:14, borderTop:"1px solid #1e2535", fontSize:11, color:"#475569" }}>
          AgriCore v3.0 · Powered by Groq
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={S.main}>
        <Page />
      </div>
    </div>
  );
}