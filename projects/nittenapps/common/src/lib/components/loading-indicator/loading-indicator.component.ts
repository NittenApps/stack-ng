import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ContentChild,
  DOCUMENT,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoadingService } from '../../services';

/**
 * Displays the application's loading indicator and optionally tracks lazy
 * route configuration loading.
 */
@Component({
  selector: 'nas-loading-indicator',
  imports: [MatProgressSpinnerModule, NgTemplateOutlet],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class LoadingIndicatorComponent implements OnDestroy, OnInit {
  /** Whether to show the indicator while route configurations are loading. */
  @Input() detectRouteTransitions = false;

  /** Custom loading-indicator template projected into the component. */
  @ContentChild('loading') customLoadingIndicator: TemplateRef<any> | null = null;

  constructor(
    protected loadingService: LoadingService,
    @Inject(DOCUMENT) private document: Document,
    private el: ElementRef,
    private router: Router,
  ) {}

  /** Moves the component under the document body and subscribes to router events when enabled. */
  ngOnInit(): void {
    // Moves the entire component element directly under <body> when it initializes
    this.document.body.appendChild(this.el.nativeElement);

    if (this.detectRouteTransitions) {
      this.router.events
        .pipe(
          tap((event) => {
            if (event instanceof RouteConfigLoadStart) {
              this.loadingService.show();
            } else if (event instanceof RouteConfigLoadEnd) {
              this.loadingService.hide();
            }
          }),
        )
        .subscribe();
    }
  }

  /** Removes the component element from its parent when the component is destroyed. */
  ngOnDestroy(): void {
    if (this.el.nativeElement.parentNode) {
      this.el.nativeElement.parentNode.removeChild(this.el.nativeElement);
    }
  }
}
