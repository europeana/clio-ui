import { DatePipe, NgClass } from '@angular/common';
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

import { DATE_VERBOSE_FMT } from '../_data/static/date-formats';
import { ClioInfo, Run } from '../_models';
import { CheckboxComponent } from '../checkbox';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  imports: [CheckboxComponent, DatePipe, NgClass]
})
export class ListingComponent {
  public DATE_VERBOSE_FMT = DATE_VERBOSE_FMT;
  private readonly fb = inject(UntypedFormBuilder);

  listSelectionCount = 0;
  requestSummaryBatchId = output<number>();
  requestSummaryDatasetId = output<number>();

  previewedId?: number;

  form = new UntypedFormGroup({
    report_ids: new UntypedFormGroup({})
  });

  @Input() clioInfo: ModelSignal<ClioInfo>;

  constructor() {
    effect(() => {
      if (this.clioInfo().list) {
        this.setCheckboxes(false);
        const list = this.clioInfo().list;
        const formGroup = this.form.get('report_ids') as UntypedFormGroup;

        list.forEach((report: Run) => {
          const fName = `${report.reportId}`;
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

  setCheckboxes(val: boolean): void {
    Object.keys(this.form.controls).forEach((group: string) => {
      Object.keys((this.form.get(group) as UntypedFormGroup).controls).forEach(
        (key) => {
          const ctrl = this.form.get(group + '.' + key) as FormControl;
          if (val) {
            const arrVisible = this.clioInfo().list.map((item: Run) => {
              return `${item.reportId}`;
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

  updateIds(): void {
    const vals = this.form.value['report_ids'];
    this.listSelectionCount = Object.keys(vals).filter((key: string) => {
      return vals[key];
    }).length;
  }
}
