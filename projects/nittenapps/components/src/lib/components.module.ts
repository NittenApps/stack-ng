import { NgModule } from '@angular/core';
import { COMPONENTS_COMPONENTS } from './components/index';

/** Módulo que agrupa y exporta los componentes reutilizables de la librería. */
@NgModule({
  imports: [COMPONENTS_COMPONENTS],
  exports: [COMPONENTS_COMPONENTS],
})
export class ComponentsModule {}
