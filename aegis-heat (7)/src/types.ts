export interface DistrictHeatModel {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  
  // Earth Observation Metrics (Landsat-8, ECOSTRESS, Sentinel-2, ERA5)
  lst_current: number;       // Land Surface Temperature (°C)
  lst_avg_historical: number; // Historical LST Average (°C)
  ndvi: number;              // Normalized Difference Vegetation Index (-1 to 1)
  albedo: number;            // Surface Reflectance (0 to 1)
  aqi: number;               // Air Quality Index (CPCB)
  population_density: number;// people per km²
  water_coverage: number;    // percentage of area (0 to 100)
  impervious_surface: number;// percentage built-up area (0 to 100)
  canopy_cover: number;      // percentage tree canopy (0 to 100)
  wet_bulb_temp: number;     // wet-bulb temperature (°C) (heat stress index)
  
  // Physics-Informed Estimates (Surface Energy Balance & Canopy Microclimate)
  surface_energy_flux: {
    net_radiation: number;  // W/m²
    sensible_heat: number;  // W/m²
    latent_heat: number;    // W/m²
    ground_heat: number;    // W/m²
  };
  urban_heat_island_intensity: number; // UHI Delta (°C)
  heat_vulnerability_score: number;   // 0 to 100 Risk Rating
  
  // Drivers Contribution (for Physics analysis, total = 100%)
  drivers: {
    solar_radiation: number;
    albedo_deficit: number;
    vegetation_scarcity: number;
    anthropogenic_emissions: number;
  };

  // --- STRICT DISTRICT SCHEMALS (NEW IN-SPECIFICATION SCHEMAS) ---
  districtCode: string;
  districtName: string;
  stateName: string;
  latitude: number;
  longitude: number;
  lst: number;
  humidity: number;
  windSpeed: number;
  population: number;
  populationDensity: number;
  builtUpRatio: number;
  waterBodiesCover: number;
  heatRiskScore: number;
  priorityLevel: "Critical" | "High" | "Moderate" | "Safe" | "Unavailable";
  riskContributors: {
    vegetationLoss: number;
    imperviousSurface: number;
    populationExposure: number;
    aqiImpact: number;
    waterScarcity: number;
  };
  coolingRecommendations: string[];
  provenance: {
    lst_source: string;
    ndvi_source: string;
    aqi_source: string;
    last_pass: string;
  };
  status?: string;
}

export interface SatelliteProvenance {
  id: string;
  sensor: string;
  platform: string;
  last_pass: string;
  resolution_spatial: string;
  resolution_temporal: string;
  gcp_ingestion_timestamp: string;
  calibration_formula: string;
  data_completeness_percent: number;
  governance_hash: string;
}

export interface CoolingIntervention {
  id: string;
  name: string;
  unit: string;
  unit_cost_inr: number;
  temperature_reduction_per_unit: number; // ΔT reduction in microclimate
  area_covered_sqm_per_unit: number;
  population_benefited_per_unit: number;
  scope: "cool_roof" | "green_roof" | "tree_plantation" | "urban_parks" | "water_restoration" | "cool_pavement";
}

export interface ScenarioDefinition {
  district_id: string;
  selected_interventions: {
    intervention_id: string;
    target_coverage_units: number;
  }[];
  custom_albedo_target?: number;
  custom_vegetation_increase_pct?: number;
}

export interface SimulationResult {
  district_id: string;
  district_name: string;
  total_cost_inr: number;
  temperature_reduction_celsius: number;
  population_benefited: number;
  new_lst_estimate: number;
  new_ndvi_estimate: number;
  new_vulnerability_score: number;
  intervention_breakdown: {
    name: string;
    units: number;
    cost_inr: number;
    temp_impact_celsius: number;
    people_impacted: number;
  }[];
  validation_code: string; // Integrity verification token
}

export interface WeatherForecastDay {
  date: string;
  predicted_lst: number;
  predicted_air_temp: number;
  predicted_wet_bulb: number;
  aqi_forecast: number;
  heat_wave_risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  confidence_interval_low: number;
  confidence_interval_high: number;
}

export interface ClimateAuditRecord {
  timestamp: string;
  module: string;
  integrity_status: "SUCCESS" | "WARN" | "FAILED";
  check_type: string;
  r_squared?: number;
  rmse?: number;
  mae?: number;
  assertion_details: string;
  operator_sig: string;
}

export interface ThermalAlert {
  id: string;
  district_id: string;
  district_name: string;
  sensor_source: string;
  anomaly_celsius: number;
  timestamp: string;
  risk_type: "HIGH_WET_BULB_DEVIATION" | "ACUTE_LST_ANOMALY" | "URGENT_SENSORY_OUTLIER";
  level: "WARNING" | "CRITICAL" | "EMERGENCY";
  vulnerable_wards: string[];
}

export interface ServerDashboardState {
  system_mode: "PipelineGenerated" | "OfflineDemonstration" | "Unavailable";
  last_pipeline_run: string;
  master_districts_count: number;
  critical_alerts_count: number;
  national_vulnerability_index: number;
  average_ndvi: number;
  average_lst: number;
  sensor_freshness: string;
}
