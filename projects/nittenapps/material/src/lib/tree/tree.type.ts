import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTree } from '@angular/material/tree';
import { FieldType, FieldTypeConfig } from '@nittenapps/forms';
import { merge } from 'rxjs';

export interface TreeNode {
  key: string;
  label: string;
  disabled?: boolean;
  selectable?: boolean;
  children?: TreeNode[];
  _forcedSelect?: boolean;
}

export interface NodeState {
  disabled?: boolean;
  selectable?: boolean;
  selected?: boolean;
}

export type NodeStateFn = (node: TreeNode, level: number, model: any) => NodeState;

@Component({
  selector: 'nas-mat-tree',
  templateUrl: './tree.type.html',
  styleUrl: './tree.type.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackFieldTree extends FieldType<FieldTypeConfig> implements OnInit {
  checklistSelection = new SelectionModel<TreeNode>(true);
  childrenAccessor = (node: TreeNode) => node.children ?? [];
  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;
  selectedCondition = signal<string | null>(null);
  treeData = signal<TreeNode[]>([]);
  treeRef = viewChild<MatTree<TreeNode>>('tree');

  private destroyRef = inject(DestroyRef);

  constructor() {
    super();

    effect(() => {
      const tree = this.treeRef();

      if (tree && this.props['expandAllByDefault'] !== false) {
        untracked(() => {
          tree.expandAll();
        });
      }
    });
  }

  ngOnInit() {
    this.treeData.set(this.props['treeData'] || []);

    const fieldKeys = this.props['fieldKeys'] || this.props['fieldKey'];
    if (fieldKeys) {
      const keys = Array.isArray(fieldKeys) ? fieldKeys : [fieldKeys];
      const observables = keys.map((k) => this.form?.root.get(k)?.valueChanges).filter(Boolean);

      if (observables.length > 0) {
        merge(...observables)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((value) => {
            this.evaluateTree(this.form?.root.value);
          });
      }
    }

    if (this.formControl.value) {
      this.selectedCondition.set(this.formControl.value.condition);
    }
  }

  descendantsAllSelected(node: TreeNode): boolean {
    const descendants = this.getDescendants(node);
    if (!descendants.length) return false;
    return descendants.every((child) => this.checklistSelection.isSelected(child));
  }

  descendantsPartiallySelected(node: TreeNode): boolean {
    const descendants = this.getDescendants(node);
    const result = descendants.some((child) => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  toggleNode(node: TreeNode) {
    this.checklistSelection.toggle(node);
    this.syncToFormControl(true);
  }

  toggleParentNode(node: TreeNode) {
    const descendants = this.getDescendants(node);
    const allSelected = this.descendantsAllSelected(node);

    if (allSelected) {
      this.checklistSelection.deselect(node, ...descendants);
    } else {
      const selectableDescendants = descendants.filter((n) => !n.disabled);
      this.checklistSelection.select(node, ...selectableDescendants);
    }
    this.syncToFormControl(true);
  }

  private applyConditionToNodes(nodes: TreeNode[], model: any, level: number, inheritedSelected?: boolean) {
    const stateFn: NodeStateFn = this.props['stateFn'] as NodeStateFn;
    for (const node of nodes) {
      let currentForcedSelect = inheritedSelected;

      if (stateFn) {
        const state = stateFn(node, level, model);

        node.disabled = !!state.disabled;
        node.selectable = !!state.selectable;
        if (state.selected !== undefined) {
          currentForcedSelect = state.selected;
        }
      }

      node['_forcedSelect'] = currentForcedSelect;

      if (currentForcedSelect === true) {
        this.checklistSelection.select(node);
      } else if (currentForcedSelect === false) {
        this.checklistSelection.deselect(node);
      }

      if (node.children && node.children.length > 0) {
        this.applyConditionToNodes(node.children, model, level + 1, currentForcedSelect);
      }
    }
  }

  private cleanInvalidSelections() {
    let changed = false;
    this.checklistSelection.selected.forEach((node) => {
      if (node.disabled && node['_forcedSelect'] !== true) {
        this.checklistSelection.deselect(node);
        changed = true;
      }
    });
    if (changed) {
      this.syncToFormControl(false);
    }
  }

  private evaluateTree(model: any) {
    const nodes = this.treeData();

    this.applyConditionToNodes(nodes, model, 0);

    this.treeData.set([...nodes]);
    this.cleanInvalidSelections();

    this.syncToFormControl(false);
  }

  private getDescendants(node: TreeNode): TreeNode[] {
    const descendants: TreeNode[] = [];
    const children = node.children || [];
    for (const child of children) {
      descendants.push(child, ...this.getDescendants(child));
    }
    return descendants;
  }

  private syncToFormControl(emitEvent: boolean) {
    this.formControl.setValue(
      this.checklistSelection.selected.map((node) => node.key),
      { emitEvent },
    );
  }
}
