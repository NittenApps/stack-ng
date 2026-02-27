import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, NgClass, NgStyle } from '@angular/common';
import { Component, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCircleInfo,
  faGridHorizontal,
  faObjectGroup,
  faRightFromBracket,
  faTableList,
} from '@fortawesome/pro-duotone-svg-icons';
import { faAngleDown } from '@fortawesome/pro-solid-svg-icons';
import { BreadcrumbComponent, NavItem, NavbarVerticalComponent } from '@nittenapps/components';
import { Observable, map, shareReplay } from 'rxjs';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-navigation',
    imports: [
        AsyncPipe,
        BreadcrumbComponent,
        DashboardComponent,
        FaIconComponent,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatSidenavModule,
        MatToolbarModule,
        NavbarVerticalComponent,
        NgClass,
        NgStyle,
        RouterOutlet,
    ],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class NavigationComponent {
  faAngleDown = faAngleDown;
  faRightFromBracket = faRightFromBracket;

  navbarFolded = true;
  navbarOpen = false;

  readonly items: NavItem[];
  readonly version: string = environment.version;

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((result) => result.matches),
    shareReplay()
  );

  constructor() {
    this.items = [
      {
        label: 'Componentes',
        icon: faObjectGroup,
        iconSet: 'duo',
        children: [
          {
            label: 'Tablero',
            icon: faGridHorizontal,
            iconSet: 'duo',
            routerLink: ['dashboard'],
          },
          {
            label: 'Lista',
            icon: faTableList,
            iconSet: 'duo',
            routerLink: ['list'],
          },
        ],
      },
      {
        label: 'Acerca de...',
        icon: faCircleInfo,
      },
    ];
  }

  logout(): void {}

  setNavbarFolded(folded: boolean): void {
    this.navbarFolded = this.navbarOpen = folded;
  }

  setNavbarOpen(open: boolean): void {
    if (this.navbarFolded) {
      this.navbarOpen = open;
    }
  }
}
