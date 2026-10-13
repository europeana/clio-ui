import {
  DatePipe,
  KeyValuePipe,
  NgClass,
  NgFor,
  NgStyle,
  NgTemplateOutlet
} from '@angular/common';
import {
  Component,
  effect,
  Input,
  ModelSignal,
  output,
  signal
} from '@angular/core';

import {
  DATE_CONCISE_FMT,
  DATE_DEFAULT_FMT
} from '../_data/static/date-formats';
import { ClickAwareDirective } from '../_directives';
import { CheckGroup, ClioCheck, ClioInfo } from '../_models';
import { RenameFilterPipe } from '../_translate';
import { CheckboxComponent } from '../checkbox';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  imports: [
    CheckboxComponent,
    ClickAwareDirective,
    DatePipe,
    KeyValuePipe,
    NgClass,
    NgFor,
    NgStyle,
    NgTemplateOutlet,
    RenameFilterPipe
  ]
})
export class ListingComponent {
  public readonly DATE_CONCISE_FMT = DATE_CONCISE_FMT;
  public readonly DATE_DEFAULT_FMT = DATE_DEFAULT_FMT;

  graphMode = false;
  requestDownloadCheck = output<number>();
  requestDownloadAll = output<void>();
  requestDownloadDataset = output<string>();

  selectedCheckIds = signal<Set<number>>(new Set());
  selectedDatasetIds = signal<Set<string>>(new Set());

  @Input() clioInfo: ModelSignal<ClioInfo>;

  constructor() {
    /**
     * Reacts directly to incoming data shifts.
     * Automatically ensures all visible data items default to an active checked selection layout.
     */
    effect(() => {
      const info = this.clioInfo();
      const list = info?.list || [];

      // Mass initialization executed via single-pass array insertions
      const initialChecks = new Set<number>();
      const initialDatasets = new Set<string>();

      list.forEach((check: ClioCheck) => {
        initialChecks.add(check.id!);
        initialDatasets.add(String(check.datasetId));
      });

      this.selectedCheckIds.set(initialChecks);
      this.selectedDatasetIds.set(initialDatasets);
    });
  }

  // Pure compute mapping metrics: yields lightning fast O(1) checks
  get listSelectionCount(): number {
    return this.selectedCheckIds().size;
  }

  clickOutside(): void {
    const datasetChecks = this.clioInfo().datasetChecks;
    if (datasetChecks) {
      Object.keys(datasetChecks).forEach((key: string) => {
        datasetChecks[key].opened = false;
      });
    }
  }

  cancelGraphMode(): void {
    this.graphMode = false;
  }

  toggleGraphMode(): void {
    this.graphMode = !this.graphMode;
  }

  /**
   * Evaluates checked list sizes per distinct dataset cluster
   * Optimized from O(N^2) down to linear O(N) using Set.has lookups
   */
  getSelectedRunCount(list: Array<ClioCheck> = []): number {
    const activeChecks = this.selectedCheckIds();
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      if (activeChecks.has(list[i].id!)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Stateless Individual Run Selector Toggle Handler
   */
  toggleCheckSelection(runId: number): void {
    const current = new Set(this.selectedCheckIds());
    if (current.has(runId)) {
      current.delete(runId);
    } else {
      current.add(runId);
    }
    this.selectedCheckIds.set(current);
  }

  /**
   * Maps dataset header checkbox selection flips down to all underlying sibling rows
   */
  checkAll(datasetId: string, groupList: Array<ClioCheck>): void {
    const dsStr = String(datasetId);
    const datasets = new Set(this.selectedDatasetIds());
    const checks = new Set(this.selectedCheckIds());

    const shouldCheckAll = !datasets.has(dsStr);

    if (shouldCheckAll) {
      datasets.add(dsStr);
      groupList.forEach((run) => checks.add(run.id!));
    } else {
      datasets.delete(dsStr);
      groupList.forEach((run) => checks.delete(run.id!));
    }

    this.selectedDatasetIds.set(datasets);
    this.selectedCheckIds.set(checks);
  }

  getClioClass(score: number): string {
    const rounded = score === 100 ? 4 : Math.floor(score / 20);
    return `clio-state-${rounded}`;
  }

  toggleGroupOpenStatus(groupKey: string, groupValue: CheckGroup): void {
    groupValue.opened = !groupValue.opened;

    if (groupValue.opened && groupValue.list.length <= 1) {
      const parent = groupValue.list[0];

      if (parent) {
        groupValue.list = [
          {
            ...parent,
            id: parent.id! * 1000 + 1,
            date: this.shiftDate(parent.date!, 0),
            percentLinksInOperation: parent.percentLinksInOperation
          },
          {
            ...parent,
            id: parent.id! * 1000 + 2,
            date: this.shiftDate(parent.date!, -1),
            percentLinksInOperation: Math.max(
              0,
              parent.percentLinksInOperation - 15
            )
          },
          {
            ...parent,
            id: parent.id! * 1000 + 3,
            date: this.shiftDate(parent.date!, -2),
            percentLinksInOperation: Math.min(
              100,
              parent.percentLinksInOperation + 5
            )
          }
        ];

        const updatedChecks = new Set(this.selectedCheckIds());
        groupValue.list.forEach((run: ClioCheck) => updatedChecks.add(run.id!));
        this.selectedCheckIds.set(updatedChecks);
      }
    }
  }

  // Simple helper to generate distinct timestamps for simulated sub-rows
  private shiftDate(isoString: string, daysToShift: number): string {
    const d = new Date(isoString);
    d.setDate(d.getDate() + daysToShift);
    return d.toISOString().split('T')[0];
  }
}
