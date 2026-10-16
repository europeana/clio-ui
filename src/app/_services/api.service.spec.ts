import { apiSettings } from '../../environments/apisettings';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import { CheckDataRequest, ClioCheck, DownloadRequest } from '../_models';
import { APIService } from './';

describe('API Service', () => {
  let service: APIService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(APIService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should group the runs by dataset id', () => {
    const grouped = service.groupChecksByDatasetId([
      {
        id: 1,
        datasetId: '1',
        percentLinksInOperation: 10
      },
      {
        id: 1,
        datasetId: '1',
        percentLinksInOperation: 10
      },
      {
        id: 1,
        datasetId: '2',
        percentLinksInOperation: 10
      }
    ] as unknown as Array<ClioCheck>);
    expect(grouped).toBeTruthy();
  });

  it('should get the filtered reports', () => {
    const param = {
      filters: {
        limit: '5',
        offset: '0'
      }
    } as CheckDataRequest;

    service.getFilteredClioChecks(param).subscribe((data: unknown) => {
      expect(data).toBeTruthy();
    });

    const url = `${apiSettings.serverAPI}/datasets`;
    const req = httpTesting.expectOne(url);
    req.flush({ filterOptions: {} });
    httpTesting.verify();
  });

  it('should map the filtered reports', () => {
    const mockChecksPayload = [
      { id: 101, datasetId: 'DS-1', percentLinksInOperation: 95 }
    ];

    service
      .getDatasetRuns('DS-1', 'Name', 'Prov', 'DataProv')
      .subscribe((checks) => {
        expect(checks.length).toBe(1);
        expect(checks[0].id).toBe(101);
      });

    const url = `${apiSettings.serverAPI}/runs?datasetId=DS-1`;
    const req = httpTesting.expectOne(url);

    req.flush(mockChecksPayload);
    httpTesting.verify();
  });

  it('should get the download', () => {
    const url = `${apiSettings.serverAPI}/runs/links/export`;
    service.getDownload({
      filterOptions: {},
      excluded_check_ids: []
    } as unknown as DownloadRequest);
    const req = httpTesting.expectOne(url);
    req.flush('csv');
    httpTesting.verify();
  });

  it('should get the download (error)', () => {
    const url = `${apiSettings.serverAPI}/runs/links/export`;
    const mockRequest = {
      filterOptions: {},
      excluded_check_ids: []
    } as unknown as DownloadRequest;
    const downloadSpy = jest
      .spyOn(service, 'download')
      .mockResolvedValue(undefined);

    service.getDownload(mockRequest);
    const req = httpTesting.expectOne(url);
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });
    expect(downloadSpy).toHaveBeenCalledWith('CSV_DOWNLOAD', 'clio_report');
    httpTesting.verify();
  });
});
