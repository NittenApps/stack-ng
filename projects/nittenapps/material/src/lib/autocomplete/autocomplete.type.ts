import { ChangeDetectionStrategy, Component, OnInit, Type } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FieldTypeConfig, StackFieldConfig } from '@nittenapps/forms';
import { StackFieldSelectProps } from '@nittenapps/forms/select';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  isObservable,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
} from 'rxjs';

import { FieldType, StackFieldProps } from '../form-field';

interface AutocompleteProps extends StackFieldProps, StackFieldSelectProps {
  multiple?: boolean;
  selectAllOption?: string;
  disableOptionCentering?: boolean;
  typeaheadDebounceInterval?: number;
  displayWith: ((value: any) => string) | null;
  filterMethod?: (field: StackFieldConfig, term: string) => Observable<any[]>;
  panelClass?: string;
  optionSelected?: (field: StackFieldConfig, event?: any) => void;
  showOnFocus?: boolean;
}

export interface StackAutocompleteFieldConfig extends StackFieldConfig<AutocompleteProps> {
  type: 'autocomplete' | Type<StackFieldAutocomplete>;
}

@Component({
  selector: 'nas-field-mat-autocomplete',
  templateUrl: './autocomplete.type.html',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: false,
})
export class StackFieldAutocomplete extends FieldType<FieldTypeConfig<AutocompleteProps>> implements OnInit {
  filteredOptions$!: Observable<any[]>;

  private searchSubject$ = new Subject<string>();

  override defaultOptions = {
    props: {
      displayWith(value: any): string {
        if (value && typeof value === 'object') {
          return value.code + ' - ' + value.name;
        }
        return typeof value === 'string' ? value : '';
      },
    },
  };

  ngOnInit(): void {
    const control = this.formControl;

    if (!control) {
      console.error('formControl not found:', this.field.key);
      return;
    }

    const initialValue = control.value;
    if (initialValue) {
      this.searchSubject$.next(typeof initialValue === 'string' ? initialValue : '');
    }

    const rawOptions = this.props.options;
    const options$ = isObservable(rawOptions) ? rawOptions.pipe(shareReplay(1)) : of(rawOptions || []);

    if (this.props.filterMethod) {
      this.filteredOptions$ = this.searchSubject$.asObservable().pipe(
        debounceTime(this.props.typeaheadDebounceInterval || 300),
        distinctUntilChanged(),
        switchMap((term) => this.props.filterMethod!(this.field, term)),
        catchError((err) => {
          console.error('Error filtering options:', err);
          return of([]);
        }),
      );
      return;
    }

    this.filteredOptions$ = combineLatest([options$, this.searchSubject$.asObservable()]).pipe(
      map(([options, value]) => this._filter(options, value)),
      catchError((err) => {
        console.error('Error filtering options:', err);
        return of([]);
      }),
    );
  }

  protected onFocus(event: Event, trigger: any): void {
    if (this.props.readonly || this.formControl?.disabled || (!!this.props.filterMethod && !this.props.showOnFocus)) {
      return;
    }

    trigger.openPanel();

    const rawValue = this.formControl.value;
    if (rawValue && typeof rawValue === 'object') {
      this.searchSubject$.next('');
    } else {
      const inputEl = event.target as HTMLInputElement;
      this.searchSubject$.next(inputEl?.value || '');
    }
  }

  protected onInput($event: Event): void {
    const value = ($event.target as HTMLInputElement).value;
    this.searchSubject$.next(value);
  }

  protected optionSelected($event: MatAutocompleteSelectedEvent): void {
    this.props.optionSelected?.(this.field, $event.option.value);
  }

  private _filter(options: any[], value: any): any[] {
    if ((!options || !Array.isArray(options)) && !this.props.filterMethod) return [];

    if (!value || typeof value !== 'string') {
      return options;
    }

    const filterValue = value.toLowerCase().trim();
    if (!filterValue) {
      return options;
    }

    return options.filter((option) => {
      const formattedLabel = this.props.displayWith
        ? this.props.displayWith(option)
        : `${option.code || ''} ${option.name || ''}`;

      const labelMatch = formattedLabel.toLowerCase().includes(filterValue);
      const codeMatch = option.code ? String(option.code).toLowerCase().includes(filterValue) : false;
      const nameMatch = option.name ? String(option.name).toLowerCase().includes(filterValue) : false;

      return labelMatch || codeMatch || nameMatch;
    });
  }
}
