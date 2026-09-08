import { InjectionToken } from '@angular/core';
import { GoogleMapsConfig } from '../types/google-maps-config';

/**
 * Injection token used to provide Google Maps configuration throughout the application.
 */
export const GOOGLE_MAPS_CONFIG = new InjectionToken<GoogleMapsConfig>('GoogleMapsConfig');
