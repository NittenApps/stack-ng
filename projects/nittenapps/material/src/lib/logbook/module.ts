import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { StackFormsModule } from '@nittenapps/forms';
import { StackMatLogbook } from './logbook.type';

@NgModule({
  declarations: [StackMatLogbook],
  imports: [
    FaIconComponent,
    MatButtonModule,
    MatTooltipModule,
    StackFormsModule.forChild({ types: [{ name: 'logbook', component: StackMatLogbook }] }),
  ],
})
export class StackMatLogbookModule {}
