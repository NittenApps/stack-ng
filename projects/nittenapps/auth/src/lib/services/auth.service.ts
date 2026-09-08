import { effect, inject, Injectable, signal } from '@angular/core';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

/**
 * Central authentication service for the application.
 *
 * This service bridges the Angular application with the Keycloak client and
 * exposes the current authentication state through Angular signals. It listens
 * to Keycloak lifecycle events and updates the authenticated flag and loaded
 * user profile accordingly.
 *
 * Signals exposed by this service:
 * - `isAuthenticated`: whether the current user is logged in.
 * - `profile`: the loaded Keycloak user profile, or `null` when unavailable.
 *
 * @see Keycloak
 * @see KEYCLOAK_EVENT_SIGNAL
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Indicates whether the current user is authenticated. */
  isAuthenticated = signal(false);

  /** Contains the current user's profile, or `null` when no profile is loaded. */
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

  /** Returns the current user's username, or `unknown` when unavailable. */
  get username(): string {
    return this.profile()?.username || 'unknown';
  }

  /** Returns the roles assigned to the current user in the Keycloak realm. */
  getUserRoles(): string[] {
    return this.keycloak.realmAccess?.roles || [];
  }

  /**
   * Starts the Keycloak login flow.
   *
   * @param redirectUri Optional path to navigate to after login.
   * @returns A promise that resolves when the login request completes.
   */
  login(redirectUri?: string): Promise<void> {
    return this.keycloak.login({ redirectUri: window.location.origin + (redirectUri || '') });
  }

  /**
   * Ends the current Keycloak session.
   *
   * @param redirectUri Optional path to navigate to after logout.
   */
  logout(redirectUri?: string): void {
    this.keycloak.logout({ redirectUri: window.location.origin + (redirectUri || '') });
  }
}
