import * as fs from "fs";
import * as path from "path";

// Normalization function matching instructions perfectly:
// Lowercase, Remove spaces, Remove hyphens, Remove punctuation.
function normalizeName(name: string): string {
  if (!name) return "";
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function getCentroid(geometry: any): { lat: number; lng: number } {
  let latSum = 0;
  let lngSum = 0;
  let count = 0;

  if (!geometry || !geometry.coordinates) {
    return { lat: 20.0, lng: 78.0 };
  }

  const recurse = (coords: any) => {
    if (Array.isArray(coords[0])) {
      coords.forEach(recurse);
    } else if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      lngSum += coords[0];
      latSum += coords[1];
      count++;
    }
  };

  recurse(geometry.coordinates);

  if (count > 0) {
    return {
      lat: parseFloat((latSum / count).toFixed(4)),
      lng: parseFloat((lngSum / count).toFixed(4)),
    };
  }
  return { lat: 20.0, lng: 78.0 };
}

function buildRegistry() {
  const localGeojsonPath = path.join(process.cwd(), "public", "india_districts_simplified.geojson");
  if (!fs.existsSync(localGeojsonPath)) {
    console.error("GeoJSON file not found at", localGeojsonPath);
    return;
  }

  const parsed = JSON.parse(fs.readFileSync(localGeojsonPath, "utf8"));
  if (!parsed || !Array.isArray(parsed.features)) {
    console.error("Invalid GeoJSON format.");
    return;
  }

  const registry: any[] = [];
  let districtIndex = 1;

  parsed.features.forEach((feature: any) => {
    if (!feature || !feature.properties) return;
    const dtName = feature.properties.district;
    const stName = feature.properties.st_nm;

    if (!dtName || !stName) return;

    const stCode = feature.properties.st_code || "00";
    const dtCode = feature.properties.dt_code || "000";
    
    // Create stable and unique district code
    const districtCode = `IN-${stCode}-${dtCode}-${String(districtIndex).padStart(3, "0")}`;
    const centroid = getCentroid(feature.geometry);

    registry.push({
      districtCode,
      districtName: dtName,
      normalizedDistrictName: normalizeName(dtName),
      stateName: stName,
      latitude: centroid.lat,
      longitude: centroid.lng
    });

    districtIndex++;
  });

  const destPath = path.join(process.cwd(), "src", "services", "district_registry.json");
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(destPath, JSON.stringify(registry, null, 2), "utf8");
  console.log(`Successfully generated registry with ${registry.length} districts at ${destPath}`);
}

buildRegistry();
