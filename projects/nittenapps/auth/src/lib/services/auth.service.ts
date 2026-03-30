import { effect, inject, Injectable, signal } from '@angular/core';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

/** Servicio de autenticación basado en Keycloak para estado de sesión y acciones de login/logout. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated = signal(false);
  profile = signal<Keycloak.KeycloakProfile | null>(null);

  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  constructor() {
    effect(() => {
      const event = this.keycloakSignal();

      if (event.type === KeycloakEventType.Ready || event.type === KeycloakEventType.AuthSuccess) {
        this.keycloak.loadUserProfile().then((profile) => {
          this.isAuthenticated.set(!!this.keycloak.authenticated);
          this.profile.set(profile);
        });
      } else if (event.type === KeycloakEventType.AuthLogout) {
        this.isAuthenticated.set(false);
        this.profile.set(null);
      }
    });
  }

  get username(): string {
    return this.profile()?.username || 'unknown';
  }

  getUserRoles(): string[] {
    return this.keycloak.realmAccess?.roles || [];
  }

  login(redirectUri?: string): Promise<void> {
    return this.keycloak.login({ redirectUri: window.location.origin + (redirectUri || '') });
  }

  logout(redirectUri?: string): void {
    this.keycloak.logout({ redirectUri: window.location.origin + (redirectUri || '') });
  }
}
