import { AsyncPipe, DatePipe, DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { NAS_API_CONFIG } from '@nittenapps/api';
import { isEqual } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { ListDataSource } from '../../datasources/list.datasource';
import { AsyncEvent, Column, Filters, TableRequestParams } from '../../types';

/**
 * Displays a configurable, paginated, sortable, and filterable data table.
 *
 * The component loads records through {@link ListDataSource}, persists the
 * table state by activity, and can optionally refresh its data automatically.
 *
 * @typeParam T The type of records displayed by the table.
 */
@Component({
  selector: 'nas-list',
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    FaIconComponent,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    NgClass,
    PercentPipe,
  ],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent<T> implements OnDestroy, OnInit {
  private readonly refreshDataSource$ = new Subject<AsyncEvent>();

  /** Identifier used by the data source to load and persist this list's state. */
  activity = input.required<string>();
  /** Refresh interval in milliseconds; zero disables automatic refreshing. */
  autoRefresh = input(0, { transform: numberAttribute });
  /** Data source that provides the records displayed by the table. */
  dataSource!: ListDataSource<T>;
  /** Definitions of the columns rendered by the table. */
  columns = input.required<Column[]>();
  /** Message displayed when the table contains no records. */
  emptyMessage = input<string>('No se encontraron registros');
  /** Filters sent with each data request. */
  filters = input<Filters>({});
  /** Initial page index and page size. */
  initialPagination = input<{ pageIndex: number; pageSize: number } | null>(null);
  /** Initial sort column and direction. */
  initalSort = input<{ active: string; direction: SortDirection } | null>(null);
  /** Static or record-dependent CSS class applied to each table row. */
  rowClass = input<string | string[] | ((item: any) => string | string[]) | null>(null);

  /** Requests that consumers refresh data used by the list's parent context. */
  refreshData = outputFromObservable<AsyncEvent>(this.refreshDataSource$);
  /** Emits the record selected by a row click. */
  rowClick = output<any>();
  /** Emits the parameters whenever the table state changes. */
  stateChange = output<TableRequestParams>();

  /** Column identifiers used by the table as its displayed column order. */
  displayedColumns = computed(() => this.columns().map((c) => c.id));

  /** Currently selected sort column. */
  activeSort = signal<string>('');
  /** Zero-based index of the current page. */
  pageIndex = signal<number>(0);
  /** Number of records displayed per page. */
  pageSize = signal<number>(15);
  /** Direction of the current sort. */
  sortDirection = signal<SortDirection>('');

  private readonly apiConfig = inject(NAS_API_CONFIG);
  private readonly http = inject(HttpClient);
  private lastFilters: Filters = {};
  private loadedSub?: Subscription;
  private refreshTimeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const currentFilters = this.filters();

      this.filters();
      untracked(() => {
        if (this.dataSource && !isEqual(this.lastFilters, currentFilters)) {
          this.lastFilters = { ...currentFilters };

          this.pageIndex.set(0);
          this.triggerLoad(false);
        }
      });
    });

    effect(() => {
      const interval = this.autoRefresh();

      untracked(() => {
        if (this.dataSource) {
          this.scheduleNextRefresh();
        }
      });
    });
  }

  ngOnInit(): void {
    const pagination = this.initialPagination();
    if (pagination) {
      this.pageIndex.set(pagination.pageIndex);
      this.pageSize.set(pagination.pageSize);
    }
    const sort = this.initalSort();
    if (sort) {
      this.activeSort.set(sort.active);
      this.sortDirection.set(sort.direction);
    }

    this.lastFilters = { ...(this.filters() || {}) };

    this.dataSource = new ListDataSource(this.apiConfig, this.http, this.activity());
    this.loadedSub = this.dataSource.onLoaded$.subscribe(() => {
      this.scheduleNextRefresh();
    });

    this.triggerLoad(false);
  }

  /** Releases subscriptions, timers, and the data source. */
  ngOnDestroy(): void {
    this.clearRefreshTimer();
    this.loadedSub?.unsubscribe();
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }

  /** Returns the CSS class configured for a column and record. */
  protected getClass(column: Column, item: T): string | string[] {
    if (typeof column.class === 'function') {
      return column.class(column.id, item);
    }
    return column.class || '';
  }

  /** Returns the icon configured for a column and record. */
  protected getIcon(column: Column, item: T): IconProp | undefined {
    if (typeof column.icon === 'function') {
      return column.icon(column.id, item);
    }
    return column.icon;
  }

  /** Returns the numeric value configured for a column and record. */
  protected getNumberValue(column: Column, item: T): number | undefined {
    return this.getValue(column, item) as number;
  }

  /** Returns the CSS class configured for a table row. */
  protected getRowClass(item: T): string | string[] | null {
    const rowClass = this.rowClass();
    if (typeof rowClass === 'function') {
      return rowClass(item);
    }
    return rowClass;
  }

  /** Resolves a column value from its value function, literal value, or field path. */
  protected getValue(column: Column, item: T): string | number | Date | undefined {
    if (typeof column.value === 'function') {
      return column.value(column.id, item);
    } else if (!!column.value) {
      return column.value;
    } else if (!!column.field) {
      const keys = column.field.split('.');
      var value = item;
      keys.forEach((key) => {
        if (value) {
          value = (value as any)[key];
        }
      });
      if (typeof value === 'object') {
        return JSON.stringify(value);
      } else if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
        return value;
      }
      return undefined;
    } else {
      return (item as any)[column.id];
    }
  }

  /** Updates sorting state and reloads the table. */
  protected onSort(sort: Sort): void {
    this.activeSort.set(sort.active);
    this.sortDirection.set(sort.direction);
    this.triggerLoad(false);
  }

  /** Updates pagination state and reloads the table. */
  protected onPage(page: PageEvent): void {
    this.pageIndex.set(page.pageIndex);
    this.pageSize.set(page.pageSize);
    this.triggerLoad(false);
  }

  /** Emits the selected record when a table row is clicked. */
  protected onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  /** Cancels any pending automatic refresh. */
  private clearRefreshTimer(): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = undefined;
    }
  }

  /** Waits for consumers to finish handling a parent-data refresh request. */
  private refreshParentData(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.refreshDataSource$.observed) {
        resolve();
        return;
      }

      this.refreshDataSource$.next({ resolve });
    });
  }

  /** Schedules the next automatic refresh when enabled. */
  private scheduleNextRefresh(): void {
    this.clearRefreshTimer();
    const interval = this.autoRefresh();

    if (interval > 0) {
      this.refreshTimeoutId = setTimeout(() => {
        this.triggerLoad(true);
      }, interval);
    }
  }

  /** Builds the current table request and loads records from the data source. */
  private triggerLoad(silent = false): void {
    this.clearRefreshTimer();

    const params: TableRequestParams = {
      filters: this.filters(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sort: this.activeSort(),
      direction: this.sortDirection(),
    };

    setTimeout(() => this.stateChange.emit(params));

    this.dataSource.loadData(params, silent);
    this.refreshParentData();
  }
}
