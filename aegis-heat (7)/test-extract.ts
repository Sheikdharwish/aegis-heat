import * as fs from 'fs';
import * as path from 'path';

const localPath = path.join(process.cwd(), 'public', 'india_districts_simplified.geojson');
const parsed = JSON.parse(fs.readFileSync(localPath, 'utf8'));

const codeSet = new Set<string>();
const nameStateSet = new Set<string>();
let missingCode = 0;
let duplicates = 0;

parsed.features.forEach((f: any, idx: number) => {
  if (!f || !f.properties) return;
  const dName = f.properties.district;
  const sName = f.properties.st_nm;
  const code = f.properties.dt_code || '';
  if (!dName || !sName) return;

  if (!code) missingCode++;
  else if (codeSet.has(code)) duplicates++;
  else codeSet.add(code);

  nameStateSet.add(`${dName.toLowerCase()}||${sName.toLowerCase()}`);
});

console.log('Total features with valid District/State:', nameStateSet.size);
console.log('Missing codes:', missingCode);
console.log('Duplicate codes:', duplicates);
