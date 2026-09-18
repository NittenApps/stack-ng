import { Provider } from '@angular/core';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { DetailToolbarComponent } from './detail-toolbar/detail-toolbar.component';
import { IconComponent } from './icon/icon.component';
import { ListToolbarComponent } from './list-toolbar/list-toolbar.component';
import { ListComponent } from './list/list.component';
import { NavbarVerticalComponent } from './navbar/navbar-vertical.component';
import {
  NavigationCollapsibleComponent,
  NavigationComponent,
  NavigationItemComponent,
} from './navbar/navbar.component';
import { PlaceAutocompleteComponent } from './place-autocomplete/place-autocomplete.component';
import { SelectAddressComponent } from './select-address/select-address.component';

export {
  BreadcrumbComponent,
  DetailToolbarComponent,
  IconComponent,
  ListComponent,
  ListToolbarComponent,
  NavbarVerticalComponent,
  NavigationCollapsibleComponent,
  NavigationComponent,
  NavigationItemComponent,
  PlaceAutocompleteComponent,
  SelectAddressComponent,
};

export { BaseDetailComponent } from './detail';
export { BaseListComponent } from './list';

export const COMPONENTS_COMPONENTS: Provider[] = [
  BreadcrumbComponent,
  DetailToolbarComponent,
  IconComponent,
  ListComponent,
  ListToolbarComponent,
  NavbarVerticalComponent,
  NavigationComponent,
  NavigationCollapsibleComponent,
  NavigationItemComponent,
  PlaceAutocompleteComponent,
  SelectAddressComponent,
];
