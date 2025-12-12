import { Component, Inject } from '@angular/core';
import { GoogleMapsModule, MapGeocoder } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PlaceAutocompleteComponent } from '../place-autocomplete/place-autocomplete.component';

import PlaceResult = google.maps.places.PlaceResult;

@Component({
    selector: 'nas-select-address',
    imports: [GoogleMapsModule, MatButtonModule, MatDialogModule, PlaceAutocompleteComponent],
    templateUrl: './select-address.component.html'
})
export class SelectAddressComponent {
  address?: string;
  center: google.maps.LatLng;
  mapOptions: google.maps.MapOptions;
  markerPosition?: google.maps.LatLng;
  markerOptions: google.maps.marker.AdvancedMarkerElementOptions;
  place?: PlaceResult;
  zoom: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private geocoder: MapGeocoder) {
    this.mapOptions = { mapId: data.mapId };
    this.markerPosition = data.markerPosition;
    this.center = data.markerPosition || data.center || { lat: 23.634501, lng: -102.552784 };
    this.zoom = data.zoom || 5;
    this.markerOptions = { gmpDraggable: !!data.editable };
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

  placeSelected($event: PlaceResult): void {
    this.place = $event;
  }
}
