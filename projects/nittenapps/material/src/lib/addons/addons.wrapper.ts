import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { FieldWrapper } from '@nittenapps/forms';

@Component({
  selector: 'nas-wrapper-addons',
  templateUrl: './addons.wrapper.html',
  standalone: false,
})
export class StackWrapperAddons extends FieldWrapper implements AfterViewInit {
  @ViewChild('matPrefix', { static: true }) matPrefix!: TemplateRef<any>;
  @ViewChild('matSuffix', { static: true }) matSuffix!: TemplateRef<any>;

  get leftIconType(): string {
    return this.props['addonLeft']?.icon ? typeof this.props['addonLeft']?.icon : '';
  }

  get rightIconType(): string {
    return typeof this.props['addonRight']?.icon ? typeof this.props['addonRight']?.icon : '';
  }

  ngAfterViewInit(): void {
    if (this.matPrefix) {
      this.props['prefix'] = this.matPrefix;
    }

    if (this.matSuffix) {
      this.props['suffix'] = this.matSuffix;
    }
  }

  addonLeftClick($event: any): void {
    if (this.props['addonLeft'].onClick) {
      this.props['addonLeft'].onClick(this.props, this, $event);
    }
  }

  addonRightClick($event: any): void {
    if (this.props['addonRight'].onClick) {
      this.props['addonRight'].onClick(this.props, this, $event);
    }
  }
}
