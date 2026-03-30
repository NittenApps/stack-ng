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
/**
 * Componente de autocompletado de direcciones usando Google Places.
 *
 * Carga el elemento nativo de autocompletado, permite establecer una dirección inicial
 * y emite tanto el lugar seleccionado como su ubicación.
 */
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
      componentRestrictions: { country: 'MX' },
      types: ['geocode'],
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

  /*async ngAfterViewInit(): Promise<void> {
    const googleMaps = await this.googleMapsService.getGoogleMaps();
    await this.importPlacesLibrary(googleMaps);
    this.getPlaceAutocomplete(googleMaps);
  }

  ngOnDestroy(): void {
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
  }

  private async importPlacesLibrary(maps: typeof google.maps): Promise<void> {
    await maps.importLibrary('places');
  }

  private getPlaceAutocomplete(maps: typeof google.maps): void {
    this.autocomplete = new maps.places.Autocomplete(this.addressInput.nativeElement, {
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
  }*/
}
