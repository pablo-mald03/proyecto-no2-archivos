import { AgeBucket } from "../types/age-bucket.model";

//Tailwind classes and label of each age bucket
export const AGE_BUCKET_STYLES: Record<AgeBucket, {
  label: string;
  card: string;
  badge: string;
  icon: string;
  bg: string;
}> = {
  recent: {
    label: 'Reciente',
    card: 'border-green-900/60',
    badge: 'bg-green-950/60 text-green-400',
    icon: 'bg-green-950/40 text-green-400',
    bg: 'bg-green-500'
  },
  resting: {
    label: 'En reposo',
    card: 'border-yellow-900/60',
    badge: 'bg-yellow-950/60 text-yellow-400',
    icon: 'bg-yellow-950/40 text-yellow-400',
    bg: 'bg-yellow-500'
  },
  forgotten: {
    label: 'Olvidado',
    card: 'border-sky-900/60',
    badge: 'bg-sky-950/60 text-sky-300',
    icon: 'bg-sky-950/40 text-sky-300',
    bg: 'bg-sky-500'
  }
};
