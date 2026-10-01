import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { DistrictHeatModel } from "../types";
import districtRegistry from "../services/district_registry.json";
import { Activity, ShieldAlert, Cpu, Layers, Search, X } from "lucide-react";
import { normalizeString } from "../services/normalization";
import { buildLookupMaps, matchFeature } from "../services/matching_engine";

interface ClimateMapProps {
  districts: DistrictHeatModel[];
  activeDistrictId: string;
  setActiveDistrictId: (id: string) => void;
  selectedMapLayer: "heat_risk" | "lst" | "ndvi" | "aqi" | "population" | "water" | "interventions";
}

// Global cache to avoid double-fetching GeoJSON across tab changes
let geojsonCache: any = null;

export const ClimateMap: React.FC<ClimateMapProps> = ({
  districts,
  activeDistrictId,
  setActiveDistrictId,
  selectedMapLayer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  
  // HUD local states for real-time telemetry readout
  const [loadedBoundaryData, setLoadedBoundaryData] = useState<any>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictHeatModel | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHoveredMatch, setIsHoveredMatch] = useState<boolean>(true);
  const [isGeojsonLoading, setIsGeojsonLoading] = useState<boolean>(true);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [isBoundaryUnavailable, setIsBoundaryUnavailable] = useState<boolean>(false);
  const [signalStatus, setSignalStatus] = useState<string>("Initializing satellite link...");

  // ESC -> Clear selection keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDistrictId("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setActiveDistrictId]);

  const [zoomLevel, setZoomLevel] = useState<number>(5.2);
  const labelsLayerRef = useRef<L.LayerGroup | null>(null);

  // Derive zoom band
  const zoomBand = useMemo(() => {
    if (zoomLevel < 6.0) return "low";
    if (zoomLevel < 8.0) return "medium";
    return "high";
  }, [zoomLevel]);

  // Compute state-level averages for low zoom level merging
  const stateAverages = useMemo(() => {
    const states = new Map<string, { sum: number; count: number; values: any[] }>();
    
    districts.forEach(d => {
      const stateName = normalizeString(d.stateName || d.state || "");
      if (!states.has(stateName)) {
        states.set(stateName, { sum: 0, count: 0, values: [] });
      }
      const stateData = states.get(stateName)!;
      stateData.count++;
      stateData.values.push(d);
    });

    const averages: Record<string, Record<string, any>> = {};
    states.forEach((data, stateName) => {
      averages[stateName] = {
        heat_risk: data.values.reduce((sum, d) => sum + (d.heatRiskScore || 0), 0) / data.count,
        lst: data.values.reduce((sum, d) => sum + (d.lst_current || d.lst || 0), 0) / data.count,
        ndvi: data.values.reduce((sum, d) => sum + (d.ndvi || 0), 0) / data.count,
        aqi: data.values.reduce((sum, d) => sum + (d.aqi || 0), 0) / data.count,
        population: data.values.reduce((sum, d) => sum + (d.populationDensity || d.population_density || 0), 0) / data.count,
        water: data.values.reduce((sum, d) => sum + (d.waterBodiesCover || d.water_coverage || 0), 0) / data.count,
      };
    });

    return averages;
  }, [districts]);

  const getStateAverageColor = (state: string, layer: typeof selectedMapLayer): string => {
    const stateName = normalizeString(state);
    const avgData = stateAverages[stateName];
    if (!avgData) return "#e2e8f0";

    if (layer === "interventions") {
      const stateDistricts = districts.filter(d => normalizeString(d.stateName || d.state || "") === stateName);
      const counts: Record<string, number> = {};
      stateDistricts.forEach(d => {
        const rc = d.riskContributors || { vegetationLoss: 0, imperviousSurface: 0, populationExposure: 0, waterScarcity: 0 };
        const maxContributor = Object.entries(rc).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "vegetationLoss";
        counts[maxContributor] = (counts[maxContributor] || 0) + 1;
      });
      const topIntervention = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "vegetationLoss";
      if (topIntervention === "vegetationLoss") return "#10B981";
      if (topIntervention === "imperviousSurface") return "#FBBF24";
      if (topIntervention === "populationExposure") return "#8B5CF6";
      if (topIntervention === "waterScarcity") return "#06B6D4";
      return "#FDA4AF";
    }

    const val = avgData[layer];
    if (val === undefined) return "#e2e8f0";

    switch (layer) {
      case "heat_risk":
        return val > 80 ? "#FF2E00" : val > 65 ? "#FF8500" : val > 48 ? "#FFC800" : "#14AE5C";
      case "lst":
        return val >= 42 ? "#EF4444" : val >= 38 ? "#F97316" : val >= 34 ? "#FCD34D" : "#14AE5C";
      case "ndvi":
        return val > 0.22 ? "#14AE5C" : val > 0.15 ? "#A8DE34" : "#FF7A00";
      case "aqi":
        return val > 150 ? "#DC2626" : val > 100 ? "#F59E0B" : "#10B981";
      case "population":
        return val > 12000 ? "#A855F7" : val > 6000 ? "#3B82F6" : "#14AE5C";
      case "water":
        return val > 6 ? "#06B6D4" : val > 3 ? "#3B82F6" : "#475569";
      default:
        return "#111827";
    }
  };

  // Step 1: Create lookup maps once using useMemo()
  const lookupMaps = useMemo(() => {
    return buildLookupMaps(districts);
  }, [districts]);

  // Step 10: Startup Synchronization Verification
  useEffect(() => {
    if (!loadedBoundaryData || districts.length === 0) return;

    const geojsonFeatures = loadedBoundaryData.features || [];
    const geojsonCount = geojsonFeatures.length;
    const registryCount = districtRegistry.length;
    const datasetCount = districts.length;

    console.log(`[SYNC VERIFICATION] Initiating core synchronization assessment...`);
    console.log(`- GeoJSON districts count: ${geojsonCount}`);
    console.log(`- District Registry count: ${registryCount}`);
    console.log(`- Master Dataset count: ${datasetCount}`);

    const mismatches: string[] = [];

    const registryCodes = new Map<string, string>();
    (districtRegistry as any[]).forEach((entry) => {
      registryCodes.set(entry.districtCode, entry.stateName);
    });

    const datasetCodes = new Map<string, string>();
    districts.forEach((d) => {
      datasetCodes.set(d.id || d.districtCode, d.stateName || d.state);
    });

    if (registryCount !== datasetCount) {
      mismatches.push(`Count mismatch: Registry has ${registryCount} districts but Master Dataset has ${datasetCount}.`);
    }

    let unmatchedCodes = 0;
    let stateMismatches = 0;
    registryCodes.forEach((stateName, code) => {
      if (!datasetCodes.has(code)) {
        unmatchedCodes++;
      } else {
        const dsState = datasetCodes.get(code);
        if (normalizeString(dsState) !== normalizeString(stateName)) {
          stateMismatches++;
        }
      }
    });

    if (unmatchedCodes > 0) {
      mismatches.push(`District Code mismatch: ${unmatchedCodes} codes in District Registry are missing from Master Dataset.`);
    }
    if (stateMismatches > 0) {
      mismatches.push(`State Mapping mismatch: ${stateMismatches} districts have different state associations between Registry and Dataset.`);
    }

    if (mismatches.length > 0) {
      console.warn(`[SYNC VERIFICATION REPORT - MISMATCHES DETECTED]
=========================================
${mismatches.join("\n")}
=========================================`);
    } else {
      console.log(`[SYNC VERIFICATION REPORT - SUCCESS] All sources are 100% synchronized!`);
    }
  }, [loadedBoundaryData, districts]);


  // Helper function to color polygons according to active layered telemetry
  const getLayerColor = (d: DistrictHeatModel, layer: typeof selectedMapLayer): string => {
    switch (layer) {
      case "heat_risk": {
        const score = d.heatRiskScore;
        return score > 80
          ? "#FF2E00" // Sizzling hazard crimson
          : score > 65
          ? "#FF8500" // Elevated heat warning orange
          : score > 48
          ? "#FFC800" // Warm cautionary golden saffron
          : "#14AE5C"; // Thermal safe buffer forest green
      }
      case "lst": {
        const temp = d.lst_current || d.lst;
        return temp >= 42
          ? "#EF4444" // Scorched solar red
          : temp >= 38
          ? "#F97316" // Intense orange thermal emission
          : temp >= 34
          ? "#FCD34D" // Moderate golden yellow
          : "#14AE5C"; // Cool vegetative sinks
      }
      case "ndvi": {
        const val = d.ndvi;
        return val > 0.22
          ? "#14AE5C" // High tree foliage canopy
          : val > 0.15
          ? "#A8DE34" // Scrub land brush and grass
          : "#FF7A00"; // Bare soil/Arid deforestation
      }
      case "aqi": {
        const value = d.aqi;
        return value > 150
          ? "#DC2626" // Dangerous particulate index red
          : value > 100
          ? "#F59E0B" // Smog haze yellow/amber
          : "#10B981"; // Stable clean marine/forest air index
      }
      case "population": {
        const density = d.populationDensity || d.population_density;
        return density > 12000
          ? "#A855F7" // Metropolitan mega density violet
          : density > 6000
          ? "#3B82F6" // Dense urban cobalt blue
          : "#14AE5C"; // Lightly scattered municipal greens
      }
      case "water": {
        const cov = d.waterBodiesCover || d.water_coverage;
        return cov > 6
          ? "#06B6D4" // Saturated river wetlands cyan
          : cov > 3
          ? "#3B82F6" // Cool reservoir blues
          : "#475569"; // Dehydrated dry field
      }
      case "interventions": {
        const rc = d.riskContributors || { vegetationLoss: 0, imperviousSurface: 0, populationExposure: 0, waterScarcity: 0 };
        const maxContributor = Object.entries(rc).sort((a: any, b: any) => b[1] - a[1])[0][0];
        
        if (maxContributor === "vegetationLoss") return "#10B981"; // Solution: Urban Forests
        if (maxContributor === "imperviousSurface") return "#FBBF24"; // Solution: Albedo Cool Roofs
        if (maxContributor === "populationExposure") return "#8B5CF6"; // Solution: Smart Shelters/Parks
        if (maxContributor === "waterScarcity") return "#06B6D4"; // Solution: Wetland Sinks
        return "#FDA4AF"; // Solution: Cool Pavement
      }
      default:
        return "#111827";
    }
  };

  // Hover Tooltip generator (Fitted to NASA GIS Standard styling, with validation mismatch engine)
  const generateExtendedTooltip = (d: DistrictHeatModel, isMatch: boolean = true): string => {
    if (!isMatch) {
      return `
        <div class="p-2.5 bg-slate-900/95 text-white border border-red-500 rounded-md shadow-lg max-w-[280px] font-sans text-[11px] pointer-events-none">
          <div class="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[10px] mb-1">
            <span>⚠️ Telemetry Variance</span>
          </div>
          <p class="text-slate-300 leading-relaxed font-mono">
            District: ${d.districtName || d.name}<br/>
            No active satellite synchronization.
          </p>
        </div>
      `;
    }

    const score = d.heatRiskScore || d.heat_vulnerability_score || 0;
    const riskLabel =
      score > 80 ? "CRITICAL" : score > 65 ? "HIGH" : score > 48 ? "MODERATE" : "LOW";

    const riskColor =
      score > 80 ? "text-red-400 font-bold" : score > 65 ? "text-amber-400 font-bold" : score > 48 ? "text-yellow-400 font-semibold" : "text-emerald-400 font-semibold";

    // Get active layer value
    let layerValue = "";
    let layerLabel = "";
    switch (selectedMapLayer) {
      case "heat_risk":
        layerLabel = "Heat Risk Score";
        layerValue = `${score} / 100`;
        break;
      case "lst":
        layerLabel = "Land Surface Temp";
        layerValue = `${d.lst_current || d.lst}°C`;
        break;
      case "ndvi":
        layerLabel = "Greenery NDVI";
        layerValue = `${d.ndvi}`;
        break;
      case "aqi":
        layerLabel = "Air Quality AQI";
        layerValue = `${d.aqi} AQI`;
        break;
      case "population":
        layerLabel = "Population Density";
        layerValue = `${(d.populationDensity || d.population_density || 0).toLocaleString()}/km²`;
        break;
      case "water":
        layerLabel = "Water Bodies Cover";
        layerValue = `${d.waterBodiesCover || d.water_coverage || 0}%`;
        break;
      case "interventions":
        layerLabel = "Rec. Intervention";
        layerValue = (d.coolingRecommendations || [])[0] || "Urban Canopy";
        break;
    }

    return `
      <div class="p-3 bg-slate-900/95 text-white border border-slate-700/80 rounded-lg shadow-xl max-w-[280px] font-sans text-xs pointer-events-none space-y-1.5 backdrop-blur-sm">
        <div class="border-b border-slate-700/60 pb-1.5">
          <h4 class="font-extrabold text-slate-100 uppercase tracking-tight text-[11px]">${d.districtName || d.name}</h4>
          <p class="text-[9px] text-[#3b82f6] font-mono mt-0.5">${d.stateName || d.state} • ID: ${d.districtCode || d.id}</p>
        </div>
        <div class="space-y-1 text-[10.5px] font-mono">
          <div class="flex justify-between">
            <span class="text-slate-400">Risk Assessment:</span>
            <span class="${riskColor}">${riskLabel} (${score})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">${layerLabel}:</span>
            <span class="text-white font-bold">${layerValue}</span>
          </div>
        </div>
      </div>
    `;
  };

  // Dynamic polygon drawer utilizing either streaming GeoJSON or instant local cell fallbacks
  const loadBoundariesAndInitMap = async () => {
    setIsGeojsonLoading(true);
    let boundaryData: any = null;

    if (geojsonCache) {
      boundaryData = geojsonCache;
      setSignalStatus("GeoJSON retrieved from cache registry.");
    } else {
      setSignalStatus("Transceiving Earth Landsat district coordinate nodes...");
      try {
        // Fetch from our server-side secure cached proxy endpoint
        const response = await fetch("/api/geojson");
        if (!response.ok) {
          // Cascade to secondary direct local fallback as backup
          console.warn("[CLIMATE MAP] Primary proxy failed. Retrying direct local server transceiver...");
          const directRes = await fetch("/india_districts_simplified.geojson");
          if (!directRes.ok) throw new Error("Local high-performance files request failed");
          boundaryData = await directRes.json();
        } else {
          boundaryData = await response.json();
        }
        geojsonCache = boundaryData;
        setSignalStatus("Official Indian district shapefile successfully cached.");
      } catch (err) {
        console.error("GIS load failed. Setting boundary unavailable.", err);
        setIsBoundaryUnavailable(true);
        setSignalStatus("Boundary unavailable");
        boundaryData = {
          type: "FeatureCollection",
          features: [],
        };
      }
    }

    setLoadedBoundaryData(boundaryData);
    setIsGeojsonLoading(false);
    
    // Clear and redraw Leaflet layer
    if (geojsonLayerRef.current && mapRef.current) {
      geojsonLayerRef.current.remove();
    }

    if (!mapRef.current || !boundaryData) return;

    geojsonLayerRef.current = L.geoJSON(boundaryData, {
      filter: (feature) => {
        if (!feature || !feature.properties) return false;
        const props = feature.properties;
        const nameKeys = ["district", "dtname", "districtName", "DISTRICT", "name", "NAME_2", "NAME", "District"];
        return nameKeys.some(k => props[k] !== undefined && props[k] !== null && String(props[k]).trim() !== "");
      },
      style: (feature) => {
        if (!feature || !feature.properties) return {};
        const match = matchFeature(feature.properties, lookupMaps);
        const d = match.datasetEntry;

        const props = feature.properties || {};
        const geoDistRaw = props.district || props.dtname || props.districtName || props.DISTRICT || props.name || props.NAME_2 || props.NAME || props.District || "";
        const geoStateRaw = props.st_nm || props.stname || props.state || props.STATE || props.NAME_1 || props.State || props.st_code || "";
        const resolvedCode = props.districtCode || d?.districtCode || match.registryEntry?.districtCode;
        const resolvedDistrict = props.districtName || d?.districtName || match.registryEntry?.districtName || geoDistRaw;
        const resolvedState = props.stateName || d?.stateName || match.registryEntry?.stateName || geoStateRaw;
        const isFlagged = !resolvedCode || !resolvedDistrict || !resolvedState;

        const isSelected = d && d.id === activeDistrictId;
        const polyColor = (d && d.status !== "Data unavailable" && match.isMatch) ? getLayerColor(d, selectedMapLayer) : "#64748b";

        return {
          fillColor: polyColor,
          weight: isFlagged ? 1.5 : (isSelected ? 2.5 : 0.8),
          opacity: 1.0,
          color: isFlagged ? "#ef4444" : (isSelected ? "#ffffff" : "#23395d"),
          dashArray: isFlagged ? "3, 3" : undefined,
          fillOpacity: (d && d.status !== "Data unavailable" && match.isMatch) ? 0.75 : 0.5,
        };
      },
      onEachFeature: (feature, layer) => {
        const match = matchFeature(feature.properties, lookupMaps);
        const d = match.datasetEntry;
        const isMatch = match.isMatch;
        const props = feature.properties || {};
        const geoDistRaw = props.district || props.dtname || props.districtName || props.DISTRICT || props.name || props.NAME_2 || props.NAME || props.District || "";
        const geoStateRaw = props.st_nm || props.stname || props.state || props.STATE || props.NAME_1 || props.State || props.st_code || "";

        const resolvedCode = props.districtCode || d?.districtCode || match.registryEntry?.districtCode;
        const resolvedDistrict = props.districtName || d?.districtName || match.registryEntry?.districtName || geoDistRaw;
        const resolvedState = props.stateName || d?.stateName || match.registryEntry?.stateName || geoStateRaw;
        const isFlagged = !resolvedCode || !resolvedDistrict || !resolvedState;

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            const isSelected = d && d.id === activeDistrictId;
            if (d) {
              setHoveredDistrict(d);
            } else {
              setHoveredDistrict({
                districtCode: resolvedCode || "None",
                id: resolvedCode || "None",
                districtName: resolvedDistrict || "None",
                name: resolvedDistrict || "None",
                stateName: resolvedState || "None",
                state: resolvedState || "None",
                status: "Data unavailable",
              } as any);
            }
            if (e.containerPoint) {
              setMousePos({ x: e.containerPoint.x, y: e.containerPoint.y });
            }
            setIsHoveredMatch(isMatch);

            // Step 5: Confidence-based matching logic
            if (match.confidence >= 70 && match.confidence < 90) {
              console.warn(`[CONFIDENCE WARNING] Low confidence mapping (${match.confidence}%) for district "${geoDistRaw}" in state "${geoStateRaw}". Method: ${match.method}.`);
            } else if (match.confidence < 70) {
              console.warn(`[VALIDATION WARNING] Boundary data unavailable for "${geoDistRaw}". Confidence score below threshold: ${match.confidence}%.`);
            }
            
            // Step 9: Add diagnostics
            const polygonType = !geoDistRaw ? "State Polygon" : (d && d.status !== "Data unavailable" && isMatch ? "District Polygon" : "Unavailable District Polygon");
            const matchingStatus = isMatch ? "SUCCESS" : "FAILED";
            console.log(`[DIAGNOSTICS] Hovered Polygon Type: ${polygonType} | State: ${geoStateRaw || "None"} | District: ${geoDistRaw || "None"} | Code: ${resolvedCode || "None"} | Matching Status: ${matchingStatus}`);

            l.setStyle({
              weight: isFlagged ? 2.0 : (isSelected ? 3.0 : 2.0),
              color: isFlagged ? "#ef4444" : "#ffffff",
              fillOpacity: 0.85
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              l.bringToFront();
            }
          },
          mousemove: (e) => {
            if (e.containerPoint) {
              setMousePos({ x: e.containerPoint.x, y: e.containerPoint.y });
            }
          },
          mouseout: (e) => {
            const l = e.target;
            setHoveredDistrict(null);
            setMousePos(null);
            setIsHoveredMatch(true);
            
            // Revert back to original style or selection state
            if (!d || !isMatch || d.status === "Data unavailable") {
              l.setStyle({
                fillColor: "#64748b",
                color: isFlagged ? "#ef4444" : "#475569",
                weight: isFlagged ? 1.5 : 0.6,
                dashArray: isFlagged ? "3, 3" : undefined,
                fillOpacity: 0.5,
              });
            } else {
              const isSelected = d.id === activeDistrictId;
              const polyColor = getLayerColor(d, selectedMapLayer);
              l.setStyle({
                weight: isFlagged ? 1.5 : (isSelected ? 2.5 : 0.8),
                color: isFlagged ? "#ef4444" : (isSelected ? "#ffffff" : "#23395d"),
                dashArray: isFlagged ? "3, 3" : undefined,
                fillColor: polyColor,
                fillOpacity: 0.75
              });
            }
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            if (d) {
              setActiveDistrictId(d.id);
            }
          },
          dblclick: (e) => {
            L.DomEvent.stopPropagation(e);
            if (d) {
              setActiveDistrictId(d.id);
              if (mapRef.current) {
                mapRef.current.setView([d.lat, d.lng], 8.5, { animate: true, duration: 1.2 });
              }
            }
          }
        });
      }
    }).addTo(mapRef.current);

    // Initial Zoom sync on full-map build if valid activeDistrict selected
    const activeD = lookupMaps.datasetByDistrictCode.get(activeDistrictId);
    if (activeD && mapRef.current) {
      mapRef.current.setView([activeD.lat, activeD.lng], 6.5, { animate: true });
    }
  };

  // Initialize Map on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.84, 78.96], // Anchored perfectly on central India
      zoom: 5.2,
      zoomControl: false, // Disabling default to replace with nice science grids
      scrollWheelZoom: true,
      doubleClickZoom: false, // Prevent standard double click zoom
      maxZoom: 11,
      minZoom: 4.5,
    });

    // Light sleek high-contrast base layers (CartoDB light/positron tile systems)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OSM contributors © CARTO © ISRO Space Applications",
      maxZoom: 12
    }).addTo(map);

    // Set up zoom listener
    map.on("zoomend", () => {
      setZoomLevel(map.getZoom());
    });

    // Initialize labels layer group
    const labelsGroup = L.layerGroup().addTo(map);
    labelsLayerRef.current = labelsGroup;

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Dynamically manage high-zoom labels
  useEffect(() => {
    const map = mapRef.current;
    const labelsGroup = labelsLayerRef.current;
    if (!map || !labelsGroup) return;

    labelsGroup.clearLayers();

    if (zoomBand === "high") {
      districts.forEach((d) => {
        const labelIcon = L.divIcon({
          className: "district-map-label-wrapper",
          html: `<div class="district-map-label text-[9px] font-semibold text-slate-800 bg-white/90 px-1 py-0.5 rounded border border-slate-200/50 shadow-sm pointer-events-none">${d.districtName || d.name}</div>`,
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        });

        L.marker([d.lat, d.lng], { icon: labelIcon, keyboard: false }).addTo(labelsGroup);
      });
      if (!map.hasLayer(labelsGroup)) {
        labelsGroup.addTo(map);
      }
    } else {
      labelsGroup.remove();
    }
  }, [zoomBand, districts]);

  // Hot Reload boundaries when variables or layer categories update
  useEffect(() => {
    if (districts.length > 0 && mapRef.current) {
      loadBoundariesAndInitMap();
    }
  }, [districts, selectedMapLayer, activeDistrictId]);

  // Sync / fly camera when active ID changes externally
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeDistrictId || districts.length === 0) return;

    const matched = lookupMaps.datasetByDistrictCode.get(activeDistrictId);
    if (matched) {
      map.setView([matched.lat, matched.lng], 6.5, { animate: true, duration: 1.2 });
    }
  }, [activeDistrictId, lookupMaps]);

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[520px] rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-md overflow-hidden flex flex-col font-mono text-xs text-white">
      
      {/* Upper GIS status header bar (ISRO/NASA Style) */}
      <div className="bg-slate-950/50 border-b border-white/5 px-4 py-3 flex items-center justify-between select-none shrink-0 z-10 text-slate-200">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00C2FF] animate-pulse" />
          <span className="font-bold tracking-tight text-slate-100 uppercase text-[10px]">
            GIS TELESCOPE: ACTIVE ORBITAL LANDSAT SCANNER
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] bg-slate-900/60 px-2 py-0.5 rounded border border-white/5 text-slate-300">
          <span className={`w-1.5 h-1.5 rounded-full ${isFallbackMode ? "bg-amber-500 animate-ping" : "bg-[#00C2FF] animate-ping"}`} />
          {isFallbackMode ? "OFFLINE CELL MATRIX GRID" : "LIVE SIGNAL HEALTH STATUS"}
        </div>
      </div>

      {/* Map Display area */}
      <div className="relative flex-1 w-full bg-slate-950/25 min-h-0">
        
        {/* Leaflet instance element */}
        <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

        {/* Custom React Floating Tooltip (NASA/ISRO Science HUD Style) */}
        {hoveredDistrict && mousePos && (() => {
          const props = hoveredDistrict as any;
          const isFlagged = !props.districtCode || props.districtCode === "None" || !props.districtName || props.districtName === "None" || !props.stateName || props.stateName === "None";
          return (
            <div 
              className="absolute bg-slate-950/95 text-white border border-slate-800 rounded px-3.5 py-3 shadow-2xl font-mono text-[10px] pointer-events-none z-30 space-y-2 backdrop-blur-sm select-none min-w-[240px]"
              style={{ 
                left: `${mousePos.x + 15}px`, 
                top: `${mousePos.y + 15}px`,
              }}
            >
              <div className="border-b border-slate-800 pb-1.5">
                <span className="font-extrabold text-slate-100 uppercase tracking-wide text-[11px] block">
                  District: {hoveredDistrict.districtName || hoveredDistrict.name || "None"}
                </span>
                <span className="text-[9px] text-[#0E5EFF] block font-bold">
                  State: {hoveredDistrict.stateName || hoveredDistrict.state || "None"}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Code: {hoveredDistrict.districtCode || hoveredDistrict.id || "None"}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">RISK SCORE:</span>
                  {hoveredDistrict.status === "Data unavailable" ? (
                    <span className="font-bold text-slate-400 uppercase">Data unavailable</span>
                  ) : (
                    <span className={`font-bold uppercase ${
                      (hoveredDistrict.heatRiskScore || hoveredDistrict.heat_vulnerability_score || 0) > 80 
                        ? "text-red-500 animate-pulse" 
                        : (hoveredDistrict.heatRiskScore || hoveredDistrict.heat_vulnerability_score || 0) > 65 
                        ? "text-amber-500" 
                        : (hoveredDistrict.heatRiskScore || hoveredDistrict.heat_vulnerability_score || 0) > 48 
                        ? "text-yellow-400" 
                        : "text-emerald-500"
                    }`}>
                      {hoveredDistrict.heatRiskScore || hoveredDistrict.heat_vulnerability_score || 0} / 100
                    </span>
                  )}
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">LST:</span>
                  <span className="font-bold text-slate-100">
                    {hoveredDistrict.status === "Data unavailable" ? "Data unavailable" : `${hoveredDistrict.lst_current || hoveredDistrict.lst || "N/A"}°C`}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">NDVI:</span>
                  <span className="font-bold text-slate-100">
                    {hoveredDistrict.status === "Data unavailable" ? "Data unavailable" : (hoveredDistrict.ndvi !== undefined ? hoveredDistrict.ndvi : "N/A")}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">AQI:</span>
                  <span className="font-bold text-slate-100">
                    {hoveredDistrict.status === "Data unavailable" ? "Data unavailable" : `${hoveredDistrict.aqi !== undefined ? hoveredDistrict.aqi : "N/A"} AQI`}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">POPULATION DENSITY:</span>
                  <span className="font-bold text-slate-100">
                    {hoveredDistrict.status === "Data unavailable" ? "Data unavailable" : `${(hoveredDistrict.population_density || hoveredDistrict.populationDensity || 0).toLocaleString()}/km²`}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">BUILT-UP RATIO:</span>
                  <span className="font-bold text-slate-100">
                    {hoveredDistrict.status === "Data unavailable" ? "Data unavailable" : `${hoveredDistrict.impervious_surface !== undefined ? hoveredDistrict.impervious_surface : (hoveredDistrict.builtUpRatio !== undefined ? hoveredDistrict.builtUpRatio : 0)}%`}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">WATER COVERAGE:</span>
                  <span className="font-bold text-slate-100">
                    {hoveredDistrict.status === "Data unavailable" ? "Data unavailable" : `${hoveredDistrict.water_coverage !== undefined ? hoveredDistrict.water_coverage : (hoveredDistrict.waterBodiesCover !== undefined ? hoveredDistrict.waterBodiesCover : 0)}%`}
                  </span>
                </div>

                {isFlagged && (
                  <div className="bg-red-950/80 border border-red-800 text-red-400 text-[9px] p-1.5 rounded mt-1.5 font-mono leading-tight whitespace-pre-line">
                    ⚠️ FLAGGED POLYGON:
                    {!hoveredDistrict.districtName && "\n• Missing District Name"}
                    {!hoveredDistrict.stateName && "\n• Missing State Name"}
                    {(!hoveredDistrict.districtCode || hoveredDistrict.districtCode === "None" || hoveredDistrict.districtCode === "None") && "\n• Missing District Code"}
                  </div>
                )}

                {hoveredDistrict.status === "Data unavailable" && (
                  <div className="text-[9px] text-amber-500 font-mono border-t border-slate-800 pt-1.5 mt-1.5 leading-normal">
                    Status: Data unavailable (Missing telemetry synchronization for this satellite sector)
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Boundary Unavailable Banner Overlay */}
        {isBoundaryUnavailable && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center p-6 space-y-3 pointer-events-auto">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 max-w-sm shadow-lg text-center space-y-1">
              <span className="text-red-900 font-bold block text-sm tracking-wide uppercase">Boundary unavailable</span>
              <p className="text-red-600 text-[10px] font-mono">The requested Indian municipal boundaries could not be resolved from any cache or server. Re-trying connectivity link...</p>
            </div>
          </div>
        )}

        {/* Loading Spinner HUD */}
        {isGeojsonLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 space-y-4 pointer-events-auto text-white">
            <Cpu className="w-8 h-8 text-[#00C2FF] animate-spin" />
            <div className="text-center space-y-1.5">
              <span className="text-white font-extrabold block text-xs tracking-widest uppercase">INGESTING VECTOR BOUNDARY SHEETS</span>
              <p className="text-slate-300 text-[10px] max-w-sm animate-pulse font-mono">{signalStatus}</p>
            </div>
            <div className="w-40 h-1 bg-white/10 rounded overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-[#00C2FF] to-[#0099FF] animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
