import { StorageUsageLevel } from "../types/storage-usage-level.model";

//Tailwind classes and label of each storage usage level
export const STORAGE_LEVEL_STYLES: Record<StorageUsageLevel, {
  label: string;
  stroke: string;
  text: string;
  bg: string;
  badge: string;
  gradient: string;
}> = {
  ok: {
    label: 'Normal',
    stroke: 'stroke-green-500',
    text: 'text-green-400',
    bg: 'bg-green-500',
    badge: 'bg-green-950/60 text-green-400',
    gradient: 'from-green-500 to-emerald-400'
  },
  warning: {
    label: 'Alto',
    stroke: 'stroke-yellow-500',
    text: 'text-yellow-400',
    bg: 'bg-yellow-500',
    badge: 'bg-yellow-950/60 text-yellow-400',
    gradient: 'from-yellow-500 to-amber-400'
  },
  critical: {
    label: 'Crítico',
    stroke: 'stroke-red-500',
    text: 'text-red-400',
    bg: 'bg-red-500',
    badge: 'bg-red-950/60 text-red-400',
    gradient: 'from-red-500 to-rose-400'
  }
};
