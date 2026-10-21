/* View model of one podium entry (decouples the podium from the endpoint response) */
export interface PodiumEntry {
  id: string;
  name: string;
  username: string;
  email: string;
  value: number;
  valueLabel: string;
  secondaryLabel?: string;
  progress?: number;
}
