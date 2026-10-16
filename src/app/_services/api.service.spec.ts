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

import { firstValueFrom } from 'rxjs';

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

  it('should get the filtered reports', async () => {
    const mockRequest = {
      filters: {
        provider: ['AWS'],
        dataProvider: ['Europeana'],
        datasetId: ['71'],
        datasetName: ['ArchiveExpress'],
        excludedDatasetId: ['99'],
        dateFrom: '2026-06-01',
        dateTo: '2026-08-31',
        percentLinksInOperationFrom: 20,
        percentLinksInOperationTo: 80,
        offset: 50,
        limit: 10
      }
    } as unknown as CheckDataRequest;

    const reportsPromise = firstValueFrom(
      service.getFilteredClioChecks(mockRequest)
    );
    const url = `${apiSettings.serverAPI}/datasets`;
    const req = httpTesting.expectOne(url);
    const sentBody = req.request.body;
    expect(sentBody.filters.provider).toEqual(['AWS']);
    expect(sentBody.filters.dateFrom).toBe('2026-06-01');
    expect(sentBody.filters.percentLinksInOperationFrom).toBe(20);
    expect(sentBody.pagination.offset).toBe(50);

    req.flush({ filterOptions: {}, results: [] });
    await reportsPromise;
    httpTesting.verify();
  });

  it('should get the filtered reports (missing or invalid)', async () => {
    const mockRequest = {
      filters: {
        provider: 'not-an-array',
        dataProvider: null,
        datasetId: undefined,
        datasetName: {},
        excludedDatasetId: 42,
        dateFrom: 12345,
        dateTo: null,
        percentLinksInOperationFrom: '',
        percentLinksInOperationTo: '',
        offset: '',
        limit: ''
      }
    } as unknown as CheckDataRequest;

    const reportsPromise = firstValueFrom(
      service.getFilteredClioChecks(mockRequest)
    );

    const url = `${apiSettings.serverAPI}/datasets`;
    const req = httpTesting.expectOne(url);

    const sentBody = req.request.body;
    expect(sentBody.filters.provider).toEqual([]);
    expect(sentBody.filters.dataProvider).toEqual([]);
    expect(sentBody.filters.datasetId).toEqual([]);
    expect(sentBody.filters.datasetName).toEqual([]);
    expect(sentBody.filters.excludedDatasetId).toEqual([]);
    expect(sentBody.filters.dateFrom).toBe('2026-01-01');
    expect(sentBody.filters.dateTo).toBe('2026-12-31');
    expect(sentBody.filters.percentLinksInOperationFrom).toBe(0);
    expect(sentBody.filters.percentLinksInOperationTo).toBe(100);
    expect(sentBody.pagination.offset).toBe(0);
    expect(sentBody.pagination.limit).toBe(25);

    req.flush({ filterOptions: {}, results: [] });
    await reportsPromise;
    httpTesting.verify();
  });

  it('should map the filtered reports', async () => {
    const mockChecksPayload = [
      {
        runId: 101,
        percentLinksInOperation: 95,
        startingTime: '2026-10-16'
      }
    ];

    const checksPromise = firstValueFrom(
      service.getDatasetRuns('DS-1', 'Name', 'Prov', 'DataProv')
    );

    const url = `${apiSettings.serverAPI}/runs?datasetId=DS-1`;
    const req = httpTesting.expectOne(url);

    req.flush(mockChecksPayload);
    httpTesting.verify();

    const checks = await checksPromise;

    expect(checks).toHaveLength(1);
    expect(checks[0].id).toBe(101);
    expect(checks[0].datasetName).toBe('Name');
  });

  it('should get the download', () => {
    const url = `${apiSettings.serverAPI}/runs/links/export`;
    const mockRequest = {
      filterOptions: {},
      excluded_check_ids: []
    } as unknown as DownloadRequest;

    service.getDownload(mockRequest);

    const req = httpTesting.expectOne(url);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
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
