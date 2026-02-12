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
  requestSummaryDatasetId = output<string>();
  requestDownloadDataset = output<string>();

  form = new UntypedFormGroup({
    run_ids: new UntypedFormGroup({})
  });

  @Input() clioInfo: ModelSignal<ClioInfo>;

  constructor() {
    effect(() => {
      if (this.clioInfo().list) {
        this.setCheckboxes(false);
        const list = this.clioInfo().list;
        const formGroup = this.form.get('run_ids') as UntypedFormGroup;

        list.forEach((report: Run) => {
          const fName = `${report.runId}`;
          const ctrl = this.form.get(fName);
          if (!ctrl) {
            formGroup.addControl(fName, new FormControl(true, []));
          }
        });

        this.listSelectionCount = list.length;
        this.setCheckboxes(true);
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

  setCheckboxes(val: boolean): void {
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
