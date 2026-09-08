import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { StackFormsModule } from '@nittenapps/forms';
import { StackFieldTabs } from './tabs.type';

@NgModule({
  declarations: [StackFieldTabs],
  imports: [
    FaIconComponent,
    MatTabsModule,
    StackFormsModule.forChild({ types: [{ name: 'tabs', component: StackFieldTabs }] }),
  ],
})
export class StackMatTabsModule {}
