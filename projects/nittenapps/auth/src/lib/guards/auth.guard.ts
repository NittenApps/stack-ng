import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { AuthService } from '../services';

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
