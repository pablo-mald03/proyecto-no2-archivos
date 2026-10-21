import { SegmentItem } from "../types/segment-item.model";
import { getAccessLevelStyle } from "./access-level-style.util";

//Counts the shares by access level
export function buildAccessSegments(accessLevels: string[]): SegmentItem[] {
  const counts = new Map<string, number>();

  for (const level of accessLevels) {
    counts.set(level, (counts.get(level) ?? 0) + 1);
  }

  return [...counts.entries()].map(([level, count]) => {
    const style = getAccessLevelStyle(level);
    return { key: level, label: style.label, count, bgClass: style.bg };
  });
}
