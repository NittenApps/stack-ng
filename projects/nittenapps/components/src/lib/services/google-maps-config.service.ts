import { InjectionToken } from '@angular/core';
import { GoogleMapsConfig } from '../types/google-maps-config';

/** Injection token to configure the loading of the Google Maps SDK. */
export const GOOGLE_MAPS_CONFIG = new InjectionToken<GoogleMapsConfig>('GoogleMapsConfig');
