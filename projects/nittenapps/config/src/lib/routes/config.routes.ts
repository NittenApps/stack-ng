import { Routes } from '@angular/router';
import {
  faBrowser,
  faBrowsers,
  faCogs,
  faInputPipe,
  faList,
  faObjectGroup,
  faScrewdriverWrench,
} from '@fortawesome/pro-duotone-svg-icons';
import { NavItem } from '@nittenapps/components';
import { activityResolver } from '../resolvers/activity.resolver';
import { catalogResolver } from '../resolvers/catalog.resolver';
import { fieldResolver } from '../resolvers/field.resolver';
import { fieldGroupResolver } from '../resolvers/field-group.resolver';
import { moduleResolver } from '../resolvers/module.resolver';

export const CONFIG_ITEMS: NavItem[] = [
  {
    label: 'Configuración',
    icon: faCogs,
    iconSet: 'duo',
    roles: ['config'],
    children: [
      {
        label: 'Catálogos',
        icon: faList,
        iconSet: 'duo',
        routerLink: ['config', 'catalogs'],
      },
      {
        label: 'Campos',
        icon: faInputPipe,
        iconSet: 'duo',
        routerLink: ['config', 'fields'],
      },
      {
        label: 'Grupos de Campos',
        icon: faObjectGroup,
        iconSet: 'duo',
        routerLink: ['config', 'field-groups'],
      },
      {
        label: 'Actividades',
        icon: faBrowser,
        iconSet: 'duo',
        routerLink: ['config', 'activities'],
      },
      {
        label: 'Módulos',
        icon: faBrowsers,
        iconSet: 'duo',
        routerLink: ['config', 'modules'],
      },
    ],
  },
  {
    label: 'Administración',
    icon: faScrewdriverWrench,
    iconSet: 'duo',
    roles: ['admin'],
    children: [
      {
        label: 'Catálogos',
        icon: faList,
        iconSet: 'duo',
        routerLink: ['admin', 'catalogs'],
      },
    ],
  },
];

export const ADMIN_ROUTES: Routes = [
  {
    path: 'catalogs',
    loadComponent: () => import('@nittenapps/activity').then((m) => m.ActivityComponent),
    data: {
      breadcrumb: 'Catálogos',
      roles: ['admin'],
    },
    children: [
      {
        path: '',
        loadComponent: () => import('../catalogs/catalog-values/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../catalogs/catalog-values/detail/detail.component').then((m) => m.DetailComponent),
        resolve: { model: catalogResolver },
        data: {
          breadcrumb: {
            disabled: true,
            label: (data: any) => `${data.model?.code || 'Nuevo'}`,
          },
        },
      },
    ],
  },
];

export const CONFIG_ROUTES: Routes = [
  {
    path: 'activities',
    loadComponent: () => import('@nittenapps/activity').then((m) => m.ActivityComponent),
    data: {
      breadcrumb: 'Actividades',
      roles: ['config'],
    },
    children: [
      {
        path: '',
        loadComponent: () => import('../components/activities/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('../components/activities/detail/detail.component').then((m) => m.DetailComponent),
        resolve: { model: activityResolver },
        data: {
          breadcrumb: {
            disabled: true,
            label: (data: any) => `${data.model?.code || 'Nuevo'}`,
          },
        },
      },
    ],
  },
  {
    path: 'catalogs',
    loadComponent: () => import('@nittenapps/activity').then((m) => m.ActivityComponent),
    data: {
      breadcrumb: 'Catálogos',
      roles: ['config'],
    },
    children: [
      {
        path: '',
        loadComponent: () => import('../catalogs/catalogs/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('../catalogs/catalogs/detail/detail.component').then((m) => m.DetailComponent),
        resolve: { model: catalogResolver },
        data: {
          breadcrumb: {
            disabled: true,
            label: (data: any) => `${data.model?.code || 'Nuevo'}`,
          },
        },
      },
    ],
  },
  {
    path: 'field-groups',
    loadComponent: () => import('@nittenapps/activity').then((m) => m.ActivityComponent),
    data: {
      breadcrumb: 'Grupos de Campos',
      roles: ['config'],
    },
    children: [
      {
        path: '',
        loadComponent: () => import('../components/field-groups/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../components/field-groups/detail/detail.component').then((m) => m.DetailComponent),
        resolve: { model: fieldGroupResolver },
        data: {
          breadcrumb: {
            disabled: true,
            label: (data: any) => `${data.model?.code || 'Nuevo'}`,
          },
        },
      },
    ],
  },
  {
    path: 'fields',
    loadComponent: () => import('@nittenapps/activity').then((m) => m.ActivityComponent),
    data: {
      breadcrumb: 'Campos',
      roles: ['config'],
    },
    children: [
      {
        path: '',
        loadComponent: () => import('../components/fields/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('../components/fields/detail/detail.component').then((m) => m.DetailComponent),
        resolve: { model: fieldResolver },
        data: {
          breadcrumb: {
            disabled: true,
            label: (data: any) => `${data.model?.code || 'Nuevo'}`,
          },
        },
      },
    ],
  },
  {
    path: 'modules',
    loadComponent: () => import('@nittenapps/activity').then((m) => m.ActivityComponent),
    data: {
      breadcrumb: 'Módulos',
      roles: ['config'],
    },
    children: [
      {
        path: '',
        loadComponent: () => import('../components/modules/list/list.component').then((m) => m.ListComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('../components/modules/detail/detail.component').then((m) => m.DetailComponent),
        resolve: { model: moduleResolver },
        data: {
          breadcrumb: {
            disabled: true,
            label: (data: any) => `${data.model?.code || 'Nuevo'}`,
          },
        },
      },
    ],
  },
];
