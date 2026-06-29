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

@Component({
  selector: 'nas-loading-indicator',
  imports: [MatProgressSpinnerModule, NgTemplateOutlet],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class LoadingIndicatorComponent implements OnDestroy, OnInit {
  @Input() detectRouteTransitions = false;
  @ContentChild('loading') customLoadingIndicator: TemplateRef<any> | null = null;

  constructor(
    protected loadingService: LoadingService,
    @Inject(DOCUMENT) private document: Document,
    private el: ElementRef,
    private router: Router,
  ) {}

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

  ngOnDestroy(): void {
    if (this.el.nativeElement.parentNode) {
      this.el.nativeElement.parentNode.removeChild(this.el.nativeElement);
    }
  }
}
