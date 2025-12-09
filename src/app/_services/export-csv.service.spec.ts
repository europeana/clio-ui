import { TestBed, waitForAsync } from '@angular/core/testing';
import { AvailableReport } from '../_models';
import { ExportCSVService } from './';

describe('ExportCSVService', () => {
  let service: ExportCSVService;
  const timestamp = new Date().toISOString();

  const testAvailableReports = [
    {
      reportId: 1,
      batchId: 2,
      creationTime: timestamp,
      url: 'https://clio-reporting/1?batchId=2',
    },
    {
      reportId: 1,
      batchId: 2,
      creationTime: timestamp,
      url: 'https://clio-reporting/2?batchId=2',
    },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [ExportCSVService],
    }).compileComponents();
    service = TestBed.inject(ExportCSVService);
  }));

  it('should sanitise the value', () => {
    expect(service.sanitiseVal('"')).toEqual('""""');
  });

  it('should convert', () => {
    const res = service.csvFromAvailableReport(testAvailableReports);
    expect(res).toBeTruthy();

    /* eslint-disable max-len */
    const line1 = 'report-id,batch-id,creation-time,url';

    const line2 = `1,2,"${timestamp}","https://clio-reporting/1?batchId=2"`;
    const line3 = `1,2,"${timestamp}","https://clio-reporting/2?batchId=2"`;

    expect(res).toEqual(`${line1}\n\r${line2}\n${line3}`);
  });

  it('should get the tuple', () => {
    expect(service.getTuple(3).length).toEqual(3);
  });
});
