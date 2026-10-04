import { IconType } from '@ng-icons/core';

//Principal drive nav option model
export interface DriveNavOption {
  label: string;
  route: string;
  icon: IconType;
  permission?: string;
}