import { normalizeString } from "./normalization";
import districtRegistry from "./district_registry.json";
import districtAliases from "./district_aliases.json";
import { DistrictHeatModel } from "../types";

export interface LookupMaps {
  registryByDistrictCode: Map<string, any>;
  registryByLGDCode: Map<string, any>;
  registryByNormalizedName: Map<string, any>;
  registryByAlias: Map<string, any>;
  datasetByDistrictCode: Map<string, DistrictHeatModel>;
  datasetByNormalizedName: Map<string, DistrictHeatModel>;
}

export interface MatchingResult {
  registryEntry: any | null;
  datasetEntry: DistrictHeatModel | null;
  confidence: number;
  method: string;
  isMatch: boolean;
}

/**
 * Build the single source-of-truth lookup maps for O(1) matching.
 */
export function buildLookupMaps(districts: DistrictHeatModel[]): LookupMaps {
  const registryByDistrictCode = new Map<string, any>();
  const registryByLGDCode = new Map<string, any>();
  const registryByNormalizedName = new Map<string, any>();
  const registryByAlias = new Map<string, any>();
  const datasetByDistrictCode = new Map<string, DistrictHeatModel>();
  const datasetByNormalizedName = new Map<string, DistrictHeatModel>();

  // 1. Populate Registry maps
  (districtRegistry as any[]).forEach((entry) => {
    const code = entry.districtCode;
    const normName = normalizeString(entry.districtName);
    const stateNorm = normalizeString(entry.stateName);

    if (code) {
      registryByDistrictCode.set(code, entry);
      
      const parts = code.split("-");
      if (parts.length >= 3) {
        const stCode = parts[1];
        const dtCode = parts[2];
        if (dtCode !== "0" && dtCode !== "00" && dtCode !== "000") {
          registryByLGDCode.set(`${stCode}-${dtCode}`, entry);
        }
      }
    }

    if (normName) {
      registryByNormalizedName.set(`${normName}||${stateNorm}`, entry);
      if (!registryByNormalizedName.has(normName)) {
        registryByNormalizedName.set(normName, entry);
      }
    }
  });

  // 2. Populate Alias maps
  Object.entries(districtAliases).forEach(([aliasKey, targetValue]) => {
    const normAlias = normalizeString(aliasKey);
    const normTarget = normalizeString(targetValue);
    
    // Find the registry entry that corresponds to the target name
    const matchedReg = (districtRegistry as any[]).find(
      (entry) => normalizeString(entry.districtName) === normTarget
    );
    if (matchedReg) {
      registryByAlias.set(normAlias, matchedReg);
    }
  });

  // 3. Populate Dataset maps
  districts.forEach((d) => {
    const code = d.id || d.districtCode;
    const normName = normalizeString(d.districtName || d.name);
    const normState = normalizeString(d.stateName || d.state);

    if (code) {
      datasetByDistrictCode.set(code, d);
    }
    if (normName) {
      datasetByNormalizedName.set(`${normName}||${normState}`, d);
      if (!datasetByNormalizedName.has(normName)) {
        datasetByNormalizedName.set(normName, d);
      }
    }
  });

  return {
    registryByDistrictCode,
    registryByLGDCode,
    registryByNormalizedName,
    registryByAlias,
    datasetByDistrictCode,
    datasetByNormalizedName,
  };
}

/**
 * Match a GeoJSON feature to the Registry and Dataset using O(1) maps & Priority.
 */
