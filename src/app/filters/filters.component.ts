import { JsonPipe, KeyValuePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  inject,
  model,
  ModelSignal,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';

import { RenameFilterPipe } from '../_translate';
import { APIService } from '../_services';
import {
  fromCSL,
  fromInputSafeName,
  toInputSafeName
} from '../_helpers/date-helpers';
import { filterList } from '../_helpers/string-helpers';
import {
  CheckDataRequest,
  CheckDataResults,
  ClioInfo,
  FilterParameterName
} from '../_models';
import { CheckboxComponent } from '../checkbox';
import { SliderComponent } from '../slider';

interface FilterForm {
  dataProvider: FormGroup;
  provider: FormGroup;
  dateFrom: FormControl<string | null>;
  dateTo: FormControl<string | null>;
  percentLinksInOperationFrom: FormControl<number | null>;
  datasetName: FormControl<string | null>;
  datasetId: FormControl<string | null>;
  datasetIds: FormGroup;
  limit: FormControl<number | null>;
  offset: FormControl<number | null>;
}

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  imports: [
    CheckboxComponent,
    JsonPipe,
    KeyValuePipe,
    FormsModule,
    ReactiveFormsModule,
    RenameFilterPipe,
    SliderComponent
  ]
})
export class FiltersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(APIService);
  private readonly destroyRef = inject(DestroyRef);

  public filterList = filterList;
  public toInputSafeName = toInputSafeName;

  hasMoreAvailable = signal(false);
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

  form = this.fb.group<FilterForm>({
    dataProvider: this.fb.group({}),
    provider: this.fb.group({}),
    dateFrom: this.fb.control<string | null>(''),
    dateTo: this.fb.control<string | null>(''),
    percentLinksInOperationFrom: this.fb.control<number | null>(null),
    datasetName: this.fb.control<string | null>(''),
    datasetId: this.fb.control<string | null>(''),
    datasetIds: this.fb.group({}),
    limit: this.fb.control<number | null>(25),
    offset: this.fb.control<number | null>(0)
  });

  readonly formValueSignal = toSignal(this.form.valueChanges, {
    initialValue: this.form.value
  });

  error?: HttpErrorResponse;

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        debounceTime(0),
        takeUntilDestroyed(this.destroyRef), // Auto-manages cleanup context perfectly
        map((qp) => {
          const qpValArrays: Params = {};
          Object.keys(qp).forEach((paramName: string) => {
            // Numbers are treated as primitives to keep slider inputs flawless
            if (
              ['percentLinksInOperationFrom', 'limit', 'offset'].includes(
                paramName
              )
            ) {
              qpValArrays[paramName] = Array.isArray(qp[paramName])
                ? Number(qp[paramName][0])
                : Number(qp[paramName]);
            } else {
              qpValArrays[paramName] = (
                Array.isArray(qp[paramName]) ? qp[paramName] : [qp[paramName]]
              ).map((qpValue: string) => toInputSafeName(qpValue));
            }
          });
          return qpValArrays;
        })
      )
      .subscribe((queryParams) => {
        const datasetId = queryParams['datasetId'];
        const datasetName = queryParams['datasetName'];
        const percentLinksInOperation =
          queryParams['percentLinksInOperationFrom'];

        if (datasetId) {
          const datasetIds = this.form.get('datasetIds') as FormGroup;
          if (datasetIds) {
            `${datasetId}`.split(',').forEach((part: string) => {
              const trimmed = part.trim();
              if (trimmed && !datasetIds.contains(trimmed)) {
                datasetIds.addControl(trimmed, this.fb.control(trimmed));
              }
            });
          }
        }

        this.queryParams = queryParams;

        const dateFrom = queryParams['dateFrom'];
        const dateTo = queryParams['dateTo'];
        const limit = queryParams['limit'] ?? 25;
        const offset = queryParams['offset'] ?? 0;

        this.form.patchValue(
          {
            dateFrom: dateFrom ? dateFrom[0] : '',
            dateTo: dateTo ? dateTo[0] : '',
            datasetId: datasetId ? datasetId[0] : '',
            datasetName: datasetName ? datasetName[0] : '',
            percentLinksInOperationFrom: Number.isNaN(percentLinksInOperation)
              ? null
              : percentLinksInOperation,
            limit: Number.isNaN(limit) ? 25 : limit,
            offset: Number.isNaN(offset) ? 0 : offset
          },
          { emitEvent: false }
        );

        this.loadData();
      });
  }

  // 💡 Safe ISO Parsing: Avoids UTC shifts modifying date selection by exactly one calendar day
  getDateAsISOString(localDate: Date): string {
    if (Number.isNaN(localDate.getTime())) return '';
    const date = new Date(localDate.toISOString());
    const dateUTC = new Date(
      date.getTime() - localDate.getTimezoneOffset() * 60000
    );
    return dateUTC.toISOString().split('T')[0];
  }

  generateTitleMarkup(): Array<{ label: string; fn?: () => void }> {
    const res: Array<{ label: string; fn?: () => void }> = [];
    const queryKeys = Object.keys(this.queryParams).filter(
      (key) => !['offset', 'limit'].includes(key)
    );

    if (queryKeys.length === 0) {
      return [{ label: 'All checks' }];
    }

    // Define strategy handlers for uniform filter inputs
    const standardFilters: Record<
      string,
      {
        prefix: string;
        labelFactory: (v: string) => string;
        control: string;
        defaultVal: any;
      }
    > = {
      datasetId: {
        prefix: 'and',
        labelFactory: (v) => `Dataset Id (${v})`,
        control: 'datasetId',
        defaultVal: ''
      },
      datasetName: {
        prefix: 'and',
        labelFactory: (v) => `Dataset Name "${v}"`,
        control: 'datasetName',
        defaultVal: ''
      },
      percentLinksInOperationFrom: {
        prefix: 'and',
        labelFactory: (v) => `Percent In Operation >= ${v}%`,
        control: 'percentLinksInOperationFrom',
        defaultVal: null
      }
    };

    queryKeys.forEach((key: string, index: number) => {
      const rawValues = Array.isArray(this.queryParams[key])
        ? this.queryParams[key]
        : [this.queryParams[key]];

      const values = rawValues.map((val: unknown) =>
        fromInputSafeName(String(val))
      );
      const isFirstFilter = index === 0;

      if (key === 'dateFrom') {
        res.push(
          { label: 'from' },
          {
            label: values[0],
            fn: () => {
              this.form.patchValue({ dateFrom: '', offset: 0 });
              this.updatePageUrl();
            }
          }
        );
      } else if (key === 'dateTo') {
        res.push(
          { label: 'until' },
          {
            label: values[0],
            fn: () => {
              this.form.patchValue({ dateTo: '', offset: 0 });
              this.updatePageUrl();
            }
          }
        );
      }
      // handle single
      else if (standardFilters[key]) {
        const config = standardFilters[key];
        if (!isFirstFilter) res.push({ label: config.prefix });

        res.push({
          label: config.labelFactory(values[0]),
          fn: () => {
            this.form.patchValue({
              [config.control]: config.defaultVal,
              offset: 0
            });
            this.updatePageUrl();
          }
        });
      }
      // handle arrays
      else {
        rawValues.forEach((valPart: string, indexInner: number) => {
          if (indexInner === 0) {
            res.push({ label: isFirstFilter ? key : `and ${key}` });
          }

          res.push({
            label: values[indexInner],
            fn: () => {
              const group = this.form.get(key) as FormGroup;
              if (group) {
                group.removeControl(toInputSafeName(rawValues[indexInner]));
              }
              this.form.patchValue({ offset: 0 });
              this.updatePageUrl();
            }
          });

          if (indexInner !== rawValues.length - 1) {
            res.push({ label: 'or' });
          }
        });
      }
    });

    return res;
  }

  bumpPage(): void {
    const offset = Number(this.form.value.offset ?? 0);
    const limit = Number(this.form.value.limit ?? 25);
    this.form.patchValue({ offset: offset + limit });
    this.updatePageUrl();
  }

  dropPage(): void {
    const offset = Number(this.form.value.offset ?? 0);
    const limit = Number(this.form.value.limit ?? 25);
    this.form.patchValue({ offset: Math.max(0, offset - limit) });
    this.updatePageUrl();
  }

  /**
   * Serializes current form controls / active URL query parameters
   *
   * @returns {CheckDataRequest}
   */
  getDataServerDataRequest(): CheckDataRequest {
    const filters: Record<string, any> = {
      percentLinksInOperationFrom: Number(
        this.form.value.percentLinksInOperationFrom ?? 0
      ),
      offset: Number(this.form.value.offset ?? 0),
      limit: Number(this.form.value.limit ?? 25),
      dateFrom: this.form.value.dateFrom ?? '',
      dateTo: this.form.value.dateTo ?? '',
      datasetName: this.form.value.datasetName
        ? [this.form.value.datasetName]
        : []
    };

    if (this.form.value.datasetId) {
      filters['datasetId'] = fromCSL(this.form.value.datasetId);
    }

    const explicitKeys = new Set([
      'offset',
      'limit',
      'percentLinksInOperationFrom',
      'datasetId',
      'datasetName',
      'dateFrom',
      'dateTo'
    ]);

    Object.keys(this.queryParams).forEach((key) => {
      if (explicitKeys.has(key)) return; // Fast O(1) hash exclusion skip

      const rawValues = this.queryParams[key];
      const valueArray = Array.isArray(rawValues) ? rawValues : [rawValues];

      filters[key] = valueArray.map((val) => fromInputSafeName(String(val)));
    });

    return { filters } as CheckDataRequest;
  }

  isCheckboxChecked(filterName: string, option: string): boolean {
    const queryParamValue = this.queryParams[filterName];
    if (!queryParamValue) return false;

    const safeName = this.toInputSafeName(option);
    return Array.isArray(queryParamValue)
      ? queryParamValue.includes(safeName)
      : String(queryParamValue) === safeName;
  }

  addOrUpdateFilterControls(name: string, options: Array<string>): void {
    const checkboxes = this.form.get(name) as FormGroup;
    if (!checkboxes) {
      return;
    }

    options.forEach((option: string) => {
      const fName = toInputSafeName(option);
      const ctrl = checkboxes.get(fName);
      const defaultValue = String(this.queryParams[name] || '').includes(fName);

      if (ctrl) {
        ctrl.setValue(defaultValue, { emitEvent: false });
      } else {
        checkboxes.addControl(fName, this.fb.control(defaultValue), {
          emitEvent: false
        });
      }
    });
  }

  loadData(): void {
    this.error = undefined;

    this.api
      .getFilteredClioChecks(this.getDataServerDataRequest())
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.error = err;
          return of({
            results: [],
            filterOptions: {}
          } as unknown as CheckDataResults);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((checkDataResults: CheckDataResults) => {
        const list = checkDataResults.results || [];
        const filterOps = checkDataResults.filterOptions || {};

        const cleanOps = { ...filterOps };
        delete cleanOps['datasetId'];
        delete cleanOps['datasetName'];
        delete cleanOps['dateFrom'];
        delete cleanOps['dateTo'];
        delete cleanOps['excludedCheckId'];
        delete cleanOps['percentLinksInOperationTo'];
        delete cleanOps['percentLinksInOperationFrom'];
        delete cleanOps['hasMoreAvailable'];

        Object.keys(cleanOps).forEach((key: string) => {
          if (cleanOps[key]) {
            this.addOrUpdateFilterControls(key, cleanOps[key]);
          }
        });

        const queryParamMap = this.route.snapshot.queryParamMap;

        this.hasMoreAvailable.set(!!filterOps['hasMoreAvailable']);

        if (queryParamMap.has('percentLinksInOperationFrom')) {
          const rawPercent = queryParamMap.get('percentLinksInOperationFrom');
          this.form.controls.percentLinksInOperationFrom.setValue(
            rawPercent ? Number.parseInt(rawPercent, 10) : null,
            { emitEvent: false }
          );
        }

        const totalScore = list.reduce(
          (sum, obj) => sum + (obj.percentLinksInOperation ?? 0),
          0
        );
        const listAverageScore = list.length
          ? Math.floor(totalScore / (list.length * 20))
          : 0;

        const datasetChecks = this.api.groupChecksByDatasetId(list);
        const titleMarkup = this.generateTitleMarkup();

        this.modelClioInfo.set({
          filterOps: cleanOps,
          datasetChecks,
          list,
          listLength: list.length,
          listAverageScore,
          titleMarkup
        });
      });
  }

  updatePageUrl(clearPagination = false, queryParamsOverride?: Params): void {
    if (clearPagination) {
      this.form.patchValue({ offset: 0 }, { emitEvent: false });
    }

    // Merge parameters dynamically using the clean local override configuration if present
    const qp: Params = {
      ...this.getFilterParams(queryParamsOverride),
      ...this.getFormQueryParams()
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: qp,
      queryParamsHandling: ''
    });
  }

  private getFilterParams(sourceParams?: Params): Params {
    const qp: Params = {};
    const currentClioInfo = this.modelClioInfo();
    const activeParams = sourceParams || this.queryParams;

    if (currentClioInfo?.filterOps) {
      Object.keys(currentClioInfo.filterOps).forEach((filterName: string) => {
        const existingValues = activeParams[filterName];
        if (existingValues) {
          qp[filterName] = Array.isArray(existingValues)
            ? existingValues
            : [existingValues];
        }
      });
    }
    return qp;
  }

  private getFormQueryParams(): Params {
    const qp: Params = {};
    const values = this.form.value;

    if (values.dateFrom) qp['dateFrom'] = this.formatDateParam(values.dateFrom);
    if (values.dateTo) qp['dateTo'] = this.formatDateParam(values.dateTo);
    if (values.datasetId) qp['datasetId'] = values.datasetId;
    if (values.datasetName) qp['datasetName'] = values.datasetName;
    if (values.limit) qp['limit'] = values.limit;

    if (values.offset !== null && values.offset !== undefined) {
      qp['offset'] = values.offset;
    }

    if (this.hasValidStringValue(values.percentLinksInOperationFrom)) {
      qp['percentLinksInOperationFrom'] = values.percentLinksInOperationFrom;
    }

    return qp;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatDateParam(date: any): string {
    return typeof date === 'string'
      ? date
      : this.getDateAsISOString(new Date(date));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private hasValidStringValue(val: any): boolean {
    return val !== null && val !== undefined && String(val) !== '';
  }

  goToPage(pageIndex: number): void {
    const currentLimit = Number(this.form.value.limit ?? 25);
    const targetOffset = Math.max(0, pageIndex * currentLimit);

    this.form.patchValue({ offset: targetOffset });
    this.updatePageUrl();
  }

  onFilterCheckboxToggle(filterName: string, option: string): void {
    const safeName = this.toInputSafeName(option);

    // local shallow clone respects immutable structures
    const updatedQueryParams = { ...this.queryParams };
    const currentValuesRaw = updatedQueryParams[filterName] || [];
    let currentValues = Array.isArray(currentValuesRaw)
      ? [...currentValuesRaw]
      : [currentValuesRaw];

    if (currentValues.includes(safeName)) {
      currentValues = currentValues.filter((val) => val !== safeName);
    } else {
      currentValues.push(safeName);
    }

    if (currentValues.length > 0) {
      updatedQueryParams[filterName] = currentValues;
    } else {
      delete updatedQueryParams[filterName];
    }

    // Explicitly update the tracking state on the form control tree
    this.form.patchValue({ offset: 0 }, { emitEvent: false });

    // Pass the fresh object mutation configuration directly down to the router step
    this.updatePageUrl(false, updatedQueryParams);
  }
}
