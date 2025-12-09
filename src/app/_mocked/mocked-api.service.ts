import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AvailableReport, BatchItem } from '../_models';

export class MockAPIService {
  errorMode = false;

  getError<T>(msg: string): Observable<T> {
    return timer(1).pipe(
      switchMap(() => {
        return throwError(new Error(msg));
      }),
    );
  }

  reportByBatchId(_: string): Observable<string> {
    if (this.errorMode) {
      return this.getError('mock getDebiasReport throws error');
    }
    return of('');
  }
  latestReport(): Observable<string> {
    if (this.errorMode) {
      return this.getError('mock getDebiasReport throws error');
    }
    return of('');
  }
  batches(): Observable<Array<BatchItem>> {
    if (this.errorMode) {
      return this.getError('mock getDebiasReport throws error');
    }
    return of([{} as unknown as BatchItem]);
  }
  availableReports(): Observable<Array<AvailableReport>> {
    if (this.errorMode) {
      return this.getError('mock getDebiasReport throws error');
    }
    return of([{} as unknown as AvailableReport]);
  }
}

export class MockAPIServiceErrors extends MockAPIService {
  errorMode = true;
}