export function matchFeature(
  props: any,
  maps: LookupMaps
): MatchingResult {
  const {
    registryByDistrictCode,
    registryByLGDCode,
    registryByNormalizedName,
    registryByAlias,
    datasetByDistrictCode,
    datasetByNormalizedName,
  } = maps;

  // Extractor functions
  const getFeatureDistrictName = (p: any): string => {
    if (!p) return "";
    const nameKeys = ["district", "dtname", "districtName", "DISTRICT", "name", "NAME_2", "NAME", "District"];
    for (const key of nameKeys) {
      if (p[key] !== undefined && p[key] !== null) return String(p[key]);
    }
    return "";
  };

  const getFeatureStateName = (p: any): string => {
    if (!p) return "";
    const stateKeys = ["st_nm", "stname", "state", "STATE", "NAME_1", "State", "st_code"];
    for (const key of stateKeys) {
      if (p[key] !== undefined && p[key] !== null) return String(p[key]);
    }
    return "";
  };

  const rawDist = getFeatureDistrictName(props);
  const rawState = getFeatureStateName(props);
  const normDist = normalizeString(rawDist);
  const normState = normalizeString(rawState);

  // 1. District Code Match (Confidence = 100%)
  const codeKeys = ["districtCode", "district_code", "dt_code_full", "id", "fallbackId"];
  for (const key of codeKeys) {
    const code = props[key];
    if (code && typeof code === "string" && registryByDistrictCode.has(code)) {
      const registryEntry = registryByDistrictCode.get(code);
      const datasetEntry = datasetByDistrictCode.get(registryEntry.districtCode) || null;
      return {
        registryEntry,
        datasetEntry,
        confidence: 100,
        method: "District Code Match",
        isMatch: true,
      };
    }
  }

  // 2. LGD Match (Confidence = 99%)
  const stCode = props.st_code !== undefined ? String(props.st_code).trim() : null;
  const dtCode = props.dt_code !== undefined ? String(props.dt_code).trim() : null;
  if (stCode && dtCode && dtCode !== "0" && dtCode !== "00" && dtCode !== "000") {
    const lgdKey = `${normalizeString(stCode)}-${normalizeString(dtCode)}`;
    if (registryByLGDCode.has(lgdKey)) {
      const registryEntry = registryByLGDCode.get(lgdKey);
      const datasetEntry = datasetByDistrictCode.get(registryEntry.districtCode) || null;
      return {
        registryEntry,
        datasetEntry,
        confidence: 99,
        method: "LGD Match",
        isMatch: true,
      };
    }
  }

  // 3. Census Code Match (Confidence = 99%)
  const censusCode = props.censuscode || props.census_code || props.code;
  if (censusCode) {
    const cleanCensus = String(censusCode).trim();
    const registryEntry = (districtRegistry as any[]).find(
      (entry) => entry.censusCode === cleanCensus || entry.districtCode.endsWith(cleanCensus)
    );
    if (registryEntry) {
      const datasetEntry = datasetByDistrictCode.get(registryEntry.districtCode) || null;
      return {
        registryEntry,
        datasetEntry,
        confidence: 99,
        method: "Census Code Match",
        isMatch: true,
      };
    }
  }

  // 4. Alias Match (Confidence = 95%)
  if (normDist && registryByAlias.has(normDist)) {
    const registryEntry = registryByAlias.get(normDist);
    const datasetEntry = datasetByDistrictCode.get(registryEntry.districtCode) || null;
    return {
      registryEntry,
      datasetEntry,
      confidence: 95,
      method: "Alias Match",
      isMatch: true,
    };
  }

  // 5. Normalized District Name Match (Confidence = 90%)
  if (normDist) {
    const key = `${normDist}||${normState}`;
    if (registryByNormalizedName.has(key)) {
      const registryEntry = registryByNormalizedName.get(key);
      const datasetEntry = datasetByDistrictCode.get(registryEntry.districtCode) || null;
      return {
        registryEntry,
        datasetEntry,
        confidence: 90,
        method: "Normalized Name Match",
        isMatch: true,
      };
    }

    if (registryByNormalizedName.has(normDist)) {
      const registryEntry = registryByNormalizedName.get(normDist);
      const datasetEntry = datasetByDistrictCode.get(registryEntry.districtCode) || null;
      return {
        registryEntry,
        datasetEntry,
        confidence: 90,
        method: "Normalized Name Match",
        isMatch: true,
      };
    }
  }

  // 6. District Name + State Match (Confidence = 85%)
  if (normDist && normState) {
    const registryEntry = (districtRegistry as any[]).find((entry) => {
      const regDist = normalizeString(entry.districtName);
      const regState = normalizeString(entry.stateName);
      return regDist === normDist && regState === normState;
    });
    if (registryEntry) {
      const datasetEntry = datasetByDistrictCode.get(registryEntry.districtCode) || null;
      return {
        registryEntry,
        datasetEntry,
        confidence: 85,
        method: "District + State Match",
        isMatch: true,
      };
    }
  }

  // No Match
  return {
    registryEntry: null,
    datasetEntry: null,
    confidence: 0,
    method: "None",
    isMatch: false,
  };
}
