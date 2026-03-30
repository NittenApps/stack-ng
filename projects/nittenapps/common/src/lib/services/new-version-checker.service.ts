import { Injectable, NgZone } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';

/** Servicio que consulta periódicamente si existe una nueva versión publicada de la aplicación. */
@Injectable({ providedIn: 'root' })
export class NewVersionCheckerService {
  intervalSource = interval(30 * 60000);
  intervalSubscription?: Subscription;

  private isNewVersionAvailable$ = new BehaviorSubject<boolean>(false);

  /** Emite `true` cuando el service worker detecta una actualización disponible. */
  get newVersionAvailable(): Observable<boolean> {
    return this.isNewVersionAvailable$;
  }

  constructor(private swUpdate: SwUpdate, private zone: NgZone) {
    this.checkForUpdate();
  }

  /** Activa la nueva versión descargada y recarga la aplicación. */
  applyUpdate(): void {
    this.swUpdate
      .activateUpdate()
      .then(() => document.location.reload())
      .catch((error) => console.error('Failed to apply updates', error));
  }

  private checkForUpdate(): void {
    this.intervalSubscription?.unsubscribe();
    if (!this.swUpdate.isEnabled) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.intervalSubscription = this.intervalSource.subscribe(async () => {
        try {
          const isNewVersionAvailable = await this.swUpdate.checkForUpdate();
          this.isNewVersionAvailable$.next(isNewVersionAvailable);
        } catch (error) {
          console.error('Failed to check for updates', error);
        }
      });
    });
  }
}
