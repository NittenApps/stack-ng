import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import PlaceResult = google.maps.places.PlaceResult;

@Component({
    selector: 'nas-place-autocomplete',
    imports: [FormsModule, MatInputModule],
    templateUrl: './place-autocomplete.component.html'
})
export class PlaceAutocompleteComponent implements AfterViewInit, OnDestroy {
  @ViewChild('addressInput') addressInput!: ElementRef;

  @Input()
  set address(address: string | undefined) {
    this._address = address;
  }

  @Output() onAutocompleteSelected: EventEmitter<PlaceResult> = new EventEmitter();
  @Output() onLocationSelected: EventEmitter<{ lat: number; lng: number }> = new EventEmitter();

  _address?: string;

  private autocomplete?: google.maps.places.Autocomplete;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.importPlacesLibrary();
  }

  ngOnDestroy(): void {
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
  }

  private async importPlacesLibrary() {
    await google.maps.importLibrary('places');

    this.getPlaceAutocomplete();
  }

  private getPlaceAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(this.addressInput.nativeElement, {
      componentRestrictions: { country: 'MX' },
      types: ['geocode'],
      fields: ['address_components', 'geometry'],
    });

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place: PlaceResult = this.autocomplete!.getPlace();

        if (!place.geometry?.location) {
          return;
        }
        this.onAutocompleteSelected.emit(place);
        this.onLocationSelected.emit({ lat: place.geometry?.location?.lat(), lng: place.geometry?.location?.lng() });
      });
    });
  }
}
