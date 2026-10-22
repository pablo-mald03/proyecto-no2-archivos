//Colors used by the charts of the folders reports
export const SPACE_PALETTE = [
  '#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#fb7185',
  '#22d3ee', '#f472b6', '#a3e635', '#818cf8', '#fb923c'
];

//Color for an index (cycles when there are more items than colors)
export function paletteColor(index: number): string {
  return SPACE_PALETTE[index % SPACE_PALETTE.length];
}
