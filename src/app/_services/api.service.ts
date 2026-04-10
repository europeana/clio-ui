import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
   *  initialises the opened and percentInOperation fields
   **/
  groupChecksByDatasetId(results: Array<ClioCheck>): {
    [key: string]: CheckGroup;
  } {
    const res: { [key: string]: CheckGroup } = {};
    const mapped = results.reduce(
      (map: { [key: string]: Array<ClioCheck> }, run: ClioCheck) => {
        const id = run.datasetId;
        map[id] = map[id] ?? [];
        map[id].push(run);
        return map;
      },
      {}
    );

    Object.keys(mapped).forEach((id: string) => {
      const list = mapped[id];
      const percentInOperation = Math.floor(
        list.reduce((sum, obj) => sum + obj.percentInOperation, 0) / list.length
      );
      res[id] = {
        list,
        opened: false,
        percentInOperation
      };
    });
    return res;
  }

  getFilteredClioChecks(
    request: CheckDataRequest
  ): Observable<CheckDataResults> {
    return this.http
      .post<CheckDataResults>(`${apiSettings.serverAPI}/runs/summary`, request)
      .pipe(
        map((cdr: CheckDataResults) => {
          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            limit: _,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            offset: __,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            percentLinksInOperationFrom: ___,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            percentLinksInOperationTo: ____,
            ...realFilters
          } = cdr.filterOptions;
          return {
            filterOptions: realFilters,
            results: cdr.results
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
    document.body.removeChild(anchor);
  }

  getDownload(request: DownloadRequest): void {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain; charset=utf-8'
    );
    this.http
      .post(`${apiSettings.serverAPI}/reports`, request, {
        headers: headers,
        responseType: 'text'
      })
      .pipe(
        catchError(() => {
          console.log('download request:' + JSON.stringify(request, null, 4));
          return of('CSV_DOWNLOAD');
        })
      )
      .subscribe((data: unknown) => {
        this.download(data as string, 'clio_report');
      });
  }
}
