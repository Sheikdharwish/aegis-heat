/**
 * Advanced normalization helper for Indian district/state mapping.
 * Matches:
 * 1. Unicode normalization
 * 2. Trim spaces
 * 3. Collapse multiple spaces to single spaces
 * 4. Lowercase conversion
 * 5. Remove punctuation only, preserving meaningful spaces
 */
export function normalizeString(str: any): string {
  if (str === null || str === undefined) return "";
  
  const s = String(str);
  return s
    .normalize("NFD")                             // Step 1: Unicode decomposition
    .replace(/[\u0300-\u036f]/g, "")             // Step 1: Strip diacritics
    .toLowerCase()                                // Step 4: Lowercase
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ") // Step 5: Replace punctuation with spaces
    .replace(/\s+/g, " ")                        // Step 3: Collapse multiple spaces to a single space
    .trim();                                      // Step 2: Trim leading/trailing whitespace
}
