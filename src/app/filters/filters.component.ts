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
import { CheckDataRequest, CheckDataResults, ClioInfo } from '../_models';
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

  public queryParamsSignal = toSignal(this.route.queryParams, {
    initialValue: {} as Params
  });

  /**
   * Wraps the imported string filter utility to float checked items to the top
   */
  public filterList(
    searchText: string,
    options: string[],
    fieldKey: string
  ): string[] {
    if (!options) {
      return [];
    }
    const filtered = filterList(searchText, options);
    return [...filtered].sort((a, b) => {
      const aChecked = this.isCheckboxChecked(fieldKey, a);
      const bChecked = this.isCheckboxChecked(fieldKey, b);

      if (aChecked && !bChecked) {
        return -1;
      }
      if (!aChecked && bChecked) {
        return 1;
      }
      return 0;
    });
  }

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
    const currentParams = this.queryParamsSignal();

    const queryKeys = Object.keys(currentParams).filter((key: string) => {
      return !['offset', 'limit'].includes(key);
    });

    if (!queryKeys || queryKeys.length === 0) {
      res.push({ label: 'All checks' });
      return res;
    }

    queryKeys.forEach((key: string, index: number) => {
      const rawValues = Array.isArray(currentParams[key])
        ? currentParams[key]
        : [currentParams[key]];

      const values = rawValues.map((paramName: unknown) =>
        fromInputSafeName(String(paramName))
      );

      if (key === 'dateFrom') {
        res.push(
          { label: 'from' },
          {
            label: `${values[0]}`,
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
            label: `${values[0]}`,
            fn: () => {
              this.form.patchValue({ dateTo: '', offset: 0 });
              this.updatePageUrl();
            }
          }
        );
      } else if (key === 'datasetId') {
        const label = 'Dataset Id';
        if (index > 0) res.push({ label: 'and' });
        res.push({
          label: `${label} (${values[0]})`,
          fn: () => {
            this.form.patchValue({ datasetId: '', offset: 0 });
            this.updatePageUrl();
          }
        });
      } else if (key === 'datasetName') {
        const label = 'Dataset Name';
        if (index > 0) res.push({ label: 'and' });
        res.push({
          label: `${label} "${values[0]}"`,
          fn: () => {
            this.form.patchValue({ datasetName: '', offset: 0 });
            this.updatePageUrl();
          }
        });
      } else if (key === 'percentLinksInOperationFrom') {
        const label = 'Percent In Operation';
        if (index > 0) res.push({ label: 'and' });
        res.push({
          label: `${label} >= ${values[0]}%`,
          fn: () => {
            this.form.patchValue({
              percentLinksInOperationFrom: null,
              offset: 0
            });
            this.updatePageUrl();
          }
        });
      } else {
        rawValues.forEach((valPart: string, indexInner: number) => {
          if (indexInner === 0) {
            res.push({ label: index > 0 ? 'and ' + key : key });
          }

          res.push({
            label: `${values[indexInner]}`,
            fn: () => {
              // Mutate a local query parameter clone directly from the signal state context
              const updatedQueryParams = { ...this.queryParamsSignal() };
              let currentValues = Array.isArray(updatedQueryParams[key])
                ? [...updatedQueryParams[key]]
                : [updatedQueryParams[key]];

              // Filter out the active clicked entry matching the internal raw parameter string
              currentValues = currentValues.filter(
                (val) => val !== rawValues[indexInner]
              );

              if (currentValues.length > 0) {
                updatedQueryParams[key] = currentValues;
              } else {
                delete updatedQueryParams[key];
              }

              this.form.patchValue({ offset: 0 }, { emitEvent: false });
              this.updatePageUrl(false, updatedQueryParams);
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
    const currentParams = this.queryParamsSignal();

    const filters: Record<string, string | number | string[]> = {
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

    // Read all remaining dynamic checkbox parameters straight from the Signal state
    Object.keys(currentParams).forEach((key) => {
      if (explicitKeys.has(key)) {
        return;
      }

      const rawValues = currentParams[key];
      const valueArray = Array.isArray(rawValues) ? rawValues : [rawValues];

      filters[key] = valueArray.map((val) => fromInputSafeName(String(val)));
    });

    return { filters } as CheckDataRequest;
  }

  isCheckboxChecked(filterName: string, option: string): boolean {
    const currentParams = this.queryParamsSignal();
    const queryParamValue = currentParams[filterName];
    if (!queryParamValue) return false;

    const safeName = toInputSafeName(option);
    return Array.isArray(queryParamValue)
      ? queryParamValue.includes(safeName)
      : String(queryParamValue) === safeName;
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
        delete cleanOps['excludedDatasetId'];

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
    const safeName = toInputSafeName(option);
    const currentParams = { ...this.queryParamsSignal() };
    const currentValuesRaw = currentParams[filterName] || [];

    let currentValues = Array.isArray(currentValuesRaw)
      ? [...currentValuesRaw]
      : [currentValuesRaw];

    if (currentValues.includes(safeName)) {
      currentValues = currentValues.filter((val) => val !== safeName);
    } else {
      currentValues.push(safeName);
    }

    if (currentValues.length > 0) {
      currentParams[filterName] = currentValues;
    } else {
      delete currentParams[filterName];
    }

    // Reset pagination cleanly via local object replacement mapping
    const finalParams = {
      ...currentParams,
      offset: 0
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: finalParams,
      queryParamsHandling: ''
    });
  }
}
