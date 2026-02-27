import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NavItem } from '../../types/navbar-item';
import { NavigationComponent } from './navbar.component';

@Component({
    selector: 'nas-navbar-vertical',
    imports: [AsyncPipe, MatButtonModule, MatIconModule, NavigationComponent],
    templateUrl: './navbar-vertical.component.html',
    styleUrl: './navbar-vertical.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalComponent {
  @Input() footerText?: string;
  @Input() items!: NavItem[];
  @Input() logoText?: string;

  @Output() toggleFold = new EventEmitter<boolean>();
  @Output() toggleOpen = new EventEmitter<boolean>();

  folded = true;
  open = false;

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  );

  @HostListener('mouseenter') onmouseenter(): void {
    this.toggleOpen.emit(true);
    this.open = true;
  }

  @HostListener('mouseleave') onmouseleave(): void {
    this.toggleOpen.emit(false);
    this.open = false;
  }

  onToggleFold(): void {
    this.toggleFold.emit(!this.folded);
    this.folded = !this.folded;
  }
}
