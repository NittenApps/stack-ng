import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { AuthService } from '../services';

/**
 * Validates whether the current authenticated user can access the requested route.
 *
 * If the user is not authenticated, it initiates the login flow and redirects back
 * to the protected URL after authentication. When the route declares required roles,
 * access is granted only if the user has at least one of them.
 *
 * @param route The activated route snapshot being evaluated.
 * @param state The router state snapshot for the current navigation.
 * @param authData Authentication data provided by Keycloak's auth guard.
 * @returns True when access is allowed, false when denied, or a UrlTree when a redirect is required.
 */
const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean | UrlTree> => {
  const auth: AuthService = inject(AuthService);
  const { authenticated, grantedRoles } = authData;
  let requiredRoles: string | string[] = route.data['roles'];

  if (!authenticated) {
    await auth.login(state.url);
  }

  if (typeof requiredRoles === 'string' && requiredRoles.length > 0) {
    requiredRoles = [requiredRoles];
  }
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
    return true;
  }

  const hasAnyRole = (roles: string[]): boolean => requiredRoles.some((role) => roles.includes(role));

  return authenticated && hasAnyRole(grantedRoles.realmRoles);
};

export const authGuard = createAuthGuard<CanActivateFn>(isAccessAllowed);
