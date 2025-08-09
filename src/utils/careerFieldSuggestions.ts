import { CAREER_FIELDS, CareerFieldKey } from '../services';

interface Career {
  id: string;
  title: string;
  description: string;
  field?: CareerFieldKey;
}

export function suggestCareerField(career: Career): CareerFieldKey | null {
  const suggestions = suggestCareerFields(career);
  return suggestions.length > 0 ? suggestions[0] : null;
}

export function suggestCareerFields(career: Career): CareerFieldKey[] {
  const titleLower = career.title.toLowerCase();
  const descriptionLower = career.description.toLowerCase();
  
  // Find all matching fields based on keywords
  const fieldMatches: Array<{ fieldKey: CareerFieldKey; matches: number }> = [];
  
  for (const [fieldKey, fieldInfo] of Object.entries(CAREER_FIELDS) as [CareerFieldKey, any][]) {
    let matches = 0;
    
    for (const keyword of fieldInfo.keywords) {
      if (titleLower.includes(keyword) || descriptionLower.includes(keyword)) {
        matches++;
      }
    }
    
    if (matches > 0) {
      fieldMatches.push({ fieldKey, matches });
    }
  }
  
  // Sort by number of matches (descending) and return field keys
  return fieldMatches
    .sort((a, b) => b.matches - a.matches)
    .filter(field => field.matches >= 1) // Only include fields with at least 1 match
    .slice(0, 3) // Limit to top 3 suggestions
    .map(field => field.fieldKey);
}

export function getFieldSuggestionReason(career: Career, fieldKey: CareerFieldKey): string[] {
  const titleLower = career.title.toLowerCase();
  const descriptionLower = career.description.toLowerCase();
  const fieldInfo = CAREER_FIELDS[fieldKey];
  const matchingKeywords: string[] = [];
  
  for (const keyword of fieldInfo.keywords) {
    if (titleLower.includes(keyword) || descriptionLower.includes(keyword)) {
      matchingKeywords.push(keyword);
    }
  }
  
  return matchingKeywords;
}