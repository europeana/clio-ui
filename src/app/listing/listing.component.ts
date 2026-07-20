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

import {
  DATE_CONCISE_FMT,
  DATE_DEFAULT_FMT
} from '../_data/static/date-formats';
import { ClickAwareDirective } from '../_directives';
import { ClioCheck, ClioInfo } from '../_models';
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
  public DATE_DEFAULT_FMT = DATE_DEFAULT_FMT;
  private readonly fb = inject(UntypedFormBuilder);

  listSelectionCount = 0;
  graphMode = false;
  requestDownloadCheck = output<number>();
  requestDownloadAll = output<void>();
  requestDownloadDataset = output<string>();

  form = new UntypedFormGroup({
    check_ids: new UntypedFormGroup({})
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
        this.setClioCheckFormValues(false);
        const runFormGroup = this.form.get('check_ids') as UntypedFormGroup;
        const datasetFormGroup = this.formDatasets.get(
          'dataset_ids'
        ) as UntypedFormGroup;

        const clioInfoValue = this.clioInfo();
        const list = clioInfoValue.list;

        list.forEach((check: ClioCheck) => {
          const fName = `${check.id}`;
          const ctrlRun = this.form.get(fName);
          if (!ctrlRun) {
            runFormGroup.addControl(fName, new FormControl(true, []));
          }
          const dsId = `${check.datasetId}`;
          const ctrlDatset = this.formDatasets.get(dsId);
          if (!ctrlDatset) {
            datasetFormGroup.addControl(dsId, new FormControl(true, []));
          }
        });
        this.listSelectionCount = list.length;
        this.setClioCheckFormValues(true);
      }
    });
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

  getSelectedRunCount(list: Array<ClioCheck>): number {
    return list
      .map((run: ClioCheck) => {
        return run.id;
      })
      .filter((id: number) => {
        return this.form.value['check_ids'][id];
      }).length;
  }

  setClioCheckFormValues(val: boolean): void {
    const groupControls = (this.form.get('check_ids') as UntypedFormGroup)
      .controls;
    Object.keys(groupControls).forEach((key) => {
      const ctrl = this.form.get('check_ids.' + key) as FormControl;
      if (val) {
        const arrVisible = this.clioInfo().list.map((item: ClioCheck) => {
          return `${item.id}`;
        });
        if (arrVisible.includes(key)) {
          ctrl.setValue(val);
        }
      } else {
        ctrl.setValue(false);
      }
    });
  }

  checkAll(datasetId: string, groupList: Array<ClioCheck>): void {
    const val = this.formDatasets.value['dataset_ids'][datasetId];
    groupList.forEach((run: ClioCheck) => {
      const ctrl = this.form.get('check_ids.' + run.id) as FormControl;
      ctrl.setValue(val);
    });
    this.updateIds();
  }

  getClioClass(score: number): string {
    const rounded = score === 100 ? 4 : Math.floor(score / 20);
    return `clio-state-${rounded}`;
  }

  updateIds(): void {
    const vals = this.form.value['check_ids'];
    this.listSelectionCount = Object.keys(vals).filter((key: string) => {
      return vals[key];
    }).length;
  }
}
