import { StackFieldConfig } from '@nittenapps/forms';

export function addonsExtension(field: StackFieldConfig): void {
  if (!field.props || (field.wrappers && field.wrappers.indexOf('addons') !== -1)) {
    return;
  }

  if (field.props['addonLeft'] || field.props['addonRight']) {
    field.wrappers = [...(field.wrappers || []), 'addons'];
  }
}
