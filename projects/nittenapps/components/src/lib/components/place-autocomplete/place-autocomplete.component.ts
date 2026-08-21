import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  OutputEmitterRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import LatLng = google.maps.LatLng;
import Place = google.maps.places.Place;
import { GoogleMapsService } from '../../services';

@Component({
  selector: 'nas-place-autocomplete',
  imports: [FormsModule, MatInputModule],
  templateUrl: './place-autocomplete.component.html',
})
export class PlaceAutocompleteComponent implements OnInit {
  address = input<string | undefined>(undefined);
  readonly addressGroupContainer = viewChild<ElementRef<HTMLDivElement>>('addressGroupContainer');

  onAutocompleteSelected: OutputEmitterRef<any> = output<any>();
  onLocationSelected: OutputEmitterRef<LatLng> = output<LatLng>();

  private addressInput?: HTMLElement;
  private readonly googleMapsService = inject(GoogleMapsService);
  private placeAutocomplete?: google.maps.places.PlaceAutocompleteElement;

  constructor() {
    effect(() => {
      const address = this.address();
      if (!address) {
        return;
      }
      if (!this.addressInput) {
        this.addressInput = this.findAddressInput(this.addressGroupContainer()!.nativeElement);
      }
      (this.addressInput! as any).value = address || '';
    });
  }

  async ngOnInit(): Promise<void> {
    const maps = await this.googleMapsService.getGoogleMaps();
    this.placeAutocomplete = new maps.places.PlaceAutocompleteElement({
      includedRegionCodes: ['mx'],
      requestedLanguage: 'es-419',
      requestedRegion: 'mx',
    });
    this.placeAutocomplete.name = 'address';

    this.addressGroupContainer()?.nativeElement.appendChild(this.placeAutocomplete);

    this.placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }: any) => {
      const place: Place = placePrediction.toPlace();
      await place.fetchFields({ fields: ['addressComponents', 'location'] });
      if (!place.location) {
        return;
      }

      this.onLocationSelected.emit(place.location);
      this.onAutocompleteSelected.emit(place.toJSON());
    });
  }

  private findAddressInput(element: HTMLDivElement): HTMLElement | undefined {
    const inputs = document.getElementsByName('address');
    let inputElement: HTMLElement | undefined;
    inputs.forEach((i: HTMLElement) => {
      if (i.tagName === 'GMP-PLACE-AUTOCOMPLETE') {
        inputElement = i;
      }
    });
    return inputElement;
  }
}
