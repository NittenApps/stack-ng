import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NavItem } from '../../types/navbar-item';
import { NavigationComponent } from './navbar.component';

/**
 * Displays a vertical navigation bar with responsive behavior, fold controls,
 * and pointer-based open and close events.
 *
 * The component renders the supplied navigation items and exposes outputs so
 * parent components can react to changes in the folded and open states.
 */
@Component({
  selector: 'nas-navbar-vertical',
  imports: [AsyncPipe, MatButtonModule, MatIconModule, NavigationComponent],
  templateUrl: './navbar-vertical.component.html',
  styleUrl: './navbar-vertical.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class NavbarVerticalComponent {
  /** Text displayed in the navbar footer. */
  @Input() footerText?: string;

  /** Items rendered in the navbar navigation. */
  @Input() items!: NavItem[];

  /** Text displayed alongside the navbar logo. */
  @Input() logoText?: string;

  /** Emits the requested folded state when the navbar fold control is toggled. */
  @Output() toggleFold = new EventEmitter<boolean>();

  /** Emits whether the navbar should be opened or closed. */
  @Output() toggleOpen = new EventEmitter<boolean>();

  /** Indicates whether the navbar is currently folded. */
  folded = true;

  /** Indicates whether the navbar is currently open. */
  open = false;

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay(),
  );

  /** Opens the navbar when the pointer enters it. */
  @HostListener('mouseenter') onmouseenter(): void {
    this.toggleOpen.emit(true);
    this.open = true;
  }

  /** Closes the navbar when the pointer leaves it. */
  @HostListener('mouseleave') onmouseleave(): void {
    this.toggleOpen.emit(false);
    this.open = false;
  }

  /** Toggles the folded state and notifies listeners. */
  onToggleFold(): void {
    this.toggleFold.emit(!this.folded);
    this.folded = !this.folded;
  }
}
