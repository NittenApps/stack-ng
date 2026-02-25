import { InjectionToken } from '@angular/core';
import { GoogleMapsConfig } from '../types/google-maps-config';

export const GOOGLE_MAPS_CONFIG = new InjectionToken<GoogleMapsConfig>('GoogleMapsConfig');