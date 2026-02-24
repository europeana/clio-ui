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

  getFiltereClioChecks(_: CheckDataRequest): Observable<CheckDataResults> {
    if (this.errorMode) {
      return this.getError('mock getFiltereClioChecks throws error');
    }
    return of({
      filteringOptions: {},
      results: []
    } as CheckDataResults);
  }
}

export class MockAPIServiceErrors extends MockAPIService {
  errorMode = true;
}
