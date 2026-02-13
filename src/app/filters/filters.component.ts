import { JsonPipe, KeyValuePipe, NgFor } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  model,
  ModelSignal,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';

import { RenameFilterPipe } from '../_translate';
import { APIService } from '../_services';
import {
  fromCSL,
  fromInputSafeName,
  toInputSafeName
} from '../_helpers/date-helpers';
import { filterList } from '../_helpers/string-helpers';

import { BreakdownResults, CheckDataRequest, ClioInfo } from '../_models';
import { CheckboxComponent } from '../checkbox';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  imports: [
    NgFor,
    CheckboxComponent,
    JsonPipe,
    KeyValuePipe,
    FormsModule,
    ReactiveFormsModule,
    RenameFilterPipe
  ]
})
export class FiltersComponent implements OnInit, OnDestroy {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(APIService);

  public filterList = filterList;
  public toInputSafeName = toInputSafeName;

  subs: Array<Subscription> = [];
  queryParams: Params = {};
  titleMarkup: Array<{ label: string; fn?: () => void }> = [];

  modelClioInfo: ModelSignal<ClioInfo> = model({
    datasetChecks: {},
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
    datasetName: new FormControl(),
    datasetId: new FormControl(),
    datasetIds: new UntypedFormGroup({})
  });

  error?: HttpErrorResponse;

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
        const datasetName = queryParams['dataset-name'];

        if (datasetId) {
          const datasetIds = this.form.get('datasetIds') as UntypedFormGroup;
          `${datasetId}`.split(',').forEach((part: string) => {
            datasetIds.addControl(part.trim(), new FormControl(part));
          });
        }

        this.queryParams = queryParams;

        const dateFrom = this.queryParams['date-from'];
        const dateTo = this.queryParams['date-to'];

        this.form.controls.dateFrom.setValue(dateFrom ? dateFrom[0] : '');
        this.form.controls.dateTo.setValue(dateTo ? dateTo[0] : '');
        this.form.controls.datasetId.setValue(datasetId ? datasetId[0] : '');
        this.form.controls.datasetName.setValue(
          datasetName ? datasetName[0] : ''
        );

        this.loadData();
      });
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription | undefined) => {
      if (sub) {
        sub.unsubscribe();
      }
    });
    this.subs = [];
  }

  getDateAsISOString(localDate: Date): string {
    const date = new Date(localDate.toISOString());
    const dateUTC = new Date(
      date.getTime() - localDate.getTimezoneOffset() * 60000
    );
    return dateUTC.toISOString().split('T')[0];
  }

  generateTitleMarkup(): Array<{ label: string; fn?: () => void }> {
    const res: Array<{ label: string; fn?: () => void }> = [];
    const queryKeys = Object.keys(this.queryParams);

    if (!queryKeys || queryKeys.length === 0) {
      res.push({ label: 'All checks' });
    }

    queryKeys.forEach((key: string, index: number) => {
      const values = this.queryParams[key].map((paramName: string) => {
        return fromInputSafeName(paramName);
      });

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
      } else if (key === 'dataset-name') {
        const label = 'Dataset Name';
        if (index > 0) {
          res.push({
            label: 'and'
          });
        }
        res.push({
          label: `${label} "${values[0]}"`,
          fn: () => {
            this.form.patchValue({ datasetName: '' });
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

  getDataServerDataRequest(): CheckDataRequest {
    const dataRequest: CheckDataRequest = { filters: {} };
    Object.keys(this.queryParams).forEach((key: string) => {
      dataRequest.filters[key] = {
        values: this.queryParams[key].map((paramName: string) => {
          return fromInputSafeName(paramName);
        })
      };
    });

    const valDatasetId = this.form.value.datasetId;

    if (valDatasetId) {
      dataRequest.filters['dataset-id'] = {
        values: fromCSL(valDatasetId)
      };
    }
    return dataRequest;
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
    this.error = undefined;
    this.subs.push(
      this.api
        .getFiltereClioChecks(this.getDataServerDataRequest())
        .pipe(
          catchError((err: HttpErrorResponse) => {
            this.error = err;
            return of({
              results: [],
              filteringOptions: {}
            });
          })
        )
        .subscribe((breakdownResults: BreakdownResults) => {
          const list = breakdownResults.results;
          const filterOps = breakdownResults.filteringOptions;

          Object.keys(filterOps).forEach((key: string) => {
            this.addOrUpdateFilterControls(key, filterOps[key]);
          });

          const averageScore = Math.floor(
            list.reduce((sum, obj) => sum + obj.percentInOperation, 0) /
              list.length
          );
          const listAverageScore = Math.floor(averageScore / 20);
          const datasetChecks = this.api.groupChecksByDatasetId(list);
          const titleMarkup = this.generateTitleMarkup();

          this.modelClioInfo.set({
            filterOps,
            datasetChecks,
            list,
            listLength: list.length,
            listAverageScore,
            titleMarkup
          });
        })
    );
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

    const datasetId = this.form.value.datasetId;
    const datasetName = this.form.value.datasetName;
    const valFrom = this.form.value.dateFrom;
    const valTo = this.form.value.dateTo;

    if (valFrom) {
      qp['date-from'] = this.getDateAsISOString(new Date(valFrom));
    }
    if (valTo) {
      qp['date-to'] = this.getDateAsISOString(new Date(valTo));
    }
    if (datasetId) {
      qp['dataset-id'] = datasetId;
    }
    if (datasetName) {
      qp['dataset-name'] = datasetName;
    }

    this.router.navigate([''], {
      queryParams: qp
    });
  }
}
