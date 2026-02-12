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
  inject,
  Input,
  ModelSignal,
  output
} from '@angular/core';
import {
  FormControl,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';

import { DATE_CONCISE_FMT } from '../_data/static/date-formats';
import { ClickAwareDirective } from '../_directives';
import { ClioInfo, Run } from '../_models';
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
  public DATE_CONCISE_FMT = DATE_CONCISE_FMT;
  private readonly fb = inject(UntypedFormBuilder);

  listSelectionCount = 0;
  graphMode = false;
  requestDownloadAll = output<void>();
  requestDownloadDataset = output<string>();

  form = new UntypedFormGroup({
    run_ids: new UntypedFormGroup({})
  });

  formDatasets = new UntypedFormGroup({
    dataset_ids: new UntypedFormGroup({})
  });

  @Input() clioInfo: ModelSignal<ClioInfo>;

  /**
   * when info changes...
   * add form controls (run ids)
   * add form controls (group ids)
   * update the listSelectionCount
   * reset checkboxes
   **/
  constructor() {
    effect(() => {
      if (this.clioInfo().list) {
        this.setRunCheckboxes(false);
        const runFormGroup = this.form.get('run_ids') as UntypedFormGroup;
        const datasetFormGroup = this.formDatasets.get(
          'dataset_ids'
        ) as UntypedFormGroup;

        const list = this.clioInfo().list;
        list.forEach((run: Run) => {
          const fName = `${run.runId}`;
          const ctrlRun = this.form.get(fName);
          if (!ctrlRun) {
            runFormGroup.addControl(fName, new FormControl(true, []));
          }
          const dsId = `${run.datasetId}`;
          const ctrlDatset = this.formDatasets.get(dsId);
          if (!ctrlDatset) {
            datasetFormGroup.addControl(dsId, new FormControl(true, []));
          }
        });
        this.listSelectionCount = list.length;
        this.setRunCheckboxes(true);
      }
    });
  }

  clickOutside(): void {
    const datasetRuns = this.clioInfo().datasetRuns;
    if (datasetRuns) {
      Object.keys(datasetRuns).forEach((key: string) => {
        datasetRuns[key].opened = false;
      });
    }
  }

  cancelGraphMode(): void {
    this.graphMode = false;
  }

  toggleGraphMode(): void {
    this.graphMode = !this.graphMode;
  }

  setRunCheckboxes(val: boolean): void {
    Object.keys(this.form.controls).forEach((group: string) => {
      Object.keys((this.form.get(group) as UntypedFormGroup).controls).forEach(
        (key) => {
          const ctrl = this.form.get(group + '.' + key) as FormControl;
          if (val) {
            const arrVisible = this.clioInfo().list.map((item: Run) => {
              return `${item.runId}`;
            });
            if (arrVisible.includes(key)) {
              ctrl.setValue(val);
            }
          } else {
            ctrl.setValue(false);
          }
        }
      );
    });
  }

  checkAll(datasetId: string, groupList: Array<Run>): void {
    const val = this.formDatasets.value['dataset_ids'][datasetId];
    groupList.forEach((run: Run) => {
      const ctrl = this.form.get('run_ids.' + run.runId) as FormControl;
      ctrl.setValue(val);
    });
    this.updateIds();
  }

  getClioClass(score: number): string {
    const rounded = score === 100 ? 4 : Math.floor(score / 20);
    return `clio-state-${rounded}`;
  }

  updateIds(): void {
    const vals = this.form.value['run_ids'];
    this.listSelectionCount = Object.keys(vals).filter((key: string) => {
      return vals[key];
    }).length;
  }
}
