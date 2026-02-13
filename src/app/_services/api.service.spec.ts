import { apiSettings } from '../../environments/apisettings';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import { ClioCheck } from '../_models';
import { APIService } from './';

describe('API Service', () => {
  let service: APIService;
  let httpTesting: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    service = TestBed.inject(APIService);
    httpTesting = TestBed.inject(HttpTestingController);
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should group the runs by dataset id', () => {
    const grouped = service.groupChecksByDatasetId([
      {
        checkId: 1,
        datasetId: '1',
        percentInOperation: 10
      },
      {
        checkId: 1,
        datasetId: '1',
        percentInOperation: 10
      },
      {
        checkId: 1,
        datasetId: '2',
        percentInOperation: 10
      }
    ] as unknown as Array<ClioCheck>);
    expect(grouped).toBeTruthy();
  });

  it('should get the filtered reports', () => {
    service
      .getFiltereClioChecks({
        filters: {}
      })
      .subscribe((data: unknown) => {
        expect(data).toBeTruthy();
      });
  });

  it('should get the download', () => {
    const url = `${apiSettings.serverAPI}/download`;
    service.getDownload({
      filters: {},
      excluded_check_ids: []
    });
    const req = httpTesting.expectOne(url, 'post...');
    req.flush('csv');
    httpTesting.verify();
  });
});
