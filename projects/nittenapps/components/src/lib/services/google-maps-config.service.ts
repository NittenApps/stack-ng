import { InjectionToken } from '@angular/core';
import { GoogleMapsConfig } from '../types/google-maps-config';

/** Token de inyección para configurar la carga del SDK de Google Maps. */
export const GOOGLE_MAPS_CONFIG = new InjectionToken<GoogleMapsConfig>('GoogleMapsConfig');
