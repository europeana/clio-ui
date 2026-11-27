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
  computed,
  effect,
  inject,
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
import { APIService } from '../_services';
import { RenameFilterPipe } from '../_translate';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  imports: [
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
  private readonly apiService = inject(APIService);

  graphMode = false;
  fetchedDatasetIds = new Set<string>();

  requestDownloadCheck = output<number>();
  requestDownloadAll = output<void>();
  requestDownloadDataset = output<string>();

  readonly isDownloading = this.apiService.isDownloading;
  readonly listSelectionCount = computed(() => this.selectedCheckIds().size);

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

      this.fetchedDatasetIds.clear();

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

  clickOutside(): void {
    const datasetChecks = this.clioInfo().datasetChecks;
    if (!datasetChecks) return;

    const updatedChecks = new Set(this.selectedCheckIds());
    let changed = false;

    Object.entries(datasetChecks).forEach(([key, group]) => {
      if (group.opened) {
        this.collapseGroup(key, group, updatedChecks);
        changed = true;
      }
    });

    if (changed) {
      this.selectedCheckIds.set(updatedChecks);
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
    const updatedChecks = new Set(this.selectedCheckIds());

    if (groupValue.opened) {
      this.collapseGroup(groupKey, groupValue, updatedChecks);
      this.selectedCheckIds.set(updatedChecks);
      return;
    }

    groupValue.opened = true;
    const topLevelId = Number(groupKey);
    const parentRow = groupValue.list[0];
    const needsFetch =
      groupValue.list.length === 1 && String(parentRow.id) === String(groupKey);

    // Already fetched previously: swap top-level ID for cached sub-runs
    if (!needsFetch) {
      if (updatedChecks.delete(topLevelId)) {
        groupValue.list.forEach((run) => updatedChecks.add(run.id!));
        this.selectedCheckIds.set(updatedChecks);
      }
      return;
    }

    // First time opening: fetch runs, then swap IDs
    this.apiService
      .getDatasetRuns(
        groupKey,
        parentRow.datasetName,
        parentRow.provider,
        parentRow.dataProvider
      )
      .subscribe({
        next: (realRuns: Array<ClioCheck>) => {
          this.fetchedDatasetIds.add(groupKey);
          if (realRuns?.length) {
            realRuns.forEach((run) => {
              run.datasetSize ??= parentRow.datasetSize;
              run.datasetLastIndex ??= parentRow.datasetLastIndex;
            });
            groupValue.list = realRuns;
          }

          const latestChecks = new Set(this.selectedCheckIds());
          latestChecks.delete(topLevelId);
          groupValue.list.forEach((run) => latestChecks.add(run.id!));
          this.selectedCheckIds.set(latestChecks);
        },
        error: (err: unknown) => {
          console.error(
            `Failed to resolve sub-runs for dataset: ${groupKey}`,
            err
          );
        }
      });
  }

  private collapseGroup(
    groupKey: string,
    group: CheckGroup,
    checksSet: Set<number>
  ): void {
    group.opened = false;
    let hadAnySelected = false;

    group.list.forEach((run) => {
      if (checksSet.delete(run.id!)) {
        hadAnySelected = true;
      }
    });

    if (hadAnySelected) {
      checksSet.add(Number(groupKey));
    }
  }
}
