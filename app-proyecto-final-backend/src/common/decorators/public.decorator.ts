import { SetMetadata } from '@nestjs/common';

//Decorator to mark as public the endpoint
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);