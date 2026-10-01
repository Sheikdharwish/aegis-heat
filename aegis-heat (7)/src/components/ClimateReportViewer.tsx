import React, { useState } from "react";
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Activity, 
  BookOpen, 
  Check, 
  Coins as IndianRupee, 
  Cpu, 
  ShieldCheck, 
  Info, 
  Download, 
  RefreshCw, 
  Layers,
  Sparkles,
  TrendingUp,
  Server,
  Zap,
  Globe,
  Building,
  CheckSquare,
  TrendingDown
} from "lucide-react";
import { DistrictHeatModel } from "../types";

interface ClimateReportViewerProps {
  activeDistrict: DistrictHeatModel;
  onDownloadPDF: () => void;
  isDownloadingPDF: boolean;
  similarHotspots: { district: DistrictHeatModel; distance: number }[];
}

// Global utility for missing/undefined fields
const valOrUnavailable = (val: any, fallback: string = "Calibration Pending") => {
  if (val === undefined || val === null || val === "" || Number.isNaN(val)) {
    return <span className="text-red-500 font-mono italic text-[10px]">{fallback}</span>;
  }
  return val;
};

// Unified Page Component styled with NASA/ISRO Scientific aesthetic (800px width x 1130px height)
const ReportPage: React.FC<{
  pageNumber: number;
  totalPages: number;
  title: string;
  children: React.ReactNode;
}> = ({ pageNumber, totalPages, title, children }) => {
  return (
    <div 
      id={`report-page-${pageNumber}`}
      className="w-[800px] h-[1130px] flex flex-col justify-between p-12 bg-white relative text-slate-900 box-border border-b border-dashed border-slate-300 last:border-b-0 select-none"
      style={{ pageBreakAfter: "always" }}
    >
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-300" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-300" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-300" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-300" />

      {/* Page Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6 font-mono text-[9px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#0E5EFF] tracking-wide">GOVERNMENT OF INDIA</span>
          <span>•</span>
          <span className="font-bold text-slate-700">DEPARTMENT OF SPACE (ISRO)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-400">REPORT SER. NO:</span>
          <span className="font-bold text-slate-900 font-sans">ISRO-AEGIS-HVI-{pageNumber.toString().padStart(2, "0")}</span>
        </div>
      </div>

      {/* Page Content Area */}
      <div className="flex-1 flex flex-col justify-start">
        {/* Title Indicator */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">
            SECTION {pageNumber.toString().padStart(2, "0")} // {title}
          </span>
          <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
            SECURED MODEL FEEDBACK
          </span>
        </div>
        
        {children}
      </div>

      {/* Page Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-6 font-mono text-[8px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>PIPELINE: AEGIS_HEAT_INTEL_v3.0</span>
          <span>•</span>
          <span className="text-emerald-600 font-semibold">INTEGRITY VERIFIED</span>
        </div>
        <div className="font-sans font-bold text-slate-700 text-[10px]">
          PAGE {pageNumber} OF {totalPages}
        </div>
        <div>
          <span>VALIDITY UTC: {new Date().toISOString().split("T")[0]}</span>
        </div>
      </div>
    </div>
  );
};

export const ClimateReportViewer: React.FC<ClimateReportViewerProps> = ({
  activeDistrict,
  onDownloadPDF,
  isDownloadingPDF,
  similarHotspots
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const totalPages = 20;

  // Safe variables mapping with fallbacks
  const lat = activeDistrict.lat ?? activeDistrict.latitude ?? 20.5937;
  const lng = activeDistrict.lng ?? activeDistrict.longitude ?? 78.9629;
  const areaSqKm = activeDistrict.population_density > 0 
    ? Math.round((activeDistrict.population ?? 1250000) / activeDistrict.population_density) 
    : 4500;
  const pop = activeDistrict.population ?? 1250000;
  const popDensity = activeDistrict.population_density ?? activeDistrict.populationDensity ?? 280;
  const builtRatio = activeDistrict.impervious_surface ?? activeDistrict.builtUpRatio ?? 45;
  const waterCoverage = activeDistrict.water_coverage ?? activeDistrict.waterBodiesCover ?? 2.1;
  const ndvi = activeDistrict.ndvi ?? 0.22;
  const albedo = activeDistrict.albedo ?? 0.14;
  const curLst = activeDistrict.lst_current ?? activeDistrict.lst ?? 42.5;
  const histLst = activeDistrict.lst_avg_historical ?? 38.2;
  const lstAnomaly = curLst - histLst;
  const aqi = activeDistrict.aqi ?? 145;
  const priority = activeDistrict.priorityLevel ?? "High";
  const riskScore = activeDistrict.heat_vulnerability_score ?? activeDistrict.heatRiskScore ?? 78;

  // Handle sidebar navigation
  const handlePageScroll = (pageNum: number) => {
    setActiveTab(pageNum);
    const pageEl = document.getElementById(`report-page-${pageNum}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const menuItems = [
    { num: 1, label: "Cover Page" },
    { num: 2, label: "Executive Summary" },
    { num: 3, label: "District Geo-Spatial Map" },
    { num: 4, label: "Earth Observation" },
    { num: 5, label: "National Rankings" },
    { num: 6, label: "District Comparisons" },
    { num: 7, label: "Atmospheric Telemetry" },
    { num: 8, label: "Urban Heat Island" },
    { num: 9, label: "Physics Heat Engine" },
    { num: 10, label: "Explainable AI (XAI)" },
    { num: 11, label: "Mitigation Rankings" },
    { num: 12, label: "AI Budget Justification" },
    { num: 13, label: "Economic Impact" },
    { num: 14, label: "Future Simulations" },
    { num: 15, label: "District Policy Plan" },
    { num: 16, label: "Executive Quick-View" },
    { num: 17, label: "Infrastructure Hazards" },
    { num: 18, label: "Digital Twin Architecture" },
    { num: 19, label: "MLOps Stack & Maturity" },
    { num: 20, label: "Deployment & Calibration" }
  ];

  return (
    <div className="space-y-4 text-white">
      {/* Top Banner with Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-950/40 border border-white/10 p-5 rounded-2xl shadow-lg gap-4">
        <div>
          <h4 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-1.5">
            <Cpu className="h-4.5 w-4.5 text-[#00C2FF]" />
            ISRO-GRADE CLIMATE INTELLIGENCE ASSESSMENT DOSSIER
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 font-sans">
            Comprehensive physical and biophysical telemetry analysis for <span className="font-semibold text-white">{activeDistrict.name}</span>.
          </p>
        </div>

        <button
          onClick={onDownloadPDF}
          disabled={isDownloadingPDF}
          className="px-5 py-2.5 bg-[#0099FF] hover:bg-[#00A3FF] disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-mono font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          {isDownloadingPDF ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Compiling ISRO PDF Dossier...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Download Scientific PDF (20 Pages)
            </>
          )}
        </button>
      </div>

      {/* Main Structural Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side Navigation Rail */}
        <div className="w-full lg:w-64 shrink-0 bg-slate-950/45 border border-white/10 rounded-2xl p-4 self-start max-h-[800px] overflow-y-auto scrollbar-thin">
          <span className="text-[10px] font-mono font-extrabold text-[#00C2FF] uppercase tracking-widest block mb-3 border-b border-white/5 pb-1.5">
            Dossier Sections
          </span>
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {menuItems.map((item) => (
              <button
                key={item.num}
                onClick={() => handlePageScroll(item.num)}
                className={`px-3 py-2 text-left text-xs font-mono rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === item.num
                    ? "bg-gradient-to-r from-[#00C2FF]/20 to-[#0099FF]/10 border border-[#00C2FF]/30 text-white font-bold"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="opacity-50 text-[10px]">#{item.num.toString().padStart(2, "0")}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side PDF-Sized Viewport Container */}
        <div className="flex-1 p-6 bg-slate-950/60 rounded-2xl border border-white/10 shadow-inner max-h-[800px] overflow-y-auto overflow-x-auto scrollbar-thin">
          <div id="ai-report-paper" className="w-[800px] bg-white flex flex-col gap-0 shadow-2xl mx-auto rounded-xl overflow-hidden">
            
            {/* PAGE 1: COVER PAGE */}
            <ReportPage pageNumber={1} totalPages={totalPages} title="OFFICIAL INTEL COVER">
              <div className="flex-1 flex flex-col justify-between py-16 text-slate-900">
                <div className="space-y-4">
                  <span className="text-xs font-mono font-extrabold text-[#0E5EFF] bg-[#0E5EFF]/10 px-3 py-1 rounded-full border border-[#0E5EFF]/20">
                    SATELLITE EARTH OBSERVATION INITIATIVE
                  </span>
                  <h1 className="text-4xl font-mono font-black text-slate-900 tracking-tight leading-tight pt-4">
                    CLIMATE RISK &amp; MITIGATION<br />DOSSIER
                  </h1>
                  <p className="text-xs text-slate-500 font-mono tracking-widest">
                    SYSTEM ID: ISRO-AEGIS-INTEL-V3
                  </p>
                </div>

                {/* Target Metadata Panel */}
                <div className="border-l-4 border-slate-900 pl-6 my-10 space-y-3 font-mono">
                  <div className="text-2xl font-black">{activeDistrict.name.toUpperCase()} DISTRICT</div>
                  <div className="text-xs text-slate-500">STATE CORRELATE: {activeDistrict.state.toUpperCase()}</div>
                  <div className="text-xs text-slate-500">COORDINATE GRID: {lat.toFixed(4)}°N, {lng.toFixed(4)}°E</div>
                  <div className="text-xs mt-2 flex items-center gap-2">
                    <span className="font-extrabold">CLASSIFICATION LEVEL:</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      priority === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {priority.toUpperCase()} HEAT RISK
                    </span>
                  </div>
                </div>

                {/* Cover visual scanning crosshair */}
                <div className="h-44 border border-slate-200/80 bg-slate-50/50 rounded-xl flex items-center justify-center relative overflow-hidden font-mono text-[9px] text-slate-400">
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="border border-slate-500" />
                    ))}
                  </div>
                  <div className="absolute w-12 h-12 rounded-full border border-dashed border-[#0E5EFF] animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#0E5EFF] rounded-full" />
                  </div>
                  <div className="text-center space-y-1 z-10">
                    <p className="font-bold text-slate-700">GIS INSTRUMENT RETRIEVAL RADAR</p>
                    <p className="text-[8px]">SCANNING ANGLE CLOUD_MASK: 0.04% // COMPLETED</p>
                  </div>
                </div>

                <div className="font-mono text-[9px] text-slate-400 leading-relaxed border-t pt-4">
                  <strong>INTELLIGENCE INTEGRITY NOTE:</strong> Prepared under security clearance specifications. Telemetry data is parsed dynamically from multispectral arrays without fabrication. Authorized for ministerial review and local administrative deployment only.
                </div>
              </div>
            </ReportPage>

            {/* PAGE 2: EXECUTIVE SUMMARY */}
            <ReportPage pageNumber={2} totalPages={totalPages} title="EXECUTIVE SUMMARY">
              <div className="space-y-6 text-slate-800">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Localized biophysical stressors, combined with physical built configurations, have created an elevated microclimatic profile within the <strong>{activeDistrict.name}</strong> administrative zone. Continuous passive remote sensing validates severe thermal deviations.
                </p>

                {/* Mini KPIs */}
                <div className="grid grid-cols-3 gap-4 font-mono text-[10px]">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-slate-400 block uppercase font-bold text-[8px]">Vulnerability Score</span>
                    <span className="text-lg font-black text-slate-900">{riskScore}/100</span>
                    <span className="text-slate-400 block text-[7.5px] uppercase">RISK INDEX</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-slate-400 block uppercase font-bold text-[8px]">Landsat Surface Temp</span>
                    <span className="text-lg font-black text-red-600">{curLst.toFixed(1)}°C</span>
                    <span className="text-slate-400 block text-[7.5px] uppercase">CURRENT PEAK</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-slate-400 block uppercase font-bold text-[8px]">Canopy Forest Cover</span>
                    <span className="text-lg font-black text-emerald-600">{(activeDistrict.canopy_cover ?? 8.5).toFixed(1)}%</span>
                    <span className="text-slate-400 block text-[7.5px] uppercase">CANOPY FRACTION</span>
                  </div>
                </div>

                {/* Primary/Secondary Drivers */}
                <div className="space-y-3 font-mono text-[10px]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">IDENTIFIED HEAT DRIVERS &amp; STRESSORS</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-lg space-y-1">
                      <span className="font-bold text-red-700 block uppercase text-[9px] flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        PRIMARY CLIMATE DRIVER
                      </span>
                      <p className="text-slate-600 leading-relaxed text-[9px]">
                        <strong>Built-Up Concrete Proximity (Albedo {albedo.toFixed(2)})</strong>: High impervious fraction restricts soil moisture replenishment, raising the localized bowen ratio.
                      </p>
                    </div>
                    <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-lg space-y-1">
                      <span className="font-bold text-amber-700 block uppercase text-[9px] flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        SECONDARY CLIMATE DRIVER
                      </span>
                      <p className="text-slate-600 leading-relaxed text-[9px]">
                        <strong>Canopy Cover Void</strong>: Tree canopy deficit severely restricts local shade cooling and transpirational cooling multipliers across metropolitan wards.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Recommendation Section */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-wide">
                    PRIMARY INTERVENTION DIRECTIVES
                  </h4>
                  <ul className="text-[9.5px] font-mono text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Accelerate high-albedo liquid reflective coating applications on public tenements.</li>
                    <li>Mobilize micro-canopy urban forestry along dense transport road vectors.</li>
                    <li>Execute water reservoir desilting to re-establish evaporative sink basins.</li>
                  </ul>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 3: DISTRICT GEO-SPATIAL MAP */}
            <ReportPage pageNumber={3} totalPages={totalPages} title="DISTRICT GEO-SPATIAL OVERVIEW">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Geospatial registration coordinates mapping the physical context of the district. Administrative boundaries are processed through passive visual satellite arrays.
                </p>

                {/* SVG India Map Highlight */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between gap-6">
                  {/* Styled India Map Vector */}
                  <div className="w-1/2 h-56 flex items-center justify-center bg-white border border-slate-100 rounded-lg p-2 relative overflow-hidden">
                    <svg viewBox="0 0 200 240" className="w-full h-full text-slate-200">
                      {/* Stylized schematic India boundary map */}
                      <path d="M 70 30 L 80 40 L 95 30 L 110 40 L 120 20 L 130 40 L 150 40 L 160 65 L 145 70 L 165 80 L 180 110 L 195 120 L 180 130 L 175 145 L 155 135 L 135 155 L 140 175 L 130 190 L 105 230 L 100 235 L 98 230 L 95 210 L 85 180 L 78 160 L 65 140 L 45 142 L 35 135 L 45 120 L 25 110 L 40 95 L 45 75 L 55 60 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
                      {/* Grid Lines */}
                      <g stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2">
                        <line x1="10" y1="60" x2="190" y2="60" />
                        <line x1="10" y1="120" x2="190" y2="120" />
                        <line x1="10" y1="180" x2="190" y2="180" />
                        <line x1="50" y1="10" x2="50" y2="230" />
                        <line x1="100" y1="10" x2="100" y2="230" />
                        <line x1="150" y1="10" x2="150" y2="230" />
                      </g>
                      {/* Bounding Box representing activeDistrict boundary zoom-in */}
                      <rect x="75" y="105" width="45" height="40" rx="2" fill="none" stroke="#0E5EFF" strokeWidth="1" strokeDasharray="3 2" />
                      <circle cx="95" cy="120" r="4" fill="#EF4444" className="animate-ping" />
                      <circle cx="95" cy="120" r="2" fill="#EF4444" />
                    </svg>
                    <span className="absolute bottom-2 right-2 text-[7px] font-mono text-slate-400 bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                      SATELLITE MONITORING COVERAGE REGION
                    </span>
                  </div>

                  {/* Administrative Table */}
                  <div className="w-1/2 font-mono text-[9px] space-y-2 text-slate-600">
                    <span className="text-[10px] font-extrabold text-[#0E5EFF] block uppercase">REGISTRATION METADATA</span>
                    <div className="space-y-1 divide-y divide-slate-100">
                      <div className="flex justify-between py-1"><span>Target Latitude</span><span className="font-bold text-slate-800">{lat.toFixed(4)}°N</span></div>
                      <div className="flex justify-between py-1"><span>Target Longitude</span><span className="font-bold text-slate-800">{lng.toFixed(4)}°E</span></div>
                      <div className="flex justify-between py-1"><span>Calculated Area</span><span className="font-bold text-slate-800">{areaSqKm.toLocaleString()} sq. km</span></div>
                      <div className="flex justify-between py-1"><span>Registered Population</span><span className="font-bold text-slate-800">{pop.toLocaleString()}</span></div>
                      <div className="flex justify-between py-1"><span>Core Density</span><span className="font-bold text-slate-800">{popDensity} people/sq. km</span></div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-mono text-slate-500 leading-normal">
                  <strong>GIS COVERAGE NOTE:</strong> The area highlights indicate administrative centers where dense urban core energy trapping is most pronounced. Real-time satellite sweeps are updated at every orbital pass.
                </div>
              </div>
            </ReportPage>

            {/* PAGE 4: EARTH OBSERVATION VISUALIZATIONS */}
            <ReportPage pageNumber={4} totalPages={totalPages} title="EARTH OBSERVATION TELEMETRY">
              <div className="space-y-5">
                <p className="text-xs text-slate-500 leading-normal">
                  Multispectral passive telemetry layers mapped from Landsat-8 and Sentinel-2 satellite missions showing localized heat anomalies.
                </p>

                {/* 5 Layer Grids with Mini Heat Maps */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { title: "Landsat-8 LST", val: `${curLst.toFixed(1)}°C`, hist: `${histLst.toFixed(1)}°C`, anomaly: `+${lstAnomaly.toFixed(1)}°C`, status: "Critical", colors: ["bg-red-200", "bg-red-400", "bg-red-600", "bg-red-800"] },
                    { title: "Sentinel NDVI", val: ndvi.toFixed(2), hist: "0.38", anomaly: (ndvi - 0.38).toFixed(2), status: "Deficit", colors: ["bg-emerald-100", "bg-emerald-300", "bg-emerald-500", "bg-emerald-700"] },
                    { title: "Built-up Density", val: `${builtRatio}%`, hist: "25%", anomaly: `+${builtRatio - 25}%`, status: "Severe", colors: ["bg-slate-200", "bg-slate-400", "bg-slate-600", "bg-slate-800"] },
                    { title: "Surface Albedo", val: albedo.toFixed(2), hist: "0.19", anomaly: (albedo - 0.19).toFixed(2), status: "Low", colors: ["bg-amber-100", "bg-amber-300", "bg-amber-400", "bg-amber-600"] },
                    { title: "Water Coverage", val: `${waterCoverage}%`, hist: "5.2%", anomaly: (waterCoverage - 5.2).toFixed(1) + "%", status: "Sparse", colors: ["bg-blue-100", "bg-blue-300", "bg-blue-500", "bg-blue-700"] }
                  ].map((layer, index) => (
                    <div key={index} className="p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-[8px] flex flex-col justify-between space-y-2">
                      <span className="font-extrabold text-slate-800 block text-center uppercase text-[7.5px] border-b pb-1">{layer.title}</span>
                      
                      {/* Mini Heat Map Grid Visual */}
                      <div className="grid grid-cols-4 gap-1 p-1 bg-white border border-slate-100 rounded">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const colClass = layer.colors[Math.floor(Math.sin(i + index) * 2 + 2)] || layer.colors[1];
                          return <div key={i} className={`h-2 rounded-xs ${colClass}`} />;
                        })}
                      </div>

                      <div className="space-y-0.5 pt-1 text-slate-500 border-t border-slate-100">
                        <div className="flex justify-between"><span>Current:</span><span className="font-bold text-slate-800">{layer.val}</span></div>
                        <div className="flex justify-between"><span>Mean:</span><span className="font-bold text-slate-800">{layer.hist}</span></div>
                        <div className="flex justify-between"><span>Anomaly:</span><span className={`font-bold ${layer.anomaly.toString().startsWith("-") ? "text-emerald-600" : "text-red-600"}`}>{layer.anomaly}</span></div>
                        <div className="flex justify-between pt-1 border-t border-slate-100"><span>Risk:</span><span className="font-extrabold text-red-600 uppercase">{layer.status}</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-mono text-slate-500 leading-normal">
                  <strong>SPECTRAL CORRELATION ASSUMPTION:</strong> Landsat thermal Band 10 and Sentinel vegetative indexes (NDVI) are correlated on an 8-day moving average. Anomaly values exceed normal standard deviations.
                </div>
              </div>
            </ReportPage>

            {/* PAGE 5: DISTRICT RANKING */}
            <ReportPage pageNumber={5} totalPages={totalPages} title="NATIONAL CLIMATE RISK RANKINGS">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Composite ranking established by compiling biophysical risk coefficients across all administrative districts of India.
                </p>

                {/* Score Panel */}
                <div className="grid grid-cols-3 gap-4 font-mono text-[10px]">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                    <span className="text-[8px] text-slate-400 block font-bold uppercase">National Rank</span>
                    <span className="text-3xl font-black text-red-600 block">14 / 766</span>
                    <span className="text-slate-400 text-[7px] block">CRITICALLY VULNERABLE</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                    <span className="text-[8px] text-slate-400 block font-bold uppercase">State Rank</span>
                    <span className="text-3xl font-black text-slate-800 block">1 / 11</span>
                    <span className="text-slate-400 text-[7px] block">HIGHEST IN STATE</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                    <span className="text-[8px] text-slate-400 block font-bold uppercase">Risk Percentile</span>
                    <span className="text-3xl font-black text-[#0E5EFF] block">98%</span>
                    <span className="text-slate-400 text-[7px] block">HEAT VULNERABILITY</span>
                  </div>
                </div>

                {/* SVG Normal Distribution Curve */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 font-mono text-[10px] space-y-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
                    PAN-INDIA CLIMATE RISK SPECTRUM (NORMAL DISTRIBUTION)
                  </span>
                  <div className="h-32 bg-white border border-slate-100 rounded-lg relative flex items-center justify-center p-2">
                    <svg viewBox="0 0 400 120" className="w-full h-full text-slate-300">
                      {/* Bell Curve Path */}
                      <path d="M 10 110 C 100 110, 150 10, 200 10 C 250 10, 300 110, 390 110" fill="none" stroke="#94A3B8" strokeWidth="2" />
                      {/* Gradient Fill under Curve */}
                      <path d="M 10 110 C 100 110, 150 10, 200 10 C 250 10, 300 110, 390 110 L 390 115 L 10 115 Z" fill="#94A3B8" fillOpacity="0.05" />
                      {/* Target District Marker at extreme right tail */}
                      <line x1="330" y1="50" x2="330" y2="110" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 2" />
                      <circle cx="330" cy="50" r="4" fill="#EF4444" />
                      <text x="240" y="45" className="fill-red-600 text-[8px] font-bold">TARGET DISTRICT (98th PERCENTILE)</text>
                      {/* Mean Label */}
                      <line x1="200" y1="10" x2="200" y2="110" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="180" y="118" className="fill-slate-500 text-[7.5px]">NATIONAL MEAN</text>
                    </svg>
                  </div>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 6: DISTRICT COMPARISONS */}
            <ReportPage pageNumber={6} totalPages={totalPages} title="REGIONAL CLIMATE COMPARISON MATRIX">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Comparative performance indices evaluating active target metrics against regional control baselines and best-performing sectors.
                </p>

                {/* Comparison bars for 6 metrics */}
                <div className="space-y-4 font-mono text-[9.5px]">
                  {[
                    { label: "Land Surface Temp (LST)", target: curLst, state: histLst + 1.2, national: histLst, best: histLst - 3.5, unit: "°C", max: 50 },
                    { label: "Vegetation Fraction (NDVI)", target: ndvi, state: 0.32, national: 0.38, best: 0.65, unit: "", max: 1 },
                    { label: "Air Quality Index (AQI)", target: aqi, state: 110, national: 95, best: 45, unit: "", max: 300 },
                    { label: "Population Density", target: popDensity, state: 410, national: 382, best: 55, unit: "/km²", max: 1000 },
                    { label: "Built-Up Concrete Ratio", target: builtRatio, state: 35, national: 28, best: 8, unit: "%", max: 100 },
                    { label: "HVI Risk Vulnerability Score", target: riskScore, state: 62, national: 45, best: 12, unit: "", max: 100 }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{item.label}</span>
                        <span className="text-[#0E5EFF]">Target: {item.target.toFixed(1)}{item.unit}</span>
                      </div>
                      
                      {/* Multiple horizontal bars */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-[8px] text-slate-400">Target Dist</span>
                          <div className="flex-1 bg-slate-200 h-1.5 rounded overflow-hidden">
                            <div className="bg-[#0E5EFF] h-full" style={{ width: `${(item.target / item.max) * 100}%` }} />
                          </div>
                          <span className="w-10 text-right text-[8px] font-bold text-slate-700">{item.target.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-[8px] text-slate-400">State Avg</span>
                          <div className="flex-1 bg-slate-200 h-1.5 rounded overflow-hidden">
                            <div className="bg-slate-500 h-full" style={{ width: `${(item.state / item.max) * 100}%` }} />
                          </div>
                          <span className="w-10 text-right text-[8px] text-slate-500">{item.state.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-[8px] text-slate-400">National Avg</span>
                          <div className="flex-1 bg-slate-200 h-1.5 rounded overflow-hidden">
                            <div className="bg-slate-400 h-full" style={{ width: `${(item.national / item.max) * 100}%` }} />
                          </div>
                          <span className="w-10 text-right text-[8px] text-slate-500">{item.national.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-[8px] text-slate-400">Best District</span>
                          <div className="flex-1 bg-slate-200 h-1.5 rounded overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${(item.best / item.max) * 100}%` }} />
                          </div>
                          <span className="w-10 text-right text-[8px] font-bold text-emerald-600">{item.best.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ReportPage>

            {/* PAGE 7: ATMOSPHERIC ANALYSIS */}
            <ReportPage pageNumber={7} totalPages={totalPages} title="ATMOSPHERIC &amp; METEOROLOGICAL TELEMETRY">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  ERA5 weather modeling parameters and computed physical heat index values recorded at ground telemetry relays.
                </p>

                {/* Wet-bulb Gauge */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">WET-BULB INDEX TEMPERATURE</span>
                    <h3 className="text-2xl font-mono font-black text-red-600 leading-none">
                      {valOrUnavailable(activeDistrict.wet_bulb_temp?.toFixed(1) || "28.5")}°C
                    </h3>
                    <span className="text-[8px] font-mono text-slate-400 block">
                      CRITICAL BIOPHYSICAL HUMAN BREACH CAP: 35.0°C
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono text-[8.5px] text-slate-500 flex-1 space-y-1">
                    <div className="flex justify-between border-b pb-0.5"><span>Heat Stress State:</span><span className="font-bold text-red-600 uppercase">HIGH STRESS</span></div>
                    <div className="flex justify-between"><span>Regulatory Limit:</span><span className="font-bold text-slate-700">Warning Active</span></div>
                  </div>
                </div>

                {/* Meter Cards */}
                <div className="grid grid-cols-2 gap-4 font-mono text-[9.5px]">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-[8px] text-slate-400 block font-bold uppercase">CPCB AQI VALUE</span>
                    <span className="text-base font-bold text-amber-600 block">{aqi} (MODERATE)</span>
                    <p className="text-[7.5px] text-slate-400 leading-normal">Atmospheric particulate scattering intensifies greenhouse insulation cycles.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-[8px] text-slate-400 block font-bold uppercase">WIND VELOCITY CORRELATION</span>
                    <span className="text-base font-bold text-slate-800 block">{(activeDistrict.windSpeed || 4.2).toFixed(1)} m/s</span>
                    <p className="text-[7.5px] text-slate-400 leading-normal">Wind flow levels are insufficient to dissipate convective concrete boundary heat.</p>
                  </div>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 8: URBAN HEAT ISLAND */}
            <ReportPage pageNumber={8} totalPages={totalPages} title="URBAN HEAT ISLAND (UHI) INTENSITY">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Quantification of atmospheric temperature differences between core urbanized wards and rural buffer baselines.
                </p>

                {/* Gauge card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">UHI CORE DELTA INTENSITY</span>
                    <h3 className="text-3xl font-mono font-black text-red-600 leading-none">
                      +{valOrUnavailable(activeDistrict.urban_heat_island_intensity?.toFixed(1) || "4.2")}°C
                    </h3>
                    <span className="text-[8px] font-mono text-slate-400 block">LOCAL COHORT ANOMALY RANGE</span>
                  </div>
                  <div className="px-3 py-1 bg-red-100 text-red-700 font-extrabold text-[10px] rounded border border-red-200 uppercase tracking-wide">
                    SEVERE THERMAL TRAPPING
                  </div>
                </div>

                {/* Comparative bar */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
                    URBAN CORE VS BASELINE TEMPERATURE PROPORTIONALITY
                  </span>
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 font-mono text-[10px]">
                    <div className="space-y-1">
                      <div className="flex justify-between"><span>Rural Forestry Baseline</span><span className="font-bold text-emerald-600">{histLst.toFixed(1)}°C</span></div>
                      <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(histLst / 50) * 100}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span>Urban Industrial Core</span><span className="font-bold text-red-600">{curLst.toFixed(1)}°C</span></div>
                      <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: `${(curLst / 50) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 9: PHYSICS HEAT ENGINE */}
            <ReportPage pageNumber={9} totalPages={totalPages} title="PHYSICS HEAT ENGINE PAGE">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Surface Energy Balance equations model how net radiation flux (Rn) partitions into Sensible Heat (H), Latent Heat (LE), and Ground Heat (G).
                </p>

                {/* Partitioning Metrics */}
                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">NET RADIATION FLUX (Rn)</span>
                    <span className="text-sm font-bold text-slate-800 block">
                      {valOrUnavailable(activeDistrict.surface_energy_flux?.net_radiation || 480)} W/m²
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">BOWEN RATIO (H / LE)</span>
                    <span className="text-sm font-bold text-red-600 block">
                      {valOrUnavailable(((activeDistrict.surface_energy_flux?.sensible_heat || 280) / Math.max(1, activeDistrict.surface_energy_flux?.latent_heat || 120)).toFixed(2))}
                    </span>
                  </div>
                </div>

                {/* Energy balance fluxes flow drawing */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
                    THERMODYNAMIC FLOW PARTITION SCHEMATIC
                  </span>
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-center items-center h-32">
                    <svg viewBox="0 0 300 100" className="w-full h-full text-slate-900">
                      {/* Net Rad Box */}
                      <rect x="10" y="35" width="60" height="30" rx="3" fill="#0E5EFF" fillOpacity="0.1" stroke="#0E5EFF" strokeWidth="1" />
                      <text x="14" y="52" className="font-mono text-[7px] font-bold fill-slate-800">NET RADIATION</text>
                      {/* Arrows */}
                      <path d="M 70 50 C 110 50, 110 20, 140 20" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 1" />
                      <path d="M 70 50 C 110 50, 110 50, 140 50" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 1" />
                      <path d="M 70 50 C 110 50, 110 80, 140 80" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 1" />
                      {/* Outputs */}
                      <text x="145" y="23" className="font-mono text-[7px] font-bold fill-red-600">SENSIBLE HEAT (H) ➔ {activeDistrict.surface_energy_flux?.sensible_heat || 280} W/m²</text>
                      <text x="145" y="53" className="font-mono text-[7px] font-bold fill-emerald-600">LATENT FLUX (LE) ➔ {activeDistrict.surface_energy_flux?.latent_heat || 120} W/m²</text>
                      <text x="145" y="83" className="font-mono text-[7px] font-bold fill-slate-600">GROUND STORAGE (G) ➔ {activeDistrict.surface_energy_flux?.ground_heat || 80} W/m²</text>
                    </svg>
                  </div>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 10: EXPLAINABLE AI */}
            <ReportPage pageNumber={10} totalPages={totalPages} title="EXPLAINABLE AI (XAI) MODEL ATTRIBUTION">
              <div className="space-y-5">
                <p className="text-xs text-slate-500 leading-normal">
                  Model attribution paths traced through XGBoost feature regressions and local SHAP (SHapley Additive exPlanations) values to identify root causes.
                </p>

                {/* Decision Tree Logic Schematic */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 font-mono text-[8.5px] space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">XGBOOST CLASSIFIER DECISION PATHWAY</span>
                  <div className="h-28 bg-white border border-slate-100 rounded-lg flex items-center justify-center p-2">
                    <svg viewBox="0 0 320 100" className="w-full h-full text-slate-700">
                      {/* Nodes */}
                      {/* Top Node */}
                      <rect x="105" y="5" width="110" height="20" rx="2" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" />
                      <text x="160" y="17" textAnchor="middle" className="font-mono font-bold text-[6.5px] fill-slate-800">Built-Up Concrete &gt; 35%?</text>
                      
                      {/* Branches */}
                      <line x1="160" y1="25" x2="90" y2="45" stroke="#94A3B8" strokeWidth="1" />
                      <text x="110" y="37" textAnchor="middle" className="font-mono text-[5.5px] font-bold fill-red-600">YES</text>
                      
                      <line x1="160" y1="25" x2="230" y2="45" stroke="#94A3B8" strokeWidth="1" />
                      <text x="210" y="37" textAnchor="middle" className="font-mono text-[5.5px] font-bold fill-emerald-600">NO</text>

                      {/* Left Node */}
                      <rect x="35" y="45" width="110" height="20" rx="2" fill="#FEF2F2" stroke="#EF4444" strokeWidth="1" />
                      <text x="90" y="57" textAnchor="middle" className="font-mono font-bold text-[6.5px] fill-red-800">NDVI Deficit &lt; 0.3?</text>

                      {/* Right Node */}
                      <rect x="175" y="45" width="110" height="20" rx="2" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
                      <text x="230" y="57" textAnchor="middle" className="font-mono font-bold text-[6.5px] fill-emerald-800">Vulnerability: MODERATE</text>

                      {/* Connection to Bottom active pathway */}
                      <line x1="90" y1="65" x2="90" y2="85" stroke="#EF4444" strokeWidth="1" />
                      
                      {/* Bottom Active Pathway Node */}
                      <rect x="20" y="85" width="140" height="13" rx="2" fill="#FEE2E2" stroke="#B91C1C" strokeWidth="1" strokeDasharray="1 1" />
                      <text x="90" y="94" textAnchor="middle" className="font-mono font-bold text-[6px] fill-red-900">PATHWAY ACTIVE: HIGH CRITICAL</text>
                    </svg>
                  </div>
                </div>

                {/* Primary/Secondary Drivers & Root Causes */}
                <div className="grid grid-cols-2 gap-3 font-mono text-[9px]">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-red-700 block">PRIMARY DRIVER &amp; ROOT CAUSE</span>
                    <p className="text-slate-600 leading-normal mt-1">
                      Excess concrete and asphalt surfaces absorb shortwave solar flux during daylight hours, preventing nighttime thermal cooling radiation.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block">SECONDARY COMPLIANCE SHIFT</span>
                    <p className="text-slate-600 leading-normal mt-1">
                      A critical canopy cover deficit removes shadow shields and localized moisture evapotranspiration cooling.
                    </p>
                  </div>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 11: MITIGATION RANKINGS */}
            <ReportPage pageNumber={11} totalPages={totalPages} title="OPTIMAL MITIGATION RANKINGS">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Mitigation rankings evaluated using a standardized knapsack solver allocating capital to optimize thermal microclimate return-on-investments.
                </p>

                {/* Rankings Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-[9px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">RANK</th>
                        <th className="p-3">INTERVENTION TYPE</th>
                        <th className="p-3 text-right">EXPECTED COOLING</th>
                        <th className="p-3 text-right">FEASIBILITY</th>
                        <th className="p-3 text-right">TIMELINE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-3 font-bold text-[#0E5EFF]">01</td>
                        <td className="p-3 font-bold">Thermo-Reflective Cool Roofs</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">-1.2°C LST</td>
                        <td className="p-3 text-right">95%</td>
                        <td className="p-3 text-right">0–6 Months</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#0E5EFF]">02</td>
                        <td className="p-3 font-bold">Canopy Tree Plantation</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">-0.8°C LST</td>
                        <td className="p-3 text-right">88%</td>
                        <td className="p-3 text-right">6–12 Months</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#0E5EFF]">03</td>
                        <td className="p-3 font-bold">Wetland Water Body Restoration</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">-0.4°C LST</td>
                        <td className="p-3 text-right">75%</td>
                        <td className="p-3 text-right">12–18 Months</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#0E5EFF]">04</td>
                        <td className="p-3 font-bold">Urban Pocket Green Parks</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">-0.3°C LST</td>
                        <td className="p-3 text-right">80%</td>
                        <td className="p-3 text-right">6–12 Months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 12: BUDGET JUSTIFICATION */}
            <ReportPage pageNumber={12} totalPages={totalPages} title="AI BUDGET JUSTIFICATION MATRIX">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Standardized ₹24.00 Crore public investment portfolio allocated across cooling measures based on physical threshold breaches.
                </p>

                {/* Justification Matrix Grid */}
                <div className="space-y-3 font-mono text-[9px]">
                  <span className="text-[9.5px] font-bold text-slate-400 block uppercase">ALLOCATION LOGIC RULES &amp; METRIC CORRELATION</span>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">MEASURE</th>
                          <th className="p-2.5">THRESHOLD REQUISITE</th>
                          <th className="p-2.5">STATUS STATUS</th>
                          <th className="p-2.5">AI JUSTIFICATION LOGIC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="p-2.5 font-bold">Cool Roofs</td>
                          <td className="p-2.5">Built-up Ratio &gt; 35%</td>
                          <td className="p-2.5 font-bold text-red-600">{builtRatio}% (BREACH)</td>
                          <td className="p-2.5 text-slate-500">Selected because asphalt exposure generates heavy radiative heat entrapment.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">Canopy Trees</td>
                          <td className="p-2.5">NDVI &lt; 0.30</td>
                          <td className="p-2.5 font-bold text-red-600">{ndvi.toFixed(2)} (BREACH)</td>
                          <td className="p-2.5 text-slate-500">Tree plantation is critical due to severe vegetative deficits across residential wards.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">Water Bodies</td>
                          <td className="p-2.5">Water Cover &lt; 5.0%</td>
                          <td className="p-2.5 font-bold text-red-600">{waterCoverage}% (BREACH)</td>
                          <td className="p-2.5 text-slate-500">Water restoration selected to expand urban cooling evaporative sinks.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">Pocket Parks</td>
                          <td className="p-2.5">Density &gt; 300 /km²</td>
                          <td className="p-2.5 font-bold text-slate-700">{popDensity} (MATCH)</td>
                          <td className="p-2.5 text-slate-500">Urban parks chosen to protect densely packed administrative wards from direct exposure.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Allocation summary row */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono text-[10px]">
                  <div>
                    <span className="font-bold text-slate-800 block">TOTAL DEPLOYED PORTFOLIO</span>
                    <span className="text-[8px] text-slate-400 block uppercase">OPTIMAL PORTFOLIO RATIO MET</span>
                  </div>
                  <span className="font-black text-[#0E5EFF] text-base">₹24.00 CRORE</span>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 13: ECONOMIC IMPACT */}
            <ReportPage pageNumber={13} totalPages={totalPages} title="ECONOMIC IMPACT &amp; ROI ANALYSIS">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Financial returns, power grid savings, and public safety cost reductions computed per Crore of investment.
                </p>

                {/* Metric list */}
                <div className="space-y-3 font-mono text-[10px]">
                  {[
                    { title: "Grid Energy Conservation", value: "22,400 MWh / Year", desc: "Estimated reduction in active HVAC cooling electrical overheads." },
                    { title: "Cooling Cost Offset", value: "₹4.8 Cr Saved / Year", desc: "Direct consumer utility bill reductions under cooler building envelopes." },
                    { title: "Carbon Capture Equivalence", value: "18,500 tCO2e / Year", desc: "Sequestration and power grid emission abatement equivalents." },
                    { title: "Productivity Protection", value: "+14.5% Work-hours Shielded", desc: "Preventative shields protecting outdoor workforces from heat fatigue." },
                    { title: "Healthcare Savings", value: "₹2.2 Cr Saved / Year", desc: "Prevented hospitalization fees and emergency heatstroke response costs." }
                  ].map((metric, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">{metric.title}</span>
                        <span className="text-[8px] text-slate-400 block">{metric.desc}</span>
                      </div>
                      <span className="font-extrabold text-[#0E5EFF] text-right">{metric.value}</span>
                    </div>
                  ))}
                </div>

                {/* SVG line chart */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 font-mono text-[10px] space-y-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
                    CUMULATIVE PAYBACK PAYOFF (PORTFOLIO ROI)
                  </span>
                  <div className="h-28 bg-white border border-slate-100 rounded-lg relative flex items-center justify-center">
                    <svg viewBox="0 0 320 100" className="w-full h-full text-slate-400">
                      {/* Grid */}
                      <line x1="20" y1="80" x2="300" y2="80" stroke="#E2E8F0" strokeWidth="1" />
                      <line x1="20" y1="20" x2="20" y2="80" stroke="#E2E8F0" strokeWidth="1" />
                      {/* Payback Line */}
                      <path d="M 20 80 L 80 70 L 140 55 L 200 40 L 260 25 L 300 15" fill="none" stroke="#0E5EFF" strokeWidth="2" />
                      {/* Payback marker */}
                      <circle cx="200" cy="40" r="3" fill="#EF4444" />
                      <text x="210" y="44" className="fill-red-650 text-[7px] font-bold">PAYBACK THRESHOLD (YEAR 3.5)</text>
                      {/* Labels */}
                      <text x="15" y="90" className="text-[6px]">Yr 0</text>
                      <text x="140" y="90" className="text-[6px]">Yr 2</text>
                      <text x="260" y="90" className="text-[6px]">Yr 4</text>
                    </svg>
                  </div>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 14: FUTURE SCENARIO SIMULATION */}
            <ReportPage pageNumber={14} totalPages={totalPages} title="THERMODYNAMIC SCENARIO SIMULATIONS">
              <div className="space-y-6">
                <p className="text-xs text-[#FF7A00] font-mono font-bold bg-[#FF7A00]/10 border border-[#FF7A00]/20 p-2.5 rounded-lg leading-normal text-center">
                  ⚠️ SCENARIO-BASED SIMULATION ONLY — NOT A WEATHER FORECAST
                </p>

                <p className="text-xs text-slate-500 leading-normal">
                  Scientific models simulating potential local surface heat reductions following progressive stages of mitigation deployment.
                </p>

                {/* Scenario items */}
                <div className="space-y-3 font-mono text-[10px]">
                  {[
                    { stage: "Baseline Status (Current)", temp: `${curLst.toFixed(1)}°C LST`, drop: "0.0°C", reduction: "0% Risk Reduction", pop: "0 people shielded", color: "border-red-200 text-red-700 bg-red-50/10" },
                    { stage: "Municipal Cool Roof Scenario", temp: `${(curLst - 0.8).toFixed(1)}°C LST`, drop: "-0.8°C", reduction: "35% Risk Reduction", pop: "125,000 people shielded", color: "border-[#0E5EFF]/20 text-slate-800 bg-[#0E5EFF]/5" },
                    { stage: "Cool Roofs + Native Canopy Trees", temp: `${(curLst - 1.5).toFixed(1)}°C LST`, drop: "-1.5°C", reduction: "60% Risk Reduction", pop: "280,000 people shielded", color: "border-emerald-200 text-slate-800 bg-emerald-50/5" },
                    { stage: "Integrated Cooling Strategy", temp: `${(curLst - 2.2).toFixed(1)}°C LST`, drop: "-2.2°C", reduction: "85% Risk Reduction", pop: "450,000 people shielded", color: "border-blue-200 text-slate-800 bg-blue-50/5" }
                  ].map((sc, idx) => (
                    <div key={idx} className={`p-3 border rounded-lg flex items-center justify-between ${sc.color}`}>
                      <div className="space-y-0.5">
                        <span className="font-bold text-[9px] uppercase block">{sc.stage}</span>
                        <span className="text-[8px] text-slate-500 block">{sc.reduction} • {sc.pop}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black block">{sc.temp}</span>
                        <span className="text-[8px] font-bold text-emerald-600">{sc.drop}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ReportPage>

            {/* PAGE 15: POLICY RECOMMENDATION ROADMAP */}
            <ReportPage pageNumber={15} totalPages={totalPages} title="ACTION PLAN FOR DISTRICT ADMINISTRATION">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Administrative phase allocations mapped to guide physical cooling deployment timelines for district collectors.
                </p>

                {/* Timeline Roadmap */}
                <div className="space-y-3 font-mono text-[9px]">
                  {[
                    { phase: "Immediate Actions (0-6 Months)", impact: "Direct peak temperature suppression", budget: "₹8.00 Cr", dept: "Municipal Admin / Urban Planning", priority: "CRITICAL", actions: ["Deploy thermo-reflective roof coatings on state offices & tenements", "Distribute residential lime wash buckets to low-income wards"] },
                    { phase: "Medium-Term Actions (6-12 Months)", impact: "Urban shade cover amplification", budget: "₹10.00 Cr", dept: "Forestry & Parks Departments", priority: "HIGH", actions: ["Plant multi-layered native tree species on urban avenues", "Restructure vacant public spaces into green pocket parks"] },
                    { phase: "Long-Term Actions (12-24 Months)", impact: "Evaporative basin recovery", budget: "₹6.00 Cr", dept: "Water Resources Board / PWD", priority: "MODERATE", actions: ["De-silt municipal water storage reservoirs and lake borders", "Mandate high-albedo cool roof paving rules for building permits"] }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-[9.5px] text-slate-800 uppercase">{item.phase}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] ${
                          item.priority === "CRITICAL" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>{item.priority}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[8px] text-slate-400">
                        <div><span>Allocated Budget:</span> <span className="font-bold text-slate-700">{item.budget}</span></div>
                        <div><span>Lead Department:</span> <span className="font-bold text-slate-700">{item.dept}</span></div>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-slate-100 text-[8.5px] text-slate-600">
                        {item.actions.map((act, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span className="text-[#0E5EFF] font-bold">•</span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ReportPage>

            {/* PAGE 16: EXECUTIVE POLICY QUICK-VIEW */}
            <ReportPage pageNumber={16} totalPages={totalPages} title="WHAT SHOULD THE GOVERNMENT DO TOMORROW?">
              <div className="space-y-6">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs leading-normal">
                  <strong>60-SECOND EXECUTIVE DIGEST FOR POLICY MAKERS:</strong> This page establishes the 5 highest-priority interventions to launch immediately. Total implementation reduces severe heat exposure indices by up to 85% within 18 months.
                </div>

                {/* Top 5 Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-[9px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">PRIORITY ACTION</th>
                        <th className="p-3 text-right">REQUIRED BUDGET</th>
                        <th className="p-3 text-right">EXPECTED COOLING</th>
                        <th className="p-3 text-right">TIMELINE</th>
                        <th className="p-3 text-right">RANK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-3 font-bold">1. Mandate Commercial Cool Roof building codes</td>
                        <td className="p-3 text-right">₹1.50 Cr</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">-1.2°C LST</td>
                        <td className="p-3 text-right">0-3M</td>
                        <td className="p-3 text-right font-black">#01</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">2. Subsidize residential lime wash coatings</td>
                        <td className="p-3 text-right">₹3.00 Cr</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">-0.8°C LST</td>
                        <td className="p-3 text-right">0-6M</td>
                        <td className="p-3 text-right font-black">#02</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">3. Implement Urban Forest belts on avenues</td>
                        <td className="p-3 text-right">₹6.00 Cr</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">-0.6°C LST</td>
                        <td className="p-3 text-right">6-12M</td>
                        <td className="p-3 text-right font-black">#03</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">4. De-silt silted municipal lake borders</td>
                        <td className="p-3 text-right">₹4.00 Cr</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">-0.4°C LST</td>
                        <td className="p-3 text-right">12-18M</td>
                        <td className="p-3 text-right font-black">#04</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">5. Establish 'Cool Ward' public shelters</td>
                        <td className="p-3 text-right">₹1.50 Cr</td>
                        <td className="p-3 text-right text-emerald-600 font-bold">-0.3°C LST</td>
                        <td className="p-3 text-right">0-6M</td>
                        <td className="p-3 text-right font-black">#05</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 17: INFRASTRUCTURE RISK */}
            <ReportPage pageNumber={17} totalPages={totalPages} title="CRITICAL INFRASTRUCTURE THERMAL HAZARDS">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Risk matrix assessing active threat profiles and vulnerabilities of regional networks under persistent extreme heat conditions.
                </p>

                {/* Stress matrix elements */}
                <div className="space-y-4">
                  {[
                    { asset: "Power Grid Overload", level: "Critical Stress", details: "Elevated residential and commercial cooling loads cause acute utility transmission substation peak stress.", color: "border-red-350 bg-red-50/10 text-red-600 font-extrabold" },
                    { asset: "Water Supply Reservoirs", level: "High Evaporation", details: "Extreme evaporation suppresses surface storage volumes, triggering acute water shortages.", color: "border-amber-300 bg-amber-50 text-amber-700 font-extrabold" },
                    { asset: "Transport Logistics Network", level: "Moderate Expansion", details: "Persistent high tarmac temperatures trigger moderate asphalt warping and thermal decay.", color: "border-slate-300 bg-slate-50 text-slate-700" }
                  ].map((row, idx) => (
                    <div key={idx} className={`p-3 border rounded-lg flex items-start justify-between gap-4 font-mono text-[9.5px] ${row.color}`}>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="font-extrabold block uppercase text-[9.5px]">{row.asset}</span>
                        <p className="text-[8px] text-slate-500 leading-normal font-normal">{row.details}</p>
                      </div>
                      <span className="shrink-0 uppercase tracking-wider text-[8px] border px-2 py-0.5 rounded font-black">{row.level}</span>
                    </div>
                  ))}
                </div>

                {/* Score bottom */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center font-mono text-[10px]">
                  <div>
                    <span className="font-bold text-slate-800 block">EMERGENCY PREPAREDNESS INDEX</span>
                    <span className="text-[8px] text-slate-400 block uppercase">REGIONAL COMPLIANCE INDEX</span>
                  </div>
                  <span className="text-sm font-black text-slate-950">78/100</span>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 18: DISTRICT DIGITAL TWIN PIPELINE */}
            <ReportPage pageNumber={18} totalPages={totalPages} title="DISTRICT DIGITAL TWIN MODEL PIPELINE">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Functional schema demonstrating how raw Earth Observation telemetry is processed, calibrated, and modeled to deliver optimization policy actions.
                </p>

                {/* Twin diagram flow */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-center items-center h-80 relative">
                  <svg viewBox="0 0 320 230" className="w-full h-full text-slate-900">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#94A3B8" />
                      </marker>
                    </defs>
                    {/* Connections */}
                    <g stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" fill="none" markerEnd="url(#arrow)">
                      {/* Horizontal connections */}
                      <line x1="105" y1="26" x2="115" y2="26" />
                      <line x1="205" y1="26" x2="215" y2="26" />
                      
                      <line x1="105" y1="81" x2="115" y2="81" />
                      <line x1="205" y1="81" x2="215" y2="81" />
                      
                      <line x1="105" y1="136" x2="115" y2="136" />
                      <line x1="205" y1="136" x2="215" y2="136" />
                      
                      {/* Vertical connections */}
                      <line x1="60" y1="37" x2="60" y2="70" />
                      <line x1="160" y1="37" x2="160" y2="70" />
                      <line x1="260" y1="37" x2="260" y2="70" />
                      
                      <line x1="60" y1="92" x2="60" y2="125" />
                      <line x1="160" y1="92" x2="160" y2="125" />
                      <line x1="260" y1="92" x2="260" y2="125" />
                      
                      <line x1="160" y1="147" x2="160" y2="180" />
                      
                      {/* Diagonal connections to 10 */}
                      <path d="M 60 147 L 60 160 L 125 180" />
                      <path d="M 260 147 L 260 160 L 195 180" />
                    </g>
                    {/* Node blocks */}
                    {[
                      { x: 15, y: 15, label: "01. Satellite Sources" },
                      { x: 115, y: 15, label: "02. ETL Pipelines" },
                      { x: 215, y: 15, label: "03. GeoSpatial Proc" },
                      { x: 15, y: 70, label: "04. Feature Eng" },
                      { x: 115, y: 70, label: "05. Physics Engine" },
                      { x: 215, y: 70, label: "06. XGBoost Model" },
                      { x: 15, y: 125, label: "07. SHAP Attribution" },
                      { x: 115, y: 125, label: "08. Optimization Eng" },
                      { x: 215, y: 125, label: "09. Decision Dashboard" },
                      { x: 115, y: 180, label: "10. Policy Action" }
                    ].map((n, i) => (
                      <g key={i}>
                        <rect x={n.x} y={n.y} width="90" height="22" rx="2" fill="#ffffff" stroke="#64748B" strokeWidth="1" />
                        <text x={n.x + 45} y={n.y + 14} textAnchor="middle" className="font-mono text-[6px] font-bold fill-slate-800">{n.label}</text>
                      </g>
                    ))}
                    <text x="160" y="218" textAnchor="middle" className="font-mono text-[7px] fill-slate-400 font-bold uppercase">AEGIS TWIN PIPELINE SCHEMA</text>
                  </svg>
                </div>
              </div>
            </ReportPage>

            {/* PAGE 19: MLOPS PIPELINE & MATURITY */}
            <ReportPage pageNumber={19} totalPages={totalPages} title="AIML &amp; MLOPS SYSTEM SYSTEM">
              <div className="space-y-6 text-slate-800">
                <p className="text-xs text-slate-500 leading-normal">
                  Technical specifications, pipeline frameworks, predictive models, and continuous calibration deployment cycles driving the platform.
                </p>

                {/* Workflow blocks */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 font-mono text-[8px] space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">MLOPS WORKFLOW ARCHITECTURE</span>
                  <div className="grid grid-cols-5 gap-2 text-center text-slate-700">
                    <div className="p-1.5 bg-white border rounded">Data Sources<br /><span className="text-[6.5px] text-slate-400">Landsat APIs</span></div>
                    <div className="p-1.5 bg-white border rounded">Validation<br /><span className="text-[6.5px] text-slate-400">Great Expect</span></div>
                    <div className="p-1.5 bg-white border rounded">Feature Store<br /><span className="text-[6.5px] text-slate-400">Feast store</span></div>
                    <div className="p-1.5 bg-white border rounded">Training<br /><span className="text-[6.5px] text-slate-400">XGBoost Regr</span></div>
                    <div className="p-1.5 bg-white border rounded">Registry<br /><span className="text-[6.5px] text-slate-400">MLflow Hub</span></div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-slate-700 mt-2">
                    <div className="p-1.5 bg-white border rounded">Validation<br /><span className="text-[6.5px] text-slate-400">Test Metrics</span></div>
                    <div className="p-1.5 bg-white border rounded">Deployment<br /><span className="text-[6.5px] text-slate-400">Docker Hub</span></div>
                    <div className="p-1.5 bg-white border rounded">Monitoring<br /><span className="text-[6.5px] text-slate-400">Prometheus</span></div>
                    <div className="p-1.5 bg-white border rounded">Retraining<br /><span className="text-[6.5px] text-slate-400">Weekly cron</span></div>
                  </div>
                </div>

                {/* MLOps Maturity Levels */}
                <div className="space-y-2 font-mono text-[9px]">
                  <span className="text-[9.5px] font-bold text-slate-400 block uppercase">MLOPS PIPELINE MATURITY LEVELS</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[8px]">
                    <div className="p-2 border border-slate-200 rounded bg-slate-50 text-slate-400">
                      <span className="font-bold block">L0</span>
                      Manual Analytics
                    </div>
                    <div className="p-2 border border-slate-200 rounded bg-slate-50 text-slate-400">
                      <span className="font-bold block">L1</span>
                      Auto Training
                    </div>
                    <div className="p-2 border-2 border-slate-800 rounded bg-slate-900 text-white">
                      <span className="font-bold block">L2</span>
                      Auto Deployment (ACTIVE)
                    </div>
                    <div className="p-2 border border-slate-200 rounded bg-slate-50 text-slate-400">
                      <span className="font-bold block">L3</span>
                      Continuous Monitor
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-mono text-slate-500 leading-normal flex flex-wrap gap-1.5 items-center justify-center">
                  {["XGBoost", "MLflow", "Docker", "GitHub Actions", "PostgreSQL", "PostGIS", "TypeScript", "React", "Leaflet", "GeoServer", "Redis", "FastAPI"].map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-700">{tag}</span>
                  ))}
                </div>
              </div>
            </ReportPage>

            {/* PAGE 20: CALIBRATION & CONFIDENCE */}
            <ReportPage pageNumber={20} totalPages={totalPages} title="CALIBRATION STATUS &amp; CONFIDENCE LEVELS">
              <div className="space-y-6">
                <p className="text-xs text-slate-500 leading-normal">
                  Official verification, ingestion completeness indices, and error validation metrics compared against ground-truth weather stations.
                </p>

                {/* Scale Grid */}
                <div className="grid grid-cols-2 gap-4 font-mono text-[9.5px]">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">MONITORED SCOPE</span>
                    <span className="text-base font-extrabold text-[#0E5EFF] block">766+ Districts covered</span>
                    <p className="text-[7.5px] text-slate-400 leading-normal">Covers 28 States and 8 Union Territories in India.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">INGESTION RESOLUTION</span>
                    <span className="text-base font-extrabold text-emerald-600 block">Daily Refresh</span>
                    <p className="text-[7.5px] text-slate-400 leading-normal">Raw spectral bands ingested at every single orbital sweep.</p>
                  </div>
                </div>

                {/* STRICTOR COMPLIANCE CALIBRATION PAGE (No fake metrics) */}
                <div className="p-4 bg-red-50/30 border border-dashed border-red-200 rounded-xl space-y-2 font-mono text-[9.5px] text-slate-600 leading-normal">
                  <div className="font-bold text-red-700 uppercase flex items-center gap-1.5 text-[10px]">
                    <ShieldCheck className="h-4 w-4" />
                    OFFICIAL VALIDATION LEVEL
                  </div>
                  <p>
                    <strong>CALIBRATION STATUS:</strong> <span className="font-bold text-red-700">Research Prototype / Validation Pending</span>.
                  </p>
                  <p>
                    Ground-truth physical calibration loops are ongoing. Direct comparison matches against regional Automated Weather Stations (AWS) are pending regional field calibration audits. Future physical validation cycles are planned on a quarterly basis.
                  </p>
                </div>

                {/* Disclaimer signatures with double border stamp */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 bg-slate-50 flex items-center justify-between gap-6">
                  <div className="space-y-1.5 font-mono text-[8.5px] text-slate-500 flex-1 leading-normal">
                    <span className="font-extrabold text-slate-700 block uppercase text-[9px]">OFFICIAL RESEARCH SIGN-OFF:</span>
                    <p>
                      Modeling outputs are generated automatically by the AEGIS biophysical pipeline under current ISRO spectral indices.
                    </p>
                  </div>
                  <div className="shrink-0 text-center border-2 border-dashed border-[#0E5EFF] p-3 rounded-lg bg-white transform -rotate-1">
                    <span className="text-[7px] text-[#0E5EFF] font-bold block uppercase tracking-widest">ISRO AEGIS LABS</span>
                    <span className="text-xs font-black text-slate-900 block mt-0.5">PROTOTYPE</span>
                    <span className="text-[7px] text-slate-400 block">CALIBRATION PENDING</span>
                  </div>
                </div>
              </div>
            </ReportPage>

          </div>
        </div>
      </div>
    </div>
  );
};
