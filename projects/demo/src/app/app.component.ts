import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NewVersionCheckerService } from '@nittenapps/common';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
    selector: 'app-root',
    imports: [MatSnackBarModule, NavigationComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Demo';

  constructor(newVersionCheckerService: NewVersionCheckerService, snackBar: MatSnackBar) {
    newVersionCheckerService.newVersionAvailable.subscribe((newVersion) => {
      if (newVersion) {
        snackBar
          .open('Hay una nueva versión de la aplicación', 'Actualizar')
          .onAction()
          .subscribe(() => newVersionCheckerService.applyUpdate());
      }
    });
  }
}
