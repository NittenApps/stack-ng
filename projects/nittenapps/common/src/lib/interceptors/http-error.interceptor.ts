import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { tap } from 'rxjs';
import { ErrorDialog } from '../dialogs/error/error.dialog';

export const httpErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const dialog = inject(MatDialog);

  return next(req).pipe(
    tap({
      error: (error: HttpErrorResponse) => {
        console.error(error);
        let title: string | null = null;
        let message: string;
        let timestamp: Date | string = new Date();
        let reload: boolean = false;

        if (error.status === 0 || error.status == 502) {
          message = 'El servicio no está disponible, intenta nuevamente más tarde';
        } else if (error.status === 401) {
          message = 'La sesión ha finalizado, vuelve a entrar';
          reload = true;
        } else if (error.status === 404) {
          message = 'No se encontró información';
        } else {
          message = error.error?.body?.detail
            ? `[${error.error.detailMessageCode}] - ${error.error.body.detail}`
            : 'Error desconocido';
          title = error.error?.body?.title || null;
          timestamp = error.error?.body?.timestamp;
        }
        dialog
          .open(ErrorDialog, { data: { title, message, timestamp } })
          .afterClosed()
          .subscribe(() => {
            if (reload) {
              document.location.reload();
            }
          });
      },
    })
  );
};
