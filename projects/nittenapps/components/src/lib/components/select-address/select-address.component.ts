import { Component, inject, Inject, OnInit } from '@angular/core';
import { GoogleMapsModule, MapGeocoder } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { GoogleMapsService } from '../../services';
import { PlaceAutocompleteComponent } from '../place-autocomplete/place-autocomplete.component';

/**
 * Address autocomplete component using Google Places.
 *
 * Allows setting an initial address and emits the selected place
 * and location.
 */
@Component({
  selector: 'nas-select-address',
  imports: [GoogleMapsModule, MatButtonModule, MatDialogModule, PlaceAutocompleteComponent],
  templateUrl: './select-address.component.html',
})
export class SelectAddressComponent implements OnInit {
  apiLoaded = false;
  address?: string;
  center: google.maps.LatLng;
  mapOptions: google.maps.MapOptions;
  markerPosition?: google.maps.LatLng;
  markerOptions: google.maps.marker.AdvancedMarkerElementOptions;
  place?: any;
  zoom: number;

  private readonly googleMapsService = inject(GoogleMapsService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private geocoder: MapGeocoder,
  ) {
    this.mapOptions = { mapId: data.mapId };
    this.markerPosition = data.markerPosition;
    this.center = data.markerPosition || data.center || { lat: 23.634501, lng: -102.552784 };
    this.zoom = data.zoom || 5;
    this.markerOptions = { gmpDraggable: !!data.editable };
  }

  async ngOnInit(): Promise<void> {
    const maps = await this.googleMapsService.getGoogleMaps();
    this.apiLoaded = true;
  }

  dragEnd($event: google.maps.MapMouseEvent): void {
    this.geocoder.geocode({ location: $event.latLng }).subscribe(({ results }) => {
      if (results.length > 0) {
        this.address = results[0].formatted_address;
        this.place = results[0];
      }
    });
  }

  locationSelected($event: any): void {
    this.center = $event;
    this.zoom = 17;
    this.markerPosition = $event;
  }

  placeSelected($event: any): void {
    this.place = $event;
  }
}
