import { Inject, Injectable } from '@angular/core';
import { GoogleMapsConfig } from '../types';
import { GOOGLE_MAPS_CONFIG } from './google-maps-config.service';

@Injectable({ providedIn: 'root' })
export class GoogleMapsService {
  private static googleMapsPromise: Promise<typeof google.maps> | null = null;
  private static readonly CALLBACK_NAME = 'initGoogleMaps';
  private static readonly SCRIPT_ID = 'google-maps-js-script';

  constructor(@Inject(GOOGLE_MAPS_CONFIG) private config: GoogleMapsConfig) {}

  public getGoogleMaps(): Promise<typeof google.maps> {
    if (GoogleMapsService.googleMapsPromise) {
      return GoogleMapsService.googleMapsPromise;
    }

    const existingScript = document.getElementById(GoogleMapsService.SCRIPT_ID);
    if (existingScript) {
      return this.loadGoogleMaps();
    }

    return this.createGoogleMapsScript();
  }

  private loadGoogleMaps(): Promise<typeof google.maps> {
    return new Promise((resolve, reject) => {
      if ((window as any).google?.maps) {
        return resolve((window as any).google.maps);
      }

      (window as any)[GoogleMapsService.CALLBACK_NAME] = () => resolve((window as any).google.maps);

      const script = document.getElementById(GoogleMapsService.SCRIPT_ID) as HTMLScriptElement;
      script.onerror = reject;
    });
  }

  private buildScriptUrl(): string {
    const params = new URLSearchParams({
      v: 'weekly',
      key: this.config.apiKey,
      callback: GoogleMapsService.CALLBACK_NAME,
      libraries: this.config.libraries?.join(',') || '',
      language: this.config.language || 'es',
      region: this.config.region || 'MX',
      loading: 'async',
    });
    return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
  }

  private createGoogleMapsScript(): Promise<typeof google.maps> {
    GoogleMapsService.googleMapsPromise = new Promise((resolve, reject) => {
      (window as any)[GoogleMapsService.CALLBACK_NAME] = () => resolve((window as any).google.maps);

      const script = document.createElement('script');
      script.id = GoogleMapsService.SCRIPT_ID;
      script.src = this.buildScriptUrl();
      script.async = true;
      script.defer = true;
      script.onerror = (error: any) => reject(error);

      document.body.appendChild(script);
    });

    return GoogleMapsService.googleMapsPromise;
  }
}
