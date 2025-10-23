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
}

export interface StackAutocompleteFieldConfig extends StackFieldConfig<AutocompleteProps> {
  type: 'autocomplete' | Type<StackFieldAutocomplete>;
}

@Component({
  selector: 'nas-field-mat-autocomplete',
  templateUrl: './autocomplete.type.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
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
      switchMap((term) => this.filterOptions(term))
    );
    this.formControl.valueChanges.subscribe((value) => {
      if (typeof value !== 'string') {
        if (!value) {
          this.searchSubject.next('');
        }
      }
    });
  }

  onKeyUp(event: KeyboardEvent): void {
    if (this.props.readonly) {
      return event.preventDefault();
    }
    this.searchSubject.next((event.target! as HTMLInputElement).value);
  }

  optionSelected($event: MatAutocompleteSelectedEvent): void {
    this.props.change?.(this.field, $event.option);
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
            (option) => option.code?.toLowerCase().includes(term) || option.name?.toLowerCase().includes(term)
          )
        )
      );
    }
    return of(
      this.props.options!.filter(
        (option) => option.code?.toLowerCase().includes(term) || option.name?.toLowerCase().includes(term)
      )
    );
  }
}
