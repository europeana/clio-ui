import { KeyValuePipe, NgFor } from '@angular/common';
import { Component, inject, model, ModelSignal, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { debounceTime, map } from 'rxjs/operators';

import { APIService } from '../_services';
import { getDateAsISOString } from '../_helpers/date-helpers';
import { fromCSL, toInputSafeName } from '../_helpers/date-helpers';
import { filterList } from '../_helpers/string-helpers';

import { BreakdownRequest, BreakdownResults, ClioInfo } from '../_models';
import { CheckboxComponent } from '../checkbox';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  imports: [
    NgFor,
    CheckboxComponent,
    KeyValuePipe,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class FiltersComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(APIService);

  public filterList = filterList;

  queryParams: Params = {};
  titleMarkup: Array<{ label: string; fn?: () => void }> = [];

  modelClioInfo: ModelSignal<ClioInfo> = model({
    list: [],
    listLength: -1,
    listAverageScore: -1,
    filterOps: {},
    titleMarkup: []
  } as ClioInfo);

  optionFilters: { [key: string]: string } = {
    provider: '',
    dataProvider: ''
  };

  form = new UntypedFormGroup({
    dataProvider: new UntypedFormGroup({}),
    provider: new UntypedFormGroup({}),

    dateFrom: new FormControl(),
    dateTo: new FormControl(),

    datasetId: new FormControl(),
    datasetIds: new UntypedFormGroup({}),

    batchId: new FormControl(),
    batchIds: new UntypedFormGroup({})
  });

  ngOnInit(): void {
    // parse the url param values into the form
    this.route.queryParams
      .pipe(
        debounceTime(0),
        map((qp) => {
          const qpValArrays: Params = {};
          Object.keys(qp).forEach((paramName: string) => {
            qpValArrays[paramName] = (
              Array.isArray(qp[paramName]) ? qp[paramName] : [qp[paramName]]
            ).map((qpValue: string) => {
              return toInputSafeName(qpValue);
            });
          });
          return qpValArrays;
        })
      )
      .subscribe((queryParams) => {
        const datasetId = queryParams['dataset-id'];
        const batchId = queryParams['batch-id'];

        if (datasetId) {
          const datasetIds = this.form.get('datasetIds') as UntypedFormGroup;
          `${datasetId}`.split(',').forEach((part: string) => {
            datasetIds.addControl(part.trim(), new FormControl(part));
          });
        }

        if (batchId) {
          const batchIds = this.form.get('batchIds') as UntypedFormGroup;
          `${batchId}`.split(',').forEach((part: string) => {
            batchIds.addControl(part.trim(), new FormControl(''));
          });
        }

        this.queryParams = queryParams;

        const dateFrom = this.queryParams['date-from'];
        const dateTo = this.queryParams['date-to'];

        this.form.controls.dateFrom.setValue(dateFrom ? dateFrom[0] : '');
        this.form.controls.dateTo.setValue(dateTo ? dateTo[0] : '');
        this.form.controls.datasetId.setValue(datasetId ? datasetId[0] : '');
        this.form.controls.batchId.setValue(batchId ? batchId[0] : '');

        this.loadData();
      });
  }

  summariseBatchId(id: number): void {
    console.log('filter summary batch (' + id + ')');
    this.form.controls.batchId.setValue(id);
    this.updatePageUrl();
  }

  summariseDatasetId(id: number): void {
    console.log('filter summary dataset (' + id + ')');
    this.form.controls.datasetId.setValue(id);
    this.updatePageUrl();
  }

  /**/

  generateTitleMarkup(): Array<{ label: string; fn?: () => void }> {
    const res: Array<{ label: string; fn?: () => void }> = [];
    const queryKeys = Object.keys(this.queryParams);

    if (!queryKeys || queryKeys.length === 0) {
      res.push({ label: 'All reports' });
    }

    queryKeys.forEach((key: string, index: number) => {
      const values = this.queryParams[key];

      if (key === 'date-from') {
        res.push({
          label: `from`
        });
        res.push({
          label: `${values[0]}`,
          fn: () => {
            this.form.patchValue({ dateFrom: '' });
            this.updatePageUrl();
          }
        });
      } else if (key === 'date-to') {
        res.push({
          label: `until`
        });
        res.push({
          label: `${values[0]}`,
          fn: () => {
            this.form.patchValue({ dateTo: '' });
            this.updatePageUrl();
          }
        });
      } else if (key === 'batch-id') {
        const label = 'Batch Id';
        if (index > 0) {
          res.push({
            label: 'and'
          });
        }
        res.push({
          label: `${label} (${values[0]})`,
          fn: () => {
            this.form.patchValue({ batchId: '' });
            this.updatePageUrl();
          }
        });
      } else if (key === 'dataset-id') {
        const label = 'Dataset Id';
        if (index > 0) {
          res.push({
            label: 'and'
          });
        }
        res.push({
          label: `${label} (${values[0]})`,
          fn: () => {
            this.form.patchValue({ datasetId: '' });
            this.updatePageUrl();
          }
        });
      } else {
        this.queryParams[key].forEach((valPart: string, indexInner: number) => {
          if (indexInner === 0) {
            if (index > 0) {
              res.push({
                label: 'and ' + key
              });
            } else {
              res.push({
                label: key
              });
            }
          }

          res.push({
            label: `${values[indexInner]}`,
            fn: () => {
              const currVal = this.form.value[key];
              delete currVal[toInputSafeName(values[indexInner])];
              this.form.patchValue({ key: currVal });
              this.updatePageUrl();
            }
          });

          if (indexInner !== this.queryParams[key].length - 1) {
            res.push({
              label: 'or'
            });
          }
        });
      }
    });
    return res;
  }

  getDataServerDataRequest(): BreakdownRequest {
    const breakdownRequest: BreakdownRequest = { filters: {} };

    Object.keys(this.queryParams).forEach((key: string) => {
      breakdownRequest.filters[key] = { values: this.queryParams[key] };
    });

    const valDatasetId = this.form.value.datasetId;

    if (valDatasetId) {
      breakdownRequest.filters['dataset-id'] = {
        values: fromCSL(valDatasetId)
      };
    }

    const valBatchId = this.form.value.batchId;

    if (valBatchId) {
      breakdownRequest.filters['batch-id'] = {
        values: fromCSL(valBatchId)
      };
    }

    return breakdownRequest;
  }

  addOrUpdateFilterControls(name: string, options: Array<string>): void {
    const checkboxes = this.form.get(name) as UntypedFormGroup;

    options.forEach((option: string) => {
      const fName = toInputSafeName(option);
      const ctrl = this.form.get(`${name}.${fName}`);
      const defaultValue = `${this.queryParams[name]}`.includes(fName);

      if (!ctrl) {
        checkboxes.addControl(fName, new FormControl(defaultValue));
      } else {
        ctrl.setValue(defaultValue);
      }
    });
  }

  /** loadData
   **/
  loadData(): void {
    this.api
      .getFilteredReports(this.getDataServerDataRequest())
      .subscribe((breakdownResults: BreakdownResults) => {
        const list = breakdownResults.results;
        const ops = breakdownResults.filteringOptions;

        Object.keys(ops).forEach((key: string) => {
          this.addOrUpdateFilterControls(key, ops[key]);
        });

        const averageScore = Math.floor(
          list.reduce((sum, obj) => sum + obj.score, 0) / list.length
        );
        const listAverageScore = Math.floor(averageScore / 20);

        this.modelClioInfo.set({
          filterOps: ops,
          list,
          listLength: list.length,
          listAverageScore,
          titleMarkup: this.generateTitleMarkup()
        });
      });
  }

  getSetCheckboxValues(filterName: string): Array<string> {
    const vals = this.form.value[filterName];
    return vals
      ? Object.keys(vals).filter((key: string) => {
          return vals[key];
        })
      : [];
  }

  /** updatePageUrl
  /* Navigate to url according to form state
  */
  updatePageUrl(): void {
    const qp: Params = {};

    Object.keys(this.modelClioInfo().filterOps).forEach(
      (filterName: string) => {
        const filterVals = this.getSetCheckboxValues(filterName);
        if (filterVals.length > 0) {
          qp[filterName] = filterVals;
        }
      }
    );

    const dataset = this.form.value.datasetId;
    const batch = this.form.value.batchId;
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;

    if (valFrom) {
      qp['date-from'] = getDateAsISOString(new Date(valFrom));
    }
    if (valTo) {
      qp['date-to'] = getDateAsISOString(new Date(valTo));
    }
    if (dataset) {
      qp['dataset-id'] = dataset;
    }
    if (batch) {
      qp['batch-id'] = batch;
    }

    this.router.navigate([''], {
      queryParams: qp
    });
  }

  /** getFormattedDateParam
  /* get an empty string or the formatted date range
  /* @returns string
  getFormattedDateParam(): string {
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;

    if (valFrom && valTo) {
      const valToDate = new Date(valTo);
      valToDate.setDate(valToDate.getDate() + 1);
      const range = `${new Date(valFrom).toISOString()}+TO+${new Date(
        valToDate.getTime() - 1
      ).toISOString()}`;
      return `&qf=timestamp_update:${encodeURIComponent(
        '['
      )}${range}${encodeURIComponent(']')}`;
    }
    return '';
  }
  */
}
