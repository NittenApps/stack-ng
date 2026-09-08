import { DecimalPipe, NgClass } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StackFormsModule } from '@nittenapps/forms';
import { StackMatMasterDetailTable } from './master-detail-table.type';

@NgModule({
  declarations: [StackMatMasterDetailTable],
  imports: [
    DecimalPipe,
    FontAwesomeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatTooltipModule,
    NgClass,
    ReactiveFormsModule,
    StackFormsModule.forChild({ types: [{ name: 'master-detail-table', component: StackMatMasterDetailTable }] }),
  ],
})
export class StackMatDynamicTableModule {}
