import { NgModule } from '@angular/core';
import { COMPONENTS_COMPONENTS } from './components/index';

/** Module that groups and exports the reusable components of the library. */
@NgModule({
  imports: [COMPONENTS_COMPONENTS],
  exports: [COMPONENTS_COMPONENTS],
})
export class ComponentsModule {}
