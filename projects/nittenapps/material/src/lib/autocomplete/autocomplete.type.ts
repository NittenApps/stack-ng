import { ChangeDetectionStrategy, Component, OnInit, Type } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FieldTypeConfig, StackFieldConfig } from '@nittenapps/forms';
import { StackFieldSelectProps } from '@nittenapps/forms/select';
import { debounceTime, map, Observable, of, Subject, switchMap } from 'rxjs';

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
/**
 * Tipo de campo con autocompletado y búsqueda incremental sobre opciones locales o remotas.
 * Se usa cuando el usuario debe seleccionar valores filtrando por texto.
 */
export class StackFieldAutocomplete extends FieldType<FieldTypeConfig<AutocompleteProps>> implements OnInit {
  filteredOptions?: Observable<any[]>;

  private searchSubject = new Subject<string>();

  override defaultOptions = {
    props: {
      displayWith(value: any): string {
        return value ? value.code + ' - ' + value.name : '';
      },
    },
  };

  ngOnInit(): void {
    this.filteredOptions = this.searchSubject.pipe(
      debounceTime(this.props.typeaheadDebounceInterval || 300),
      switchMap((term) => this.filterOptions(term)),
    );
    this.formControl.valueChanges.subscribe((value) => {
      if (typeof value !== 'string') {
        if (!value) {
          this.searchSubject.next('');
        } else if (value.code) {
          this.props.change?.(this.field, value);
        }
      }
    });
  }

  onKeyUp($event: KeyboardEvent): void {
    if (this.props.readonly) {
      return $event.preventDefault();
    }
    if (
      ($event.key.length === 1 || $event.key === 'Backspace' || $event.key === 'Delete') &&
      !$event.ctrlKey &&
      !$event.altKey &&
      !$event.metaKey
    ) {
      this.searchSubject.next(($event.target! as HTMLInputElement).value);
    }
  }

  optionSelected($event: MatAutocompleteSelectedEvent): void {
    this.props.optionSelected?.(this.field, $event.option.value);
  }

  private filterOptions(term: string): Observable<any[]> {
    if (!this.props.options && !this.props.filterMethod) {
      return of([]);
    }

    if (!term) {
      if (this.props.options instanceof Observable) {
        return this.props.options;
      }
      return of(this.props.options || []);
    }

    term = term.toLowerCase();
    if (this.props.filterMethod) {
      return this.props.filterMethod(this.field, term);
    }
    if (this.props.options instanceof Observable) {
      return this.props.options.pipe(
        map((options: any[]) =>
          options.filter(
            (option) => option.code?.toLowerCase().includes(term) || option.name?.toLowerCase().includes(term),
          ),
        ),
      );
    }
    return of(
      this.props.options!.filter(
        (option) => option.code?.toLowerCase().includes(term) || option.name?.toLowerCase().includes(term),
      ),
    );
  }
}
