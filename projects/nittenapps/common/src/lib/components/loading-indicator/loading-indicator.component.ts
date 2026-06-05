import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoadingService } from '../../services';

@Component({
  selector: 'nas-loading-indicator',
  imports: [MatProgressSpinnerModule, NgTemplateOutlet],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.css',
})
export class LoadingIndicatorComponent {
  @Input() detectRouteTransitions = false;
  @ContentChild('loading') customLoadingIndicator: TemplateRef<any> | null = null;

  constructor(
    protected loadingService: LoadingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
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
}
