import React from "react";
import { 
  Home,
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  Bell, 
  ShieldCheck, 
  Info, 
  HelpCircle, 
  Cpu, 
  Layers, 
  LineChart, 
  Calculator,
  Database,
  BookOpen
} from "lucide-react";

export function AegisLogo({ className = "w-full" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <div className="relative flex items-center justify-center w-full h-[220px]">
        <img
          src="/logon.jpeg"
          alt="AEGIS HEAT"
          referrerPolicy="no-referrer"
          className="
            max-w-[210px]
            max-h-[210px]
            w-auto
            h-auto
            object-contain
            select-none
            filter
            drop-shadow-[0_0_16px_rgba(0,194,255,0.3)]
            transition-all
            duration-500
            group-hover:scale-105
          "
        />

        {/* Ambient Telemetry Status Indicator */}
        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676]"></span>
        </span>
      </div>
    </div>
  );
}

export function AegisLogoIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src="/logon.jpeg"
        alt="AEGIS HEAT Icon"
        referrerPolicy="no-referrer"
        className="h-full w-full object-contain select-none rounded-lg"
      />
    </div>
  );
}

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  systemMode: string;
  alertsCount: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Navigation({ currentTab, setCurrentTab, systemMode, alertsCount, isOpen, onClose }: NavigationProps) {
  const menuItems = [
    { id: "dashboard", label: "Twin Dashboard", icon: LayoutDashboard },
    { id: "explorer", label: "India Climate Explorer", icon: Map },
    { id: "rankings", label: "District Rankings", icon: Layers },
    { id: "analysis", label: "Heat Driver Analysis", icon: TrendingUp },
    { id: "forecasting", label: "Microclimate Forest", icon: LineChart },
    { id: "optimizer", label: "Cooling Optimizer", icon: Cpu },
    { id: "budget", label: "Budget Simulator", icon: Calculator },
    { id: "alerts", label: "Live Sensors & Alerts", icon: Bell, badge: alertsCount },
    { id: "audit", label: "Governance Audit", icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      <aside 
        id="aegis-sidebar" 
        className={`fixed inset-y-0 left-0 w-68 bg-slate-950/45 backdrop-blur-md border-r border-white/10 text-white flex flex-col justify-between h-full overflow-hidden select-none z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div 
          onClick={() => setCurrentTab("home")}
          className="p-4 pb-5 border-b border-white/5 bg-slate-950/15 flex flex-col items-center justify-center relative cursor-pointer hover:bg-white/5 transition-all duration-300 group min-h-[290px]"
          title="Return to Home Screen"
        >
          {/* Unified Complete Emblem & Logo (Horizontal Lockup) */}
          <AegisLogo className="w-full filter drop-shadow-md transform group-hover:scale-[1.01] transition-all duration-300" />

          {/* Connection status card */}
          <div className="mt-3.5 w-full px-2.5 py-1.5 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse shadow-[0_0_8px_#00E676]" />
              <span className="text-[9px] font-mono text-slate-200 font-extrabold tracking-wider">TELEMETRY SECURE</span>
            </div>
            <span className="text-[8.5px] font-mono text-[#00C2FF] font-bold uppercase">{systemMode}</span>
          </div>
        </div>

        {/* Navigation Options */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="text-[10px] font-mono tracking-widest text-[#0E5EFF] font-bold px-3 mb-2 uppercase">
            WORKSPACE SECTORS
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`nav-tab-${item.id}`}
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all duration-300 group font-sans ${
                  isActive
                    ? "bg-gradient-to-r from-[#00C2FF]/20 to-[#0099FF]/10 border border-[#00C2FF]/30 text-white font-bold shadow-lg shadow-[#00C2FF]/5"
                    : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4.5 w-4.5 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#FF7A00] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Support Panel */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20 text-[10px] text-slate-400 flex flex-col gap-2 font-sans">
          <div className="flex items-center gap-1.5 text-slate-350 font-mono">
            <Database className="h-3 w-3 text-[#0E5EFF]" />
            <span>Ingestion Hub: REST / TLS</span>
          </div>
          <div className="text-[9px] text-slate-450 font-mono leading-relaxed bg-slate-950/30 p-2 rounded border border-white/5">
            Disclaimer: Ground-truthed calibrated physics microclimate modeling. Target verification: Landsat 8 & Copernicus Sentinel-2.
          </div>
        </div>
      </aside>
    </>
  );
}
