import { InjectionToken } from '@angular/core';
import { ApiConfig } from '../types/api-config';

/**
 * Angular injection token used to provide the API configuration for the application.
 *
 * This token allows services and components to access the shared `ApiConfig` definition
 * via dependency injection without relying on direct imports.
 */
export const NAS_API_CONFIG = new InjectionToken<ApiConfig>('ApiConfig');
