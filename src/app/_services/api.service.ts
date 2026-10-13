import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CheckDataRequest,
  CheckDataResults,
  CheckGroup,
  ClioCheck,
  DownloadRequest
} from '../_models';
import { apiSettings } from '../../environments/apisettings';

@Injectable({ providedIn: 'root' })
export class APIService {
  constructor(private readonly http: HttpClient) {}

  /** groupChecksByDatasetId
   *  maps array entries - keys by dataset id,
   *  initialises the opened and percentLinksInOperation fields
   **/
  groupChecksByDatasetId(results: Array<ClioCheck>): {
    [key: string]: CheckGroup;
  } {
    const res: { [key: string]: CheckGroup } = {};

    results.forEach((run: ClioCheck) => {
      const id = run.datasetId;
      res[id] = {
        list: [run], // Initialize with our mapped dataset entry
        opened: false,
        percentLinksInOperation: run.percentLinksInOperation
      };
    });

    return res;
  }

  getFilteredClioChecks(
    request: CheckDataRequest
  ): Observable<CheckDataResults> {
    const originFilters = request.filters || {};
    const reshapedPayload = {
      filters: {
        provider: Array.isArray(originFilters.provider)
          ? originFilters.provider
          : [],
        dataProvider: Array.isArray(originFilters.dataProvider)
          ? originFilters.dataProvider
          : [],
        datasetId: Array.isArray(originFilters.datasetId)
          ? originFilters.datasetId
          : [],
        datasetName: Array.isArray(originFilters.datasetName)
          ? originFilters.datasetName
          : [],
        excludedDatasetId: Array.isArray(originFilters.excludedDatasetId)
          ? originFilters.excludedDatasetId
          : [],

        dateFrom:
          typeof originFilters.dateFrom === 'string'
            ? originFilters.dateFrom
            : '2026-01-01',
        dateTo:
          typeof originFilters.dateTo === 'string'
            ? originFilters.dateTo
            : '2026-12-31',
        percentLinksInOperationFrom: Number(
          originFilters.percentLinksInOperationFrom || 0
        ),
        percentLinksInOperationTo: Number(
          originFilters.percentLinksInOperationTo || 100
        )
      },
      pagination: {
        offset: Number(originFilters.offset || 0),
        limit: Number(originFilters.limit || 25)
      }
    };

    return this.http
      .post<CheckDataResults>(
        `${apiSettings.serverAPI}/datasets`,
        reshapedPayload
      )
      .pipe(
        map((cdr: CheckDataResults) => {
          // Fallback parsing handles untyped response payload roots safely
          const rawResponse = cdr as unknown as Record<string, unknown>;
          const rawDatasets = (rawResponse['datasets'] ||
            cdr.results ||
            []) as Array<Record<string, unknown>>;

          const mappedResults: ClioCheck[] = rawDatasets.map((dataset) => {
            return {
              datasetId: String(dataset['datasetId'] || 'N/A'),
              datasetName: String(dataset['datasetName'] || 'Unnamed Dataset'),
              datasetSize: Number(dataset['datasetSize'] || 0),
              datasetLastIndex: String(
                dataset['datasetLastIndex'] || '2026-01-01'
              ),
              provider: String(dataset['provider'] || 'N/A'),
              dataProvider: String(dataset['dataProvider'] || 'N/A'),
              percentLinksInOperation: Number(
                dataset['percentLinksInOperation'] || 0
              ),
              id:
                Number(dataset['datasetId']) ||
                Math.floor(Math.random() * 10000),
              date: String(
                dataset['datasetLastIndex'] || new Date().toISOString()
              )
            };
          });

          const realFilters = { ...cdr.filterOptions };
          delete realFilters['limit'];
          delete realFilters['offset'];
          delete realFilters['percentLinksInOperationFrom'];

          return {
            filterOptions: realFilters,
            results: mappedResults
          };
        })
      );
  }

  async download(data: string, downloadName: string): Promise<void> {
    const anchor = document.createElement('a');
    anchor.className = 'download-anchor';
    anchor.href = window.URL.createObjectURL(
      new Blob([data], { type: 'text/csv;charset=utf-8' })
    );
    anchor.target = '_blank';
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  getDownload(request: DownloadRequest): void {
    this.http
      .post(`${apiSettings.serverAPI}/runs/links/export`, request, {
        responseType: 'text'
      })
      .pipe(
        catchError(() => {
          return of('CSV_DOWNLOAD');
        })
      )
      .subscribe((data: unknown) => {
        this.download(data as string, 'clio_report');
      });
  }
}
