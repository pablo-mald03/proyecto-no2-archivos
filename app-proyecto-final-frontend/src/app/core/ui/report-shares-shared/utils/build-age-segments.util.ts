import { AgeBucket } from "../types/age-bucket.model";
import { SegmentItem } from "../types/segment-item.model";
import { getAgeBucket, getAgeInDays } from "./age-bucket.util";
import { AGE_BUCKET_STYLES } from "./age-bucket-style.util";

const BUCKETS: AgeBucket[] = ['recent', 'resting', 'forgotten'];

//Counts the resources by age bucket
export function buildAgeSegments(dates: string[]): SegmentItem[] {
  const buckets = dates.map(date => getAgeBucket(getAgeInDays(date)));

  return BUCKETS.map(bucket => ({
    key: bucket,
    label: AGE_BUCKET_STYLES[bucket].label,
    count: buckets.filter(b => b === bucket).length,
    bgClass: AGE_BUCKET_STYLES[bucket].bg
  }));
}
