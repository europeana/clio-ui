import { signal } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  CheckDataRequest,
  CheckDataResults,
  CheckGroup,
  ClioCheck
} from '../_models';

export class MockAPIService {
  errorMode = false;
  isDownloading = signal(false);

  getError<T>(msg: string): Observable<T> {
    return timer(1).pipe(
      switchMap(() => {
        return throwError(new Error(msg));
      })
    );
  }

  groupChecksByDatasetId(_: Array<ClioCheck>): { [key: string]: CheckGroup } {
    return {} as { [key: string]: CheckGroup };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getDownload(_: CheckDataRequest): void {}

  getFilteredClioChecks(_: CheckDataRequest): Observable<CheckDataResults> {
    if (this.errorMode) {
      return this.getError('mock getFilteredClioChecks throws error');
    }
    return of({
      filterOptions: {
        datasetId: [''],
        datasetName: ['']
      },
      results: [],
      pagination: {
        hasMoreAvailable: false,
        limit: 0,
        offset: 0
      }
    } as CheckDataResults);
  }

  getDatasetRuns(): Observable<Array<ClioCheck>> {
    if (this.errorMode) {
      return this.getError('mock getDatasetRuns throws error');
    }
    return of([]);
  }
}

export class MockAPIServiceErrors extends MockAPIService {
  errorMode = true;
}
