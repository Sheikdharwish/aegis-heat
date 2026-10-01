import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  Activity, 
  Flame, 
  Shield, 
  Zap, 
  BookOpen, 
  Cpu, 
  Layers, 
  TrendingUp, 
  BarChart2, 
  Download, 
  RefreshCw, 
  ArrowRight, 
  Users, 
  CheckCircle, 
  MapPin, 
  AlertTriangle, 
  Award, 
  Terminal, 
  Database, 
  Server, 
  Code, 
  Info, 
  ArrowUpRight, 
  Check,
  ChevronRight,
  Sparkles,
  Heart
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { DistrictHeatModel } from "../types";
import { AegisLogoIcon } from "./Navigation";

// Mini helper for animating counters
function Counter({ value, suffix = "", duration = 1500 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMiliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className="font-sans font-extrabold tracking-tight text-white">{count.toLocaleString()}{suffix}</span>;
}

interface AegisHomepageProps {
  districts: DistrictHeatModel[];
  setCurrentTab: (tab: string) => void;
  activeDistrictId: string;
  setActiveDistrictId: (id: string) => void;
  systemMode: string;
}

export default function AegisHomepage({
  districts,
  setCurrentTab,
  activeDistrictId,
  setActiveDistrictId,
  systemMode
}: AegisHomepageProps) {
  const [selectedCapability, setSelectedCapability] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("lst");
  const [interactiveTemp, setInteractiveTemp] = useState<number>(42.8);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [showTechTerminal, setShowTechTerminal] = useState<boolean>(false);
  const [scannedCoord, setScannedCoord] = useState({ lat: "28.6139° N", lng: "77.2090° E" });

  const activeDistrict = districts.find(d => d.id === activeDistrictId) || districts[0] || null;

  // Periodic coordinates simulation on the satellite radar
  useEffect(() => {
    const interval = setInterval(() => {
      if (!simulationActive) return;
      const baseLat = 20 + Math.random() * 12;
      const baseLng = 72 + Math.random() * 15;
      setScannedCoord({
        lat: `${baseLat.toFixed(4)}° N`,
        lng: `${baseLng.toFixed(4)}° E`
      });
      // Gently drift interactive temp mock
      setInteractiveTemp(prev => {
        const drift = (Math.random() - 0.5) * 0.4;
        return Math.max(38, Math.min(46, prev + drift));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [simulationActive]);

  // Indicator Charts Data
  const telemetryHistory = [
    { hour: "00:00", lst: 31.2, ndvi: 0.15, wetBulb: 24.8, risk: 52 },
    { hour: "04:00", lst: 29.5, ndvi: 0.15, wetBulb: 24.0, risk: 48 },
    { hour: "08:00", lst: 34.8, ndvi: 0.14, wetBulb: 26.5, risk: 61 },
    { hour: "12:00", lst: 43.5, ndvi: 0.12, wetBulb: 29.8, risk: 85 },
    { hour: "16:00", lst: 41.2, ndvi: 0.12, wetBulb: 28.9, risk: 79 },
    { hour: "20:00", lst: 35.6, ndvi: 0.14, wetBulb: 27.2, risk: 66 },
  ];

  const districtComparisonData = districts.slice(0, 6).map(d => ({
    name: d.name,
    LST: d.lst_current || d.lst || 39.5,
    Risk: d.heat_vulnerability_score || d.heatRiskScore || 50,
    NDVI: (d.ndvi || 0.15) * 100 // Scale for display
  }));

  const steps = [
    {
      title: "Satellite Acquisition",
      code: "GET_TELEMETRY --platform=ECOSTRESS,Landsat-8",
      desc: "Daily multi-spectral feeds ingest land-surface reflectance, thermal infrared bands, and atmospheric profiles.",
      details: "Retrieves 70m spatial resolution thermal bands with sub-Kelvin sensitivity from USGS/NASA networks."
    },
    {
      title: "Physical Calibration",
      code: "CALCULATE_LST --method=SplitWindow --emissivity=NDVI",
      desc: "Translates raw radiance values into absolute Land Surface Temperature (LST) corrected for water vapor.",
      details: "Uses split-window algorithms utilizing bands 10 & 11 of TIRS, integrated with localized atmospheric profiles."
    },
    {
      title: "Index Extraction",
      code: "EXTRACT_INDICES --target=NDVI,Albedo,Impervious",
      desc: "Identifies vegetative health, solar reflectance coefficients, and paved surface fractions.",
      details: "NDVI models relative density of living green canopy. Surface Albedo rates regional thermal reflectance."
    },
    {
      title: "Biophysical Modeling",
      code: "RUN_ENERGY_BALANCE --model=SEBS",
      desc: "Computes sensible, ground, and latent heat fluxes to outline Microclimate thermodynamics.",
      details: "Quantifies the Energy Balance System delta, computing precise anthropogenic and convective atmospheric loads."
    },
    {
      title: "Heat Risk Profiling",
      code: "EVALUATE_VULNERABILITY --census=2026",
      desc: "Blends thermodynamic anomalies with population densities, age curves, and healthcare accessibility.",
      details: "Creates a weighted composite score indexing human exposure factors with remote sensing anomalies."
    },
    {
      title: "Orchestration & Output",
      code: "COMPILE_DIAGNOSTIC_REPORT --format=PDF,JSON",
      desc: "Aggregates raw statistics and optimization indices into policy-ready diagnostics reports.",
      details: "Generates automated warning triggers, municipal cooling designs, and financial budget templates."
    }
  ];

  return (
    <div className="relative bg-transparent min-h-screen text-slate-100 overflow-x-hidden selection:bg-[#00C2FF] selection:text-white">
      
      {/* 3D Atmospheric Depth Glow Orbs aligned with video properties */}
      <div className="absolute top-[8%] left-[5%] w-[450px] h-[450px] rounded-full glow-orb-cyan -z-10 pointer-events-none" />
      <div className="absolute top-[35%] right-[2%] w-[550px] h-[550px] rounded-full glow-orb-orange -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full glow-orb-cyan -z-10 pointer-events-none" />

      {/* 1. FLOATING NAVIGATION BAR (Apple Vision Pro inspired floating capsule) */}
      <header className="sticky top-4 mx-4 sm:mx-6 lg:mx-8 z-50 backdrop-blur-xl bg-slate-950/40 border border-white/10 rounded-2xl transition-all duration-300 shadow-2xl shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentTab("home")}>
            <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-slate-950/65 border border-white/10 shadow-lg group-hover:border-[#00C2FF]/30 transition-all duration-300">
              <AegisLogoIcon className="h-11 w-11 transition-transform duration-300 group-hover:scale-105" />
              {/* Dual ambient glow behind the tiny header logo */}
              <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 bg-[#00C2FF]/10 blur-xs rounded-full" />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#00C2FF]/10 blur-xs rounded-full" />
              </div>
            </div>
            <div>
              <span className="block font-sans font-extrabold text-md tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-[#00C2FF]">
                AEGIS HEAT
              </span>
              <span className="block font-mono text-[9px] text-[#00C2FF] tracking-widest font-bold uppercase">
                CLIMATE INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link items */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/50 backdrop-blur-xl p-1 rounded-full border border-white/10">
            {[
              { label: "Home", tab: "home" },
              { label: "Twin Dashboard", tab: "dashboard" },
              { label: "GIS Explorer", tab: "explorer" },
              { label: "Vulnerability Rankings", tab: "rankings" },
              { label: "Report Generator", tab: "diagnostics-paper" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setCurrentTab(item.tab)}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 active:scale-95 hover:shadow-xs transition-all font-sans"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Call to Action Trigger */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentTab("dashboard")}
              className="px-5 py-2 rounded-xl bg-[#00C2FF]/15 hover:bg-[#00C2FF]/30 text-white border border-[#00C2FF]/35 backdrop-blur-md text-xs font-bold font-mono tracking-tight shadow-md hover:shadow-lg hover:shadow-[#00C2FF]/10 active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>LAUNCH PLATFORM</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Mission copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00C2FF]/10 rounded-full border border-[#00C2FF]/20 text-[10px] font-mono font-extrabold tracking-wider text-[#00C2FF] uppercase animate-pulse">
              <Sparkles className="h-3 w-3" />
              <span>ISRO-NASA MULTI-SENSOR FEDERATED SYSTEM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[70px] font-extrabold tracking-tight font-display leading-[1.05] text-white">
              Transforming <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00C2FF] via-indigo-400 to-[#00E676] drop-shadow-[0_2px_15px_rgba(0,194,255,0.15)]">Satellite Data</span> <br className="hidden lg:block" />into Climate Intelligence
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
              AI-powered platform for heat risk assessment, environmental monitoring, climate analytics, and decision support using Earth Observation data. Harnessing satellite-derived thermodynamic models to project, validate, and mitigate extreme urban heatwaves.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => setCurrentTab("dashboard")}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0099FF] to-[#00C2FF] hover:from-[#0088EE] hover:to-[#00B2EE] text-white font-sans font-extrabold text-sm shadow-[0_0_20px_rgba(0,153,255,0.25)] hover:shadow-[0_0_25px_rgba(0,153,255,0.4)] active:scale-98 hover:-translate-y-0.5 transition-all flex items-center gap-2.5"
              >
                <span>Explore Live Dashboard</span>
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </button>
              <button 
                onClick={() => setCurrentTab("diagnostics-paper")}
                className="px-6 py-3.5 rounded-xl bg-slate-950/40 border border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-100 font-sans font-semibold text-sm shadow-xs active:scale-98 transition-all flex items-center gap-2.5"
              >
                <BookOpen className="h-4 w-4 text-[#0099FF]" />
                <span>Generate Climate Report</span>
              </button>
            </div>

            {/* Quick Micro-Telemetry Card */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg font-sans">
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">INGESTION RATE</span>
                <span className="block font-mono text-xs font-extrabold text-[#00E676] mt-1">2.4 TB / DAY</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">SPATIAL RESOLUTION</span>
                <span className="block font-mono text-xs font-extrabold text-slate-200 mt-1">70M THERMAL</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">PREDICTION LAG</span>
                <span className="block font-mono text-xs font-extrabold text-[#0099FF] mt-1">&lt; 40MS (REALTIME)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Breathtaking Interactive Satellite Radar Globe */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-[420px] aspect-square rounded-full border border-white/5 p-4 flex items-center justify-center bg-slate-950/20 shadow-lg backdrop-blur-lg">
              
              {/* Outer sweeping rotating circular bounds */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00C2FF]/20 animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-6 rounded-full border border-dashed border-[#00C2FF]/20 animate-[spin_25s_linear_infinite_reverse]" />
              <div className="absolute inset-16 rounded-full border border-[#00C2FF]/10" />

              {/* Glowing Atmosphere Overlay */}
              <div className="absolute inset-20 bg-gradient-to-br from-[#00C2FF]/15 via-[#00C2FF]/10 to-transparent rounded-full blur-xl pointer-events-none" />

              {/* Beautiful custom vector India Thermal Scanner Graphic */}
              <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 select-none">
                <defs>
                  <radialGradient id="heatGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.45" />
                    <stop offset="35%" stopColor="#00C2FF" stopOpacity="0.25" />
                    <stop offset="70%" stopColor="#00C2FF" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C2FF" />
                    <stop offset="50%" stopColor="#00E676" />
                    <stop offset="100%" stopColor="#00C2FF" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <circle cx="200" cy="200" r="140" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 3" />
                <circle cx="200" cy="200" r="100" stroke="#334155" strokeWidth="0.75" />
                <circle cx="200" cy="200" r="60" stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
                
                {/* Crosshair Sweep Lines */}
                <line x1="200" y1="40" x2="200" y2="360" stroke="#334155" strokeWidth="0.75" />
                <line x1="40" y1="200" x2="360" y2="200" stroke="#334155" strokeWidth="0.75" />

                {/* Center Core Logo Badge */}
                <circle cx="200" cy="200" r="28" fill="#020617" stroke="#00C2FF" strokeWidth="1" className="opacity-90" />
                <circle cx="200" cy="200" r="33" fill="none" stroke="#00C2FF" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-40 animate-pulse" />
                
                {/* Stylized geometric graphic inside center core circle */}
                <polygon points="200,185 212,192 212,208 200,215 188,208 188,192" stroke="#00C2FF" strokeWidth="1.5" fill="none" />
                <path d="M 194 207 L 200 193 L 206 207 M 196 202 L 204 202" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Simulated Heatmap Anomalies */}
                <circle cx="180" cy="190" r="45" fill="url(#heatGlow)" />
                <circle cx="230" cy="220" r="30" fill="url(#heatGlow)" opacity="0.8" />
                <circle cx="160" cy="240" r="25" fill="url(#heatGlow)" opacity="0.5" />

                {/* Animated Scanner Radar Line */}
                <g className="origin-center animate-[spin_10s_linear_infinite]">
                  <line x1="200" y1="200" x2="200" y2="60" stroke="#00C2FF" strokeWidth="1.5" strokeLinecap="round" />
                  <polygon points="200,200 200,60 170,80" fill="url(#heatGlow)" opacity="0.15" />
                </g>

                {/* Satellite Orbit paths & Mock Satellites */}
                <ellipse cx="200" cy="200" rx="150" ry="85" stroke="url(#orbitGrad)" strokeWidth="0.75" fill="none" opacity="0.4" transform="rotate(-25 200 200)" />
                <g className="animate-[spin_18s_linear_infinite]" style={{ transformOrigin: "200px 200px" }}>
                  <circle cx="200" cy="40" r="4" fill="#00C2FF" />
                  <circle cx="200" cy="40" r="10" stroke="#00C2FF" strokeWidth="1" fill="none" className="animate-ping" />
                  <text x="210" y="44" fill="#0099FF" fontSize="8" fontFamily="monospace" fontWeight="bold">LANDSAT-8</text>
                </g>

                <ellipse cx="200" cy="200" rx="175" ry="50" stroke="url(#orbitGrad)" strokeWidth="0.75" fill="none" opacity="0.3" transform="rotate(35 200 200)" />
                <g className="animate-[spin_24s_linear_infinite_reverse]" style={{ transformOrigin: "200px 200px" }}>
                  <circle cx="25" cy="200" r="3.5" fill="#00E676" />
                  <text x="35" y="204" fill="#00E676" fontSize="8" fontFamily="monospace" fontWeight="bold">SENTINEL-2</text>
                </g>

                {/* Interactive Dot at scanning coordinate */}
                <circle cx="215" cy="180" r="5" fill="#00C2FF" className="animate-pulse" />
                <circle cx="215" cy="180" r="12" stroke="#00C2FF" strokeWidth="1" fill="none" className="animate-ping" />
              </svg>

              {/* Floating Real-time HUD stats */}
              <div className="absolute top-4 left-4 bg-slate-955/40 border border-white/10 p-2.5 rounded-lg text-left shadow-md backdrop-blur-md">
                <span className="block text-[8px] font-mono text-slate-400 font-bold">TELEMETRY LOCK</span>
                <span className="block font-mono text-[10px] font-bold text-[#0099FF] mt-0.5">{scannedCoord.lat}</span>
                <span className="block font-mono text-[10px] font-bold text-[#0099FF]">{scannedCoord.lng}</span>
              </div>

              <div className="absolute bottom-4 right-4 bg-slate-955/40 border border-white/10 p-2.5 rounded-lg text-left shadow-md backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="block text-[8px] font-mono text-slate-400 font-bold">HOTSPOT PEAK</span>
                </div>
                <span className="block font-sans text-xs font-bold text-[#00C2FF] mt-1">{interactiveTemp.toFixed(1)}°C LST</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2.5 EARTH OBSERVATION & CLIMATE INTELLIGENCE NETWORK */}
      <section id="earth-observation-section" className="py-20 relative overflow-hidden z-10 border-t border-b border-white/5 bg-slate-950/20 backdrop-blur-xs">
        {/* Advanced Visuals: Constellation / Grid background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
        
        {/* Animated Satellite Orbit Path overlay in background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <svg className="w-full h-full min-w-[1200px] mx-auto opacity-40" viewBox="0 0 1000 600">
            {/* Ellipse orbit 1 */}
            <path 
              d="M 100,300 Q 500,100 900,300 Q 500,500 100,300" 
              fill="none" 
              stroke="url(#orbitLineGrad)" 
              strokeWidth="1" 
              strokeDasharray="6 6"
            />
            {/* Ellipse orbit 2 */}
            <path 
              d="M 150,250 Q 500,450 850,250" 
              fill="none" 
              stroke="#00C2FF" 
              strokeWidth="0.5" 
              opacity="0.5"
            />
            {/* Constellation lines */}
            <polyline points="200,150 250,180 320,140 400,210" fill="none" stroke="#00C2FF" strokeWidth="0.5" opacity="0.3" />
            <circle cx="200" cy="150" r="1.5" fill="#00C2FF" />
            <circle cx="250" cy="180" r="1.5" fill="#00C2FF" />
            <circle cx="320" cy="140" r="1.5" fill="#00C2FF" />
            <circle cx="400" cy="210" r="1.5" fill="#00C2FF" />
            
            <polyline points="700,450 780,410 850,440" fill="none" stroke="#FF6B35" strokeWidth="0.5" opacity="0.3" />
            <circle cx="700" cy="450" r="1.5" fill="#FF6B35" />
            <circle cx="780" cy="410" r="1.5" fill="#FF6B35" />
            <circle cx="850" cy="440" r="1.5" fill="#FF6B35" />
            
            {/* Custom Gradients */}
            <defs>
              <linearGradient id="orbitLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#00E676" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Ambient environmental glow effects */}
        <div className="absolute -top-40 left-1/3 w-96 h-96 bg-[#00C2FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-[#FF6B35]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-[10px] font-mono font-extrabold tracking-wider text-indigo-400 uppercase">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
              SATELLITE DATA SOURCE DIRECTORY
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white">
              EARTH OBSERVATION & CLIMATE INTELLIGENCE NETWORK
            </h2>
            
            <p className="text-slate-300 max-w-3xl mx-auto text-sm sm:text-base font-sans font-medium leading-relaxed">
              Powered by Multi-Source Earth Observation Data, Environmental Monitoring Systems, and AI-Driven Climate Intelligence.
            </p>
            
            <div className="w-24 h-1 bg-gradient-to-r from-[#00C2FF] via-indigo-500 to-[#00E676] mx-auto rounded-full mt-4" />
          </div>

          {/* Source Grid: 4 columns desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Landsat-8 */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 relative group hover:border-[#00C2FF]/30 hover:shadow-[0_0_30px_rgba(0,194,255,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C2FF]/5 rounded-full blur-xl group-hover:bg-[#00C2FF]/10 transition-colors pointer-events-none" />
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#00C2FF]/10 rounded-xl border border-[#00C2FF]/20 text-[#00C2FF]">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">CALIBRATED</span>
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-mono font-extrabold text-lg text-white tracking-tight group-hover:text-[#00C2FF] transition-colors">LANDSAT-8</h3>
                  <p className="text-[11px] font-mono text-[#00C2FF] uppercase tracking-wider font-semibold">Land Surface Temperature Mapping</p>
                  <p className="text-slate-350 text-xs font-sans leading-relaxed pt-1">
                    Multi-spectral thermal bands provide sub-Kelvin land surface energy signatures.
                  </p>
                </div>
                {/* Outputs List */}
                <div className="pt-3 border-t border-white/5 space-y-1 text-[11px] font-mono text-slate-300">
                  <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider">KEY OUTPUTS:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">LST</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Thermal Anomalies</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">UHI Index</span>
                  </div>
                </div>
              </div>
              {/* Footer Badge */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-455 uppercase">REFRESH</span>
                <span className="px-2 py-0.5 bg-[#00C2FF]/10 text-[#00C2FF] rounded-md font-bold border border-[#00C2FF]/25">16 DAYS</span>
              </div>
            </div>

            {/* Sentinel-2 */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 relative group hover:border-[#00E676]/30 hover:shadow-[0_0_30px_rgba(0,230,118,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E676]/5 rounded-full blur-xl group-hover:bg-[#00E676]/10 transition-colors pointer-events-none" />
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#00E676]/10 rounded-xl border border-[#00E676]/20 text-[#00E676]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">OPERATIONAL</span>
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-mono font-extrabold text-lg text-white tracking-tight group-hover:text-[#00E676] transition-colors">SENTINEL-2</h3>
                  <p className="text-[11px] font-mono text-[#00E676] uppercase tracking-wider font-semibold">Vegetation & Land Cover Analysis</p>
                  <p className="text-slate-350 text-xs font-sans leading-relaxed pt-1">
                    Copernicus multispectral imaging captures detailed chlorophyll activity and surface reflectivity indices.
                  </p>
                </div>
                {/* Outputs List */}
                <div className="pt-3 border-t border-white/5 space-y-1 text-[11px] font-mono text-slate-300">
                  <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">KEY OUTPUTS:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">NDVI</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Land Use</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Canopy %</span>
                  </div>
                </div>
              </div>
              {/* Footer Badge */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-455 uppercase">REFRESH</span>
                <span className="px-2 py-0.5 bg-[#00E676]/10 text-[#00E676] rounded-md font-bold border border-[#00E676]/25">5 DAYS</span>
              </div>
            </div>

            {/* Ecostress */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 relative group hover:border-[#FF6B35]/30 hover:shadow-[0_0_30px_rgba(255,107,53,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B35]/5 rounded-full blur-xl group-hover:bg-[#FF6B35]/10 transition-colors pointer-events-none" />
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#FF6B35]/10 rounded-xl border border-[#FF6B35]/20 text-[#FF6B35]">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">CONNECTED</span>
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-mono font-extrabold text-lg text-white tracking-tight group-hover:text-[#FF6B35] transition-colors">ECOSTRESS</h3>
                  <p className="text-[11px] font-mono text-[#FF6B35] uppercase tracking-wider font-semibold">Surface Thermal Validation</p>
                  <p className="text-slate-350 text-xs font-sans leading-relaxed pt-1">
                    ISS sensor tracking diurnal temperature patterns and plant evaporative cooling trends.
                  </p>
                </div>
                {/* Outputs List */}
                <div className="pt-3 border-t border-white/5 space-y-1 text-[11px] font-mono text-slate-300">
                  <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">KEY OUTPUTS:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Thermal Stress</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Evaporative Flux</span>
                  </div>
                </div>
              </div>
              {/* Footer Badge */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-455 uppercase">REFRESH</span>
                <span className="px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-md font-bold border border-[#FF6B35]/25">VARIABLE</span>
              </div>
            </div>

            {/* ERA5 */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 relative group hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">ACTIVE STREAM</span>
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-mono font-extrabold text-lg text-white tracking-tight group-hover:text-indigo-400 transition-colors">ERA5</h3>
                  <p className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Atmospheric Monitoring</p>
                  <p className="text-slate-350 text-xs font-sans leading-relaxed pt-1">
                    ECMWF reanalysis data detailing ambient temperature, convective wind, and humidity profiles.
                  </p>
                </div>
                {/* Outputs List */}
                <div className="pt-3 border-t border-white/5 space-y-1 text-[11px] font-mono text-slate-300">
                  <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">KEY OUTPUTS:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Air Temp</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Humidity</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Wind Velocity</span>
                  </div>
                </div>
              </div>
              {/* Footer Badge */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-455 uppercase">REFRESH</span>
                <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-400 rounded-md font-bold border border-indigo-500/25">HOURLY</span>
              </div>
            </div>

            {/* CPCB */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 relative group hover:border-[#00C2FF]/30 hover:shadow-[0_0_30px_rgba(0,194,255,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C2FF]/5 rounded-full blur-xl group-hover:bg-[#00C2FF]/10 transition-colors pointer-events-none" />
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#00C2FF]/10 rounded-xl border border-[#00C2FF]/20 text-[#00C2FF]">
                    <Database className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">INGESTING</span>
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-mono font-extrabold text-lg text-white tracking-tight group-hover:text-[#00C2FF] transition-colors">CPCB</h3>
                  <p className="text-[11px] font-mono text-[#00C2FF] uppercase tracking-wider font-semibold">Air Quality Monitoring</p>
                  <p className="text-slate-350 text-xs font-sans leading-relaxed pt-1">
                    Central Pollution Control Board of India ground stations monitoring particulate concentrations.
                  </p>
                </div>
                {/* Outputs List */}
                <div className="pt-3 border-t border-white/5 space-y-1 text-[11px] font-mono text-slate-300">
                  <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">KEY OUTPUTS:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">AQI Index</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">PM2.5 / PM10</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">NO₂ / SO₂</span>
                  </div>
                </div>
              </div>
              {/* Footer Badge */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-455 uppercase">REFRESH</span>
                <span className="px-2 py-0.5 bg-[#00C2FF]/10 text-[#00C2FF] rounded-md font-bold border border-[#00C2FF]/25">NEAR REAL-TIME</span>
              </div>
            </div>

            {/* OpenStreetMap */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 relative group hover:border-[#00E676]/30 hover:shadow-[0_0_30px_rgba(0,230,118,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E676]/5 rounded-full blur-xl group-hover:bg-[#00E676]/10 transition-colors pointer-events-none" />
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#00E676]/10 rounded-xl border border-[#00E676]/20 text-[#00E676]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">SYNCHRONIZED</span>
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-mono font-extrabold text-lg text-white tracking-tight group-hover:text-[#00E676] transition-colors">OPENSTREETMAP</h3>
                  <p className="text-[11px] font-mono text-[#00E676] uppercase tracking-wider font-semibold">Urban Infrastructure Mapping</p>
                  <p className="text-slate-350 text-xs font-sans leading-relaxed pt-1">
                    Continuous geographic database tracking road grids, building shapes, and urban green-blue networks.
                  </p>
                </div>
                {/* Outputs List */}
                <div className="pt-3 border-t border-white/5 space-y-1 text-[11px] font-mono text-slate-300">
                  <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">KEY OUTPUTS:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Road Grids</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Urban Assets</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Water Bodies</span>
                  </div>
                </div>
              </div>
              {/* Footer Badge */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-455 uppercase">REFRESH</span>
                <span className="px-2 py-0.5 bg-[#00E676]/10 text-[#00E676] rounded-md font-bold border border-[#00E676]/25">CONTINUOUS</span>
              </div>
            </div>

            {/* WorldPop */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 relative group hover:border-[#FF6B35]/30 hover:shadow-[0_0_30px_rgba(255,107,53,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B35]/5 rounded-full blur-xl group-hover:bg-[#FF6B35]/10 transition-colors pointer-events-none" />
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#FF6B35]/10 rounded-xl border border-[#FF6B35]/20 text-[#FF6B35]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">VERIFIED</span>
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-mono font-extrabold text-lg text-white tracking-tight group-hover:text-[#FF6B35] transition-colors">WORLDPOP</h3>
                  <p className="text-[11px] font-mono text-[#FF6B35] uppercase tracking-wider font-semibold">Population Exposure Assessment</p>
                  <p className="text-slate-350 text-xs font-sans leading-relaxed pt-1">
                    Spatial demographic analytics modeling population distribution patterns and density.
                  </p>
                </div>
                {/* Outputs List */}
                <div className="pt-3 border-t border-white/5 space-y-1 text-[11px] font-mono text-slate-300">
                  <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">KEY OUTPUTS:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Pop Density</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Exposure Maps</span>
                  </div>
                </div>
              </div>
              {/* Footer Badge */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-455 uppercase">REFRESH</span>
                <span className="px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-md font-bold border border-[#FF6B35]/25">ANNUAL</span>
              </div>
            </div>

            {/* GHSL */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 relative group hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                    <Server className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">CATALOGED</span>
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="font-mono font-extrabold text-lg text-white tracking-tight group-hover:text-indigo-400 transition-colors">GHSL</h3>
                  <p className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Urban Morphology Analysis</p>
                  <p className="text-slate-350 text-xs font-sans leading-relaxed pt-1">
                    Global Human Settlement Layer classifying built-up densities and spatial urban structures.
                  </p>
                </div>
                {/* Outputs List */}
                <div className="pt-3 border-t border-white/5 space-y-1 text-[11px] font-mono text-slate-300">
                  <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">KEY OUTPUTS:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Built Density</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded text-white font-bold">Settlement Blocks</span>
                  </div>
                </div>
              </div>
              {/* Footer Badge */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-455 uppercase">REFRESH</span>
                <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-400 rounded-md font-bold border border-indigo-500/25">PERIODIC</span>
              </div>
            </div>

          </div>

          {/* EARTH OBSERVATION PIPELINE */}
          <div className="mt-24 space-y-8">
            <div className="text-center space-y-3">
              <div className="text-xs font-mono text-[#00E676] tracking-widest font-extrabold uppercase">
                REAL-TIME INGESTION & PROCESSING FLOW
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
                EARTH OBSERVATION PIPELINE
              </h3>
              <p className="text-slate-350 text-xs max-w-xl mx-auto">
                Watch raw multi-spectral data streams transform from orbit readings into local heatwave mitigation policies.
              </p>
            </div>

            {/* Pipeline Visualization */}
            <div className="p-8 rounded-2xl bg-slate-950/40 border border-white/10 relative overflow-hidden shadow-2xl">
              {/* Neural grid connector lines */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,194,255,0.04),transparent_60%)] pointer-events-none" />
              
              {/* Moving data packets (CSS animation overlay) */}
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#00C2FF] to-transparent opacity-20 pointer-events-none hidden lg:block" />

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 relative z-10 text-center font-mono">
                
                {/* Step 1 */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 hover:border-[#00C2FF]/40 group transition-all flex flex-col justify-between space-y-3 shadow-md">
                  <div className="text-[10px] text-slate-450 font-extrabold">STEP 01</div>
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Globe className="h-6 w-6 text-[#00C2FF] animate-pulse" />
                    <span className="text-xs font-extrabold text-white leading-tight">Satellite Data</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Ingests multi-spectral raw imagery from USGS and ESA networks.
                  </p>
                </div>

                {/* Arrow Column 1 */}
                <div className="hidden lg:flex items-center justify-center text-slate-600 animate-pulse">
                  <ChevronRight className="h-5 w-5 text-[#00C2FF]" />
                </div>

                {/* Step 2 */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 hover:border-[#00E676]/40 group transition-all flex flex-col justify-between space-y-3 shadow-md">
                  <div className="text-[10px] text-slate-455 font-extrabold">STEP 02</div>
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Database className="h-6 w-6 text-[#00E676]" />
                    <span className="text-xs font-extrabold text-white leading-tight">Data Engineering</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Cleans, aligns, and geometrically corrects raw orbital imagery.
                  </p>
                </div>

                {/* Arrow Column 2 */}
                <div className="hidden lg:flex items-center justify-center text-slate-600 animate-pulse">
                  <ChevronRight className="h-5 w-5 text-[#00C2FF]" />
                </div>

                {/* Step 3 */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 hover:border-indigo-400/40 group transition-all flex flex-col justify-between space-y-3 shadow-md">
                  <div className="text-[10px] text-slate-455 font-extrabold">STEP 03</div>
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Layers className="h-6 w-6 text-indigo-400" />
                    <span className="text-xs font-extrabold text-white leading-tight">Feature Extraction</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Extracts NDVI vegetation indices, albedo, and surface cover.
                  </p>
                </div>

                {/* Arrow Column 3 */}
                <div className="hidden lg:flex items-center justify-center text-slate-600 animate-pulse">
                  <ChevronRight className="h-5 w-5 text-indigo-400" />
                </div>

                {/* Step 4 */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 hover:border-amber-400/40 group transition-all flex flex-col justify-between space-y-3 shadow-md">
                  <div className="text-[10px] text-slate-455 font-extrabold">STEP 04</div>
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Flame className="h-6 w-6 text-amber-400" />
                    <span className="text-xs font-extrabold text-white leading-tight">Physics Heat Engine</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Calculates surface thermodynamic temperatures & energy balances.
                  </p>
                </div>

                {/* Arrow Column 4 */}
                <div className="hidden lg:flex items-center justify-center text-slate-600 animate-pulse">
                  <ChevronRight className="h-5 w-5 text-amber-400" />
                </div>

                {/* Step 5 */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 hover:border-[#FF6B35]/40 group transition-all flex flex-col justify-between space-y-3 shadow-md">
                  <div className="text-[10px] text-slate-455 font-extrabold">STEP 05</div>
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Cpu className="h-6 w-6 text-[#FF6B35]" />
                    <span className="text-xs font-extrabold text-white leading-tight">AI Risk Assessment</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Integrates population density datasets to score human vulnerability.
                  </p>
                </div>

                {/* Arrow Column 5 */}
                <div className="hidden lg:flex items-center justify-center text-slate-600 animate-pulse">
                  <ChevronRight className="h-5 w-5 text-[#FF6B35]" />
                </div>

                {/* Step 6 */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 hover:border-violet-400/40 group transition-all flex flex-col justify-between space-y-3 shadow-md">
                  <div className="text-[10px] text-slate-455 font-extrabold">STEP 06</div>
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Sparkles className="h-6 w-6 text-violet-400" />
                    <span className="text-xs font-extrabold text-white leading-tight">Budget Optimization</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Runs climate budget simulations to maximize local cooling effects.
                  </p>
                </div>

                {/* Arrow Column 6 */}
                <div className="hidden lg:flex items-center justify-center text-slate-600 animate-pulse">
                  <ChevronRight className="h-5 w-5 text-violet-400" />
                </div>

                {/* Step 7 */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 hover:border-[#00E676]/40 group transition-all flex flex-col justify-between space-y-3 shadow-md">
                  <div className="text-[10px] text-slate-455 font-extrabold">STEP 07</div>
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Shield className="h-6 w-6 text-[#00E676]" />
                    <span className="text-xs font-extrabold text-white leading-tight">Climate Decision Support</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    Delivers localized, policy-ready directives to administrative councils.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. LIVE IMPACT METRICS WITH ANIMATED COUNTERS (Housed inside a floating glass capsule) */}
      <section className="py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl py-10 px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10 shadow-2xl">
            
            {/* Metric 1 */}
            <div className="flex flex-col items-center justify-center p-4 hover:scale-105 transition-transform duration-300">
              <div className="h-10 w-10 rounded-lg bg-[#00C2FF]/10 flex items-center justify-center mb-3 border border-[#00C2FF]/20 shadow-[0_0_15px_rgba(0,194,255,0.1)]">
                <MapPin className="h-5 w-5 text-[#0099FF]" />
              </div>
              <div className="text-3xl md:text-4.5xl font-extrabold text-white tracking-tight font-display">
                <Counter value={districts.length > 0 ? districts.length : 120} suffix="+" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-2 font-bold">Districts Monitored</span>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col items-center justify-center p-4 pt-8 lg:pt-4 hover:scale-105 transition-transform duration-300">
              <div className="h-10 w-10 rounded-lg bg-[#00E676]/10 flex items-center justify-center mb-3 border border-[#00E676]/20 shadow-[0_0_15px_rgba(0,230,118,0.1)]">
                <Activity className="h-5 w-5 text-[#00E676]" />
              </div>
              <div className="text-3xl md:text-4.5xl font-extrabold text-white tracking-tight font-display">
                <Counter value={18} suffix="" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-2 font-bold">Climate Indicators</span>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col items-center justify-center p-4 pt-8 lg:pt-4 hover:scale-105 transition-transform duration-300">
              <div className="h-10 w-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center mb-3 border border-[#FF6B35]/20 shadow-[0_0_15px_rgba(255,107,53,0.1)]">
                <Layers className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div className="text-3xl md:text-4.5xl font-extrabold text-white tracking-tight font-display">
                <Counter value={47} suffix=" Layers" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-2 font-bold">Satellite Datasets</span>
            </div>

            {/* Metric 4 */}
            <div className="flex flex-col items-center justify-center p-4 pt-8 lg:pt-4 hover:scale-105 transition-transform duration-300">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Cpu className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="text-3xl md:text-4.5xl font-extrabold text-white tracking-tight font-display">
                <Counter value={14} suffix=".8M+" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-2 font-bold">AI Insights Generated</span>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PLATFORM CAPABILITIES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-3 mb-16">
          <div className="text-xs font-mono text-[#00C2FF] tracking-widest font-extrabold uppercase">
            EXPLORE PLATFORM ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white mt-1">
            Core Scientific Capabilities
          </h2>
          <p className="text-slate-350 max-w-2xl mx-auto text-sm">
            Fusing micro-satellite multispectral imaging with physics-informed deep learning models to combat critical extreme heat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Capability cards list */}
          <div className="lg:col-span-4 space-y-3">
            {[
              { title: "Climate Monitoring", subtitle: "LST & Radiative Flux Ingestion", icon: Globe, color: "text-[#0099FF]" },
              { title: "Heat Risk Assessment", subtitle: "Weighted Vulnerability Indices", icon: Flame, color: "text-[#FF6B35]" },
              { title: "Urban Heat Islands", subtitle: "Impervious-NDVI Micro-modeling", icon: Layers, color: "text-[#00E676]" },
              { title: "Environmental Intelligence", subtitle: "Aerosols, Canopy & Water Assets", icon: Activity, color: "text-sky-500" },
              { title: "AI Analytics", subtitle: "Predictive Forecasting Networks", icon: Cpu, color: "text-indigo-500" },
              { title: "Automated Report Gen", subtitle: "Policy Diagnostics & Briefings", icon: BookOpen, color: "text-pink-500" }
            ].map((cap, idx) => {
              const Icon = cap.icon;
              const isSelected = selectedCapability === idx;
              return (
                <button
                  key={cap.title}
                  onClick={() => setSelectedCapability(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group hover:-translate-y-0.5 ${
                    isSelected 
                      ? "bg-gradient-to-r from-[#00C2FF]/15 to-transparent border-[#00C2FF]/40 shadow-[0_4px_25px_rgba(0,194,255,0.15)] text-white backdrop-blur-xl" 
                      : "bg-slate-950/30 hover:bg-white/5 border-white/5 hover:border-white/15 text-slate-300 backdrop-blur-md"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`h-9 w-9 rounded-lg bg-slate-900/40 border border-white/5 flex items-center justify-center ${isSelected ? cap.color : "text-slate-400"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className={`block text-xs font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>{cap.title}</span>
                      <span className="block text-[10px] font-mono text-slate-450 mt-0.5">{cap.subtitle}</span>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-slate-450 transition-transform ${isSelected ? "translate-x-1 text-[#0099FF]" : "group-hover:translate-x-0.5"}`} />
                </button>
              );
            })}
          </div>

          {/* Right panel: Active Capability interactive showcase */}
          <div className="lg:col-span-8 glass-card rounded-2xl p-6 lg:p-8 min-h-[460px] flex flex-col justify-between relative overflow-hidden shadow-2xl">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCapability}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[9px] font-mono font-extrabold text-[#0099FF] tracking-widest uppercase">
                      CAPABILITY #{selectedCapability + 1}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676]" />
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">PHYSICS-INFORMED PIPELINE</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold font-sans text-white mt-3">
                    {[
                      "Satellite Thermal Ingestion & Calibration",
                      "Weighted Heat Vulnerability Profile",
                      "Canopy-Scale Urban Heat Island Identification",
                      "Federated Environmental Telemetry Aggregation",
                      "Predictive Neural Forecast Models",
                      "Automated Legislative Climate Diagnostics"
                    ][selectedCapability]}
                  </h3>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-3">
                    {[
                      "AEGIS aggregates Landsat-8 TIRS and Sentinel-3 SLSTR thermal sensors automatically. Using physics-based split-window corrections, we reconstruct Land Surface Temperature (LST) with sub-kelvin precision, monitoring severe environmental stress areas daily.",
                      "Our risk indexing is socially aware. We overlay thermodynamic observations with regional grid population density, vulnerability curves (infant and elderly demographics), microclimate cooling asset ratios, and real-time medical facility accessibility indexes.",
                      "Examines critical spatial urban density anomalies. By tracing canopy cover, impervious paving indices, NDVI ratios, and surface albedo coefficients, our models pinpoint extreme localized heat islands down to microclimate resolutions of 70 meters.",
                      "Federates multiple environmental data channels, monitoring atmospheric air pollution (AQI), vegetation droughts, canopy health degradation index, surface water moisture buffers, and sensible/latent heat radiation fluxes continuously.",
                      "Utilizes physics-informed convolutional neural networks (PINN) to project air temperatures, heat vulnerability, and macroclimate changes 72 hours ahead. Triggers automated warning notifications dynamically to critical regional administrators.",
                      "Synthesizes processed GIS datasets, cooling action recommendations, and thermal statistics directly into professional compliance briefings. Empowers municipal teams to immediately draft capital urban layout updates."
                    ][selectedCapability]}
                  </p>
                </div>

                {/* Simulated telemetry graphic inside capability cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  
                  {/* Visual telemetry simulation */}
                  <div className="p-4 bg-slate-950/30 rounded-xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">GIS RASTER MATRIX</span>
                      <span className="text-[9px] font-mono text-[#00E676] bg-[#00E676]/8 px-1.5 py-0.5 rounded border border-[#00E676]/15 font-bold">STATUS: CONVERGED</span>
                    </div>

                    <div className="grid grid-cols-8 gap-1.5 h-20 select-none">
                      {Array.from({ length: 32 }).map((_, i) => {
                        // Create gradient colors reflecting heat map
                        let bg = "bg-slate-800";
                        if (selectedCapability === 0) {
                          bg = i % 5 === 0 ? "bg-[#FF6B35]" : i % 3 === 0 ? "bg-[#FF6B35]/60" : "bg-sky-500/40";
                        } else if (selectedCapability === 1) {
                          bg = i % 4 === 0 ? "bg-red-500" : i % 3 === 0 ? "bg-orange-500/70" : "bg-slate-700";
                        } else if (selectedCapability === 2) {
                          bg = i % 6 === 0 ? "bg-[#00E676]" : i % 3 === 0 ? "bg-[#00E676]/40" : "bg-[#FF6B35]/60";
                        } else {
                          bg = i % 4 === 0 ? "bg-[#00C2FF]" : i % 5 === 0 ? "bg-indigo-500" : "bg-slate-800";
                        }
                        return (
                          <div 
                            key={i} 
                            className={`rounded-sm transition-all duration-500 ${bg} hover:scale-110 cursor-pointer`}
                            title={`Pixel ID: 0x${i.toString(16)}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Technical variables info */}
                  <div className="p-4 bg-slate-950/30 rounded-xl border border-white/10 flex flex-col justify-between backdrop-blur-sm">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">PIPELINE METADATA</span>
                      <div className="space-y-1.5 mt-2.5">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-450">Processing Engine:</span>
                          <span className="font-bold text-slate-200">FastAPI GIS Worker</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-450">Calibration Method:</span>
                          <span className="font-bold text-slate-200">Split-Window (TIRS-11)</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-450">Data Refresh Cycle:</span>
                          <span className="font-bold text-[#00E676]">24 Hours</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => document.getElementById("earth-observation-section")?.scrollIntoView({ behavior: "smooth" })}
                      className="text-[9px] font-mono font-bold text-[#0099FF] hover:text-[#007acc] flex items-center gap-1 mt-3"
                    >
                      <span>INSPECT SATELLITE SYSTEM ENGINE</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS - WORKFLOW TIMELINE */}
      <section className="py-20 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-mono text-[#00C2FF] tracking-widest font-extrabold uppercase">
              TRANSPARENT CLIMATE METRIC LIFECYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white mt-1">
              Dynamic Telemetry Workflow
            </h2>
            <p className="text-slate-350 max-w-2xl mx-auto text-sm">
              Follow the journey of a single climate indicator, from raw orbital radiance measurements to policy intervention action designs.
            </p>
          </div>

          {/* Timeline Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative">
            
            {/* Visual connecting trace line */}
            <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#00C2FF] via-[#00E676] to-[#FF6B35] opacity-20 z-0" />

            {steps.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <div 
                  key={step.title}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer group flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 z-10 hover:-translate-y-1 ${
                    isSelected 
                      ? "bg-gradient-to-b from-[#00C2FF]/20 to-transparent border-[#00C2FF]/40 shadow-[0_4px_25px_rgba(0,194,255,0.15)] scale-102 backdrop-blur-xl" 
                      : "bg-slate-950/40 border-white/10 hover:border-white/20 shadow-sm backdrop-blur-md"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-black h-8 w-8 rounded-lg flex items-center justify-center ${
                        isSelected 
                          ? "bg-[#0099FF] text-white" 
                          : "bg-slate-950/40 text-slate-400 group-hover:text-slate-100 border border-white/5"
                      }`}>
                        0{idx + 1}
                      </span>
                      {isSelected && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-200 font-sans group-hover:text-[#0099FF] transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1.5 line-clamp-3 font-sans">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Micro coding label on hover/active */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="block font-mono text-[8px] text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                      {step.code}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workflow details expansion box */}
          <div className="mt-8 p-5 glass-card rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <div className="bg-slate-950/40 border border-white/10 p-2.5 rounded-lg text-[#0099FF]">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[8px] font-mono text-slate-400 tracking-wider uppercase font-bold">
                  ACTIVE STAGE CODE DESCRIPTION & CALIBRATION DATA
                </span>
                <span className="block font-mono text-xs font-extrabold text-emerald-500 mt-0.5">
                  {steps[activeStep].code}
                </span>
                <p className="text-xs text-slate-300 mt-1 max-w-4xl font-sans">
                  {steps[activeStep].details}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowTechTerminal(!showTechTerminal)}
              className="px-4 py-2 bg-slate-950/40 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 text-[10px] font-mono font-bold rounded-lg transition-all shadow-2xs"
            >
              {showTechTerminal ? "CLOSE PIPELINE LOGS" : "OPEN WORKER CONSOLE"}
            </button>
          </div>

          {/* Console terminal window expansion */}
          {showTechTerminal && (
            <div className="mt-4 p-4 bg-slate-955/70 border border-white/10 rounded-xl font-mono text-left space-y-1.5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] text-slate-450 ml-2 font-mono font-bold">AEGIS_ORBITAL_WORKER_04@NODE_EAST</span>
                </div>
                <span className="text-[9px] text-[#00C2FF] animate-pulse font-bold">● FEED INGESTION LIVE</span>
              </div>
              <p className="text-[10px] text-slate-500">[2026-07-11 08:43:20] INGESTION RUNNING: satellite_pass=Landsat-8 spatial_coverage=94.2%</p>
              <p className="text-[10px] text-slate-400">[2026-07-11 08:43:21] CORRECTION: calculating split_window on channel 10/11: bias=-0.12K</p>
              <p className="text-[10px] text-[#00E676]">[2026-07-11 08:43:21] SUCCESS: Land Surface Temperature resolved for 8 administrative zones</p>
              <p className="text-[10px] text-slate-450">[2026-07-11 08:43:22] INTERPOLATION: running SEBS energy flux model. Sensible Heat Flux: 382W/m², Ground Heat: 92W/m²</p>
              <p className="text-[10px] text-[#00C2FF]">[2026-07-11 08:43:22] COMPLETED: generated composite warning flags. Threat level: MODERATE to HIGH</p>
            </div>
          )}

        </div>
      </section>

      {/* 6. INTERACTIVE DASHBOARD PREVIEW */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Premium copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF6B35] tracking-wider uppercase font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
              <span>SATELLITE DECISION PORTAL PREVIEW</span>
            </div>

            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white mt-1">
              The Digital Twin Dashboard
            </h3>

            <p className="text-slate-350 text-sm leading-relaxed font-sans">
              Unlock multi-dimensional analysis with absolute clarity. Compare historic thermal trends, run simulation forecasts, extract thermal drivers, and calculate optimal municipal cool pavement and tree planting operations in seconds.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: "Physical Calibration Metrics", desc: "Access high-resolution thermal, albedo, NDVI, and wet-bulb indicators on a real-time responsive Leaflet GIS Map." },
                { title: "Targeted Cooling Scenarios", desc: "Test tree plantation, water buffer restoration, and cool roofing plans. Model temperature reduction outcomes and check real-time budget balances." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 font-sans">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#00E676]/10 flex items-center justify-center text-[#00E676] border border-[#00E676]/20">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-100">{item.title}</span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <button 
                onClick={() => setCurrentTab("dashboard")}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00C2FF]/10 to-[#0099FF]/20 hover:from-[#00C2FF]/20 hover:to-[#0099FF]/30 border border-[#00C2FF]/30 text-white text-xs font-bold font-mono tracking-wide transition-all duration-300 flex items-center gap-2 shadow-sm"
              >
                <span>OPEN LIVE DIGITAL TWIN</span>
                <ArrowRight className="h-4 w-4 text-[#0099FF]" />
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Realistic Mockup with active Charts */}
          <div className="lg:col-span-7 glass-card p-6 rounded-2xl shadow-2xl relative">
            
            {/* Header of mockup */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-mono text-slate-400 tracking-wide font-bold">AEGIS_PORTAL_DASHBOARD_LIVE.EXE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-extrabold">SECTOR LOCK: NORTH INDIA</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
              </div>
            </div>

            {/* Simulated Grid layout inside Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Column: Mini District selector list */}
              <div className="md:col-span-4 bg-slate-950/50 border border-white/10 p-3 rounded-xl space-y-2 backdrop-blur-md">
                <span className="block text-[8px] font-mono text-slate-400 font-extrabold uppercase tracking-widest mb-1">MONITORED STATIONS</span>
                
                {districts.length > 0 ? (
                  districts.slice(0, 4).map((d) => {
                    const isSelected = d.id === activeDistrictId;
                    const val = d.lst_current || d.lst || 39.5;
                    return (
                      <div 
                        key={d.id}
                        onClick={() => setActiveDistrictId(d.id)}
                        className={`cursor-pointer p-2 rounded-lg border text-left transition-all duration-350 ${
                          isSelected 
                            ? "bg-gradient-to-r from-[#00C2FF]/20 to-transparent border-[#00C2FF]/40 text-white shadow-md shadow-[#00C2FF]/10" 
                            : "bg-slate-950/40 border-white/5 hover:bg-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold text-slate-200 block truncate max-w-[80px]">{d.name}</span>
                          <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                            val > 42 ? "text-red-400 bg-red-950/40" : "text-[#FF6B35] bg-orange-950/40"
                          }`}>{val.toFixed(1)}°C</span>
                        </div>
                        <span className="block text-[8px] font-mono text-slate-450 mt-0.5">{d.state}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[10px] font-mono text-slate-500 p-4 text-center">Loading stations...</div>
                )}
              </div>

              {/* Right Column: Live Telemetry chart inside mockup */}
              <div className="md:col-span-8 bg-slate-950/50 border border-white/10 p-3 rounded-xl flex flex-col justify-between backdrop-blur-md">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-mono text-slate-400 uppercase font-bold tracking-widest">
                      ACTIVE PHYSICAL STATION THERMAL TRACK ({activeDistrict?.name || "Delhi"})
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">72HR GRAPH</span>
                  </div>

                  {/* Chart Container */}
                  <div className="h-32 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={telemetryHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="lstColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="hour" stroke="#64748b" fontSize={8} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={8} domain={['auto', 'auto']} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', fontSize: '9px', fontFamily: 'monospace' }}
                          labelStyle={{ color: '#64748b' }}
                        />
                        <Area type="monotone" dataKey="lst" name="Land Temp (°C)" stroke="#FF6B35" strokeWidth={1.5} fillOpacity={1} fill="url(#lstColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Simulated telemetry stats in footer of chart */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-[9px] font-mono text-slate-400">
                  <div>
                    <span className="block text-slate-500 uppercase">NDVI INDEX</span>
                    <span className="font-bold text-slate-200">{(activeDistrict?.ndvi || 0.14).toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase">HUMID BULB</span>
                    <span className="font-bold text-[#0099FF]">{(activeDistrict?.wet_bulb_temp || 27).toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase">VULNERABILITY</span>
                    <span className="font-bold text-[#FF6B35]">{(activeDistrict?.heat_vulnerability_score || 55).toFixed(0)}/100</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 7. CLIMATE INDICATORS SECTION */}
      <section className="py-20 bg-slate-950/20 border-y border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-mono text-[#0099FF] tracking-widest font-bold uppercase">
              REMOTELY SENSED BIO-METRIC DIRECTORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-white">
              Critical Climate Indicators
            </h2>
            <p className="text-slate-350 max-w-2xl mx-auto text-sm">
              We process diverse physical parameters across multiple electromagnetic bands to evaluate regional environmental stability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: "lst",
                title: "Land Surface Temp",
                abbr: "LST (°C)",
                desc: "Surface skin temperature of administrative areas derived from USGS TIRS sensor calibrations.",
                formula: "T = T10 / [1 + (λ * T10/ρ) * ln(ε)]",
                color: "border-[#FF6B35]/30 hover:border-[#FF6B35]",
                badge: "bg-orange-950/40 text-[#FF6B35] border-orange-900/60"
              },
              {
                id: "air",
                title: "Atmospheric Air Temp",
                abbr: "Air Temp (°C)",
                desc: "Estimates ambient physical temperature in thermal canopy layer based on remote assimilation models.",
                formula: "T_air = f(LST, NDVI, Albedo, Dem)",
                color: "border-orange-400/30 hover:border-orange-400",
                badge: "bg-amber-950/40 text-orange-400 border-orange-900/60"
              },
              {
                id: "ndvi",
                title: "Vegetation Index",
                abbr: "NDVI (-1 to 1)",
                desc: "Standard indicator of photosynthetic vigor, highlighting critical canopy losses and droughts.",
                formula: "NDVI = (NIR - Red) / (NIR + Red)",
                color: "border-[#00E676]/30 hover:border-[#00E676]",
                badge: "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
              },
              {
                id: "vulnerability",
                title: "Heat Vulnerability",
                abbr: "HVI Index",
                desc: "Composite risk assessment incorporating density, canopy lack, water bodies, and vulnerable populations.",
                formula: "HVI = Exp * [Sens + (100 - Adaptive)]",
                color: "border-[#0099FF]/30 hover:border-[#0099FF]",
                badge: "bg-sky-950/40 text-[#0099FF] border-sky-900/60"
              }
            ].map((indicator) => {
              return (
                <div 
                  key={indicator.id}
                  className={`bg-slate-900/45 p-5 rounded-2xl border shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between ${indicator.color}`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">INDICATOR CODE</span>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${indicator.badge}`}>
                        {indicator.abbr}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <h4 className="text-sm font-bold text-slate-100 font-sans">{indicator.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{indicator.desc}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 mt-5 pt-3.5">
                    <div className="flex items-center gap-2">
                      <Code className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-mono text-[9px] text-slate-400 select-all overflow-hidden text-ellipsis block whitespace-nowrap">
                        {indicator.formula}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

       {/* 8. WHY AEGIS HEAT - SCIENTIFIC ADVANTAGES COMPARISON */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Heading description */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <span className="text-xs font-mono text-[#0099FF] tracking-widest font-bold uppercase">
              THE NEXT GENERATION OF CLIMATE INTELLIGENCE
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight font-sans text-white">
              Scientific Precision vs Traditional Systems
            </h3>
            <p className="text-slate-350 text-sm leading-relaxed">
              Standard meteorological stations offer regional air temperature data but ignore spatial microclimate heat island variations. AEGIS bridges the spatial gap.
            </p>
            
            <div className="pt-2">
              <button
                onClick={() => setCurrentTab("audit")}
                className="px-5 py-2.5 bg-slate-955/45 hover:bg-white/10 text-slate-100 border border-white/5 text-[10px] font-mono font-bold rounded-lg shadow-2xs transition-all"
              >
                VIEW SECURE SYSTEM AUDIT
              </button>
            </div>
          </div>

          {/* Right: Beautiful comparative matrix */}
          <div className="lg:col-span-8 bg-slate-955/15 border border-white/10 rounded-2xl overflow-hidden shadow-md backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5 font-sans">
              
              {/* Pillar 1: Spatial Precision */}
              <div className="p-6 space-y-4 text-left">
                <div className="h-9 w-9 rounded-lg bg-[#00C2FF]/15 border border-[#00C2FF]/20 flex items-center justify-center text-[#0099FF]">
                  <Globe className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">
                  70M Spatial Precision
                </h4>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Fuses ECOSTRESS and Landsat telemetry to identify street-level temperature variances and paved-over heat sinks, bypassing standard sparse station averages.
                </p>
              </div>

              {/* Pillar 2: Thermodynamic Modeling */}
              <div className="p-6 space-y-4 text-left">
                <div className="h-9 w-9 rounded-lg bg-[#00E676]/15 border border-[#00E676]/20 flex items-center justify-center text-emerald-400">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">
                  Energy Flux Modeling
                </h4>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Quantifies latent, ground, and sensible heat exchanges continuously. This physics-first integration resolves how urban geometry alters human stress.
                </p>
              </div>

              {/* Pillar 3: Automated Interventions */}
              <div className="p-6 space-y-4 text-left">
                <div className="h-9 w-9 rounded-lg bg-[#FF6B35]/15 border border-[#FF6B35]/20 flex items-center justify-center text-orange-400">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">
                  Diagnostic Reports
                </h4>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Directly couples live data maps with automated intervention calculators, budgeting parameters, and printable diagnostic briefings.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

       {/* 9. WHO BENEFITS - USER PERSONAS */}
      <section className="py-20 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-mono text-[#00C2FF] tracking-widest font-extrabold uppercase">
              GOVERNMENT & COMMUNITY COHESION
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white mt-1">
              Actionable Intelligence for Stakeholders
            </h2>
            <p className="text-slate-350 max-w-2xl mx-auto text-sm font-sans">
              Connecting policy makers, urban designers, and researchers in a secure environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Urban Planners",
                role: "Smart Cities & Infrastructure",
                desc: "Design shade parks, water corridors, and specify high-reflectance materials for buildings and roadways based on concrete microclimate models.",
                stat: "Optimize Municipal Spacing"
              },
              {
                title: "Disaster Managers",
                role: "SDMA & NDMA Agencies",
                desc: "Identify critical high-risk sectors 72 hours before intense heat events, allowing mobilization of health centers, cool rooms, and warnings.",
                stat: "72h Pre-emptive Warnings"
              },
              {
                title: "Environmental Scientists",
                role: "Academic Research",
                desc: "Export validated, calibrated physical observation arrays covering LST, NDVI anomalies, and albedo variables for research and publications.",
                stat: "Export Clean GeoJSON Arrays"
              }
            ].map((persona, idx) => (
              <div 
                key={persona.title}
                className="glass-card p-6 rounded-2xl hover:border-[#00C2FF]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-950/40 flex items-center justify-center border border-white/5 text-[#0099FF] shadow-[0_0_15px_rgba(0,153,255,0.1)]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white font-sans">{persona.title}</h4>
                      <span className="text-[10px] font-mono text-slate-450">{persona.role}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {persona.desc}
                  </p>
                </div>

                <div className="border-t border-white/5 mt-5 pt-3.5 flex justify-between items-center">
                  <span className="text-[10px] font-mono font-extrabold text-emerald-400">{persona.stat}</span>
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400/80" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. TECHNOLOGY SECTION */}
      <section className="py-20 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-mono text-[#00C2FF] tracking-widest font-extrabold uppercase block">
              ENTERPRISE ARCHITECTURE DEPLOYMENT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white mt-1">
              The AEGIS Tech Stack
            </h2>
            <p className="text-slate-350 max-w-2xl mx-auto text-sm font-sans">
              Engineered using industry-leading modular frameworks for near-zero downtime, optimal raster conversions, and secure auditing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Frontend block */}
            <div className="glass-card p-5 rounded-2xl hover:border-[#00C2FF]/30 shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-10 w-10 rounded-xl bg-slate-950/40 flex items-center justify-center border border-white/5 text-[#0099FF] mb-4 shadow-[0_0_15px_rgba(0,194,255,0.1)]">
                <Code className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 font-sans">Frontend Client</h4>
              <span className="text-[9px] font-mono text-[#00C2FF] uppercase font-bold mt-1 block">React, Tailwind CSS</span>
              <p className="text-[11px] text-slate-350 mt-2 leading-relaxed font-sans">
                Highly responsive responsive React interface utilizing high-contrast Tailwind styling, Leaflet mapping integrations, and active Recharts dashboard components.
              </p>
            </div>

            {/* Backend block */}
            <div className="glass-card p-5 rounded-2xl hover:border-emerald-500/30 shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-10 w-10 rounded-xl bg-slate-950/40 flex items-center justify-center border border-white/5 text-emerald-400 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Server className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 font-sans">Core Services</h4>
              <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold mt-1 block">FastAPI, Python</span>
              <p className="text-[11px] text-slate-350 mt-2 leading-relaxed font-sans">
                Express + tsx backend micro-services delivering real-time geo-referenced raster matrices, telemetry calculation models, and secure data access endpoints.
              </p>
            </div>

            {/* Analytics block */}
            <div className="glass-card p-5 rounded-2xl hover:border-orange-500/30 shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-10 w-10 rounded-xl bg-slate-950/40 flex items-center justify-center border border-white/5 text-[#FF6B35] mb-4 shadow-[0_0_15px_rgba(255,107,53,0.1)]">
                <Activity className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 font-sans">Geospatial Processing</h4>
              <span className="text-[9px] font-mono text-[#FF6B35] uppercase font-bold mt-1 block">GIS, AI/ML, GDAL</span>
              <p className="text-[11px] text-slate-350 mt-2 leading-relaxed font-sans">
                Physics-informed deep learning arrays executing SEBS calculations, Split-Window radiometric corrections, and remote sensing land cover calculations.
              </p>
            </div>

            {/* Infra block */}
            <div className="glass-card p-5 rounded-2xl hover:border-indigo-500/30 shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-10 w-10 rounded-xl bg-slate-950/40 flex items-center justify-center border border-white/5 text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 font-sans">Infrastructure</h4>
              <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold mt-1 block">Cloud Run, SQLite</span>
              <p className="text-[11px] text-slate-350 mt-2 leading-relaxed font-sans">
                Continuous deployment using secure, containerized micro-architectures integrated with Drizzle ORM and robust relational database tables.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 11. CALL TO ACTION - ROCKET LAUNCH PANEL */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-12 text-center shadow-2xl">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-mono text-[#00C2FF] tracking-widest font-extrabold uppercase block">
              IMMEDIATE POLICY DEPLOYMENT READY
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white mt-1">
              Turn Climate Data into Actionable Intelligence
            </h2>

            <p className="text-slate-350 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-sans">
              Empower your administrative, planning, and scientific agencies with precise spatial digital twins to mitigate severe regional heatwaves.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button 
                onClick={() => setCurrentTab("dashboard")}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00C2FF] to-[#0099FF] hover:from-[#00D2FF] hover:to-[#00A3FF] text-white font-sans font-extrabold text-xs tracking-tight transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#00C2FF]/10 hover:shadow-[#00C2FF]/25 active:scale-95"
              >
                <span>Launch Digital Twin Platform</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setCurrentTab("diagnostics-paper")}
                className="px-6 py-3.5 rounded-xl bg-slate-950/40 hover:bg-white/10 border border-white/10 text-slate-200 font-sans font-semibold text-xs transition-all flex items-center gap-2 shadow-md active:scale-95"
              >
                <BookOpen className="h-4 w-4 text-[#0099FF]" />
                <span>View Diagnostics Paper</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 12. DETAILED FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950/60 py-12 text-slate-300 text-xs text-left shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <AegisLogoIcon className="h-10 w-10 filter drop-shadow-[0_0_6px_rgba(0,194,255,0.25)]" />
              <span className="font-sans font-extrabold text-slate-200 tracking-tight text-sm">AEGIS HEAT</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-sans">
              An advanced AI-powered Environmental Intelligence & Climate Simulation Twin platform. Fusing micro-satellite observations to optimize municipal extreme heat stress resilience.
            </p>
            <div className="pt-1.5 flex items-center gap-2 text-[10px] font-mono text-slate-450">
              <Award className="h-3.5 w-3.5 text-[#00E676]" />
              <span>ISRO Hackathon Grand Finale Spec</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <span className="block font-mono text-[10px] font-bold text-slate-350 uppercase tracking-wider">Quick Navigation</span>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={() => setCurrentTab("dashboard")} className="hover:text-[#0099FF] text-slate-400 transition-colors">
                  Digital Twin Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("explorer")} className="hover:text-[#0099FF] text-slate-400 transition-colors">
                  GIS Climate Map
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("rankings")} className="hover:text-[#0099FF] text-slate-400 transition-colors">
                  Vulnerability Rankings
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("forecasting")} className="hover:text-[#0099FF] text-slate-400 transition-colors">
                  Atmospheric Forecasting
                </button>
              </li>
            </ul>
          </div>

          {/* Tools & Resources */}
          <div className="space-y-3">
            <span className="block font-mono text-[10px] font-bold text-slate-350 uppercase tracking-wider">Climate Tools</span>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={() => setCurrentTab("optimizer")} className="hover:text-[#0099FF] text-slate-400 transition-colors">
                  Canopy Mitigation Optimizer
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("budget")} className="hover:text-[#0099FF] text-slate-400 transition-colors">
                  Intervention Budget Planner
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("diagnostics-paper")} className="hover:text-[#0099FF] text-slate-400 transition-colors">
                  Climate Diagnostic Briefs
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById("earth-observation-section")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#0099FF] text-slate-400 transition-colors">
                  Landsat & Sentinel Orbit HUD
                </button>
              </li>
            </ul>
          </div>

          {/* Partnerships & Licensing block */}
          <div className="space-y-3">
            <span className="block font-mono text-[10px] font-bold text-slate-350 uppercase tracking-wider">Agency Compliance</span>
            <p className="text-[10px] text-slate-450 leading-normal">
              Built in structural alignment with public data parameters from ISRO Bhuvan Geo-platform, NASA Earthdata network, USGS TIRS observations, and ERA5 atmospheric reanalysis grids.
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center gap-1">
              <span className="text-[9px] font-mono text-slate-450">Platform Mode:</span>
              <span className="text-[9px] font-mono text-[#00E676] font-bold uppercase">{systemMode || "Offline"}</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-4">
          <p>© 2026 AEGIS HEAT. Prepared for ISRO Hackathon Grand Finale.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#0099FF] cursor-pointer">Security Protocol</span>
            <span className="hover:text-[#0099FF] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#0099FF] cursor-pointer">Privacy Matrix</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
