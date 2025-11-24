export function ensureHeroRecord(hero: Record<string, any> | undefined, fieldName: string): Record<string, any> | null {
  if (!hero || typeof hero !== 'object') {
    return null;
  }
  const field = hero[fieldName];
  if (!field || typeof field !== 'object') {
    hero[fieldName] = {};
  }
  return hero[fieldName] as Record<string, any>;
}

export function removeHeroRecordEntry(hero: Record<string, any> | undefined, fieldName: string, key: string | undefined) {
  if (!key) return false;
  const record = ensureHeroRecord(hero, fieldName);
  if (!record) return false;
  if (Object.prototype.hasOwnProperty.call(record, key)) {
    delete record[key];
    return true;
  }
  return false;
}
