import { AgeBucket } from "../types/age-bucket.model";

const DAY_MS = 86_400_000;

//Days elapsed since a date
export function getAgeInDays(date: string, now: number = Date.now()): number {
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? 0 : Math.max(0, Math.floor((now - time) / DAY_MS));
}

//Bucket of a resource according to its age in days
export function getAgeBucket(days: number): AgeBucket {
  if (days < 30) return 'recent';
  if (days <= 180) return 'resting';
  return 'forgotten';
}

//Relative age label (ej. hace 3 meses)
export function formatRelativeAge(days: number): string {
  if (days < 1) return 'hoy';
  if (days < 2) return 'ayer';
  if (days < 30) return `hace ${days} días`;

  if (days < 365) {
    const months = Math.floor(days / 30);
    return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  const years = Math.floor(days / 365);
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
}
