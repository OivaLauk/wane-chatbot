export function searchPersonalitiesByName(personalities, query) {
  if (!query || query.trim() === '') {
    return { ...personalities };
  }
  
  const normalizedQuery = query.trim().toLowerCase();
  const results = {};
  
  for (const [key, personality] of Object.entries(personalities)) {
    if (personality.name.toLowerCase().includes(normalizedQuery)) {
      results[key] = personality;
    }
  }
  
  return results;
}

export function filterPersonalities(personalities, predicateFn) {
  if (typeof predicateFn !== 'function') {
    return { ...personalities };
  }
  
  const results = {};
  
  for (const [key, personality] of Object.entries(personalities)) {
    if (predicateFn(personality, key)) {
      results[key] = personality;
    }
  }
  
  return results;
}

export function sortPersonalitiesByName(personalities, ascending = true) {
  const sortedEntries = Object.entries(personalities).sort(([, a], [, b]) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
  
  return Object.fromEntries(sortedEntries);
}