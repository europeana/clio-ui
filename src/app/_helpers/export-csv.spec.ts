import { TestBed, waitForAsync } from '@angular/core/testing';
import { ExportCSVService } from './';

describe('ExportCSVService', () => {
  let service: ExportCSVService;
  const timestamp = new Date().toISOString();
  const dataProvider =
    'Institute for Bulgarian Language of the Bulgarian Academy of Science';

  const testRuns = [
    {
      id: 2,
      reportId: 4,
      datasetId: 11,
      batchId: 2,
      creationTime: timestamp,
      dataProvider: dataProvider,
      provider: 'Daguerreobase',
      score: 14,
      url: 'http://123'
    },
    {
      id: 1,
      reportId: 5,
      datasetId: 12,
      batchId: 2,
      creationTime: timestamp,
      dataProvider: dataProvider,
      provider: 'Daguerreobase',
      score: 81,
      url: 'http://456'
    }
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [ExportCSVService]
    }).compileComponents();
    service = TestBed.inject(ExportCSVService);
  }));

  it('should sanitise the value', () => {
    expect(service.sanitiseVal('"')).toEqual('""""');
  });

  it('should convert', () => {
    const res = service.csvFromRuns(testRuns);
    expect(res).toBeTruthy();

    const line1 =
      'id,dataset-id,batch-id,report-id,creation-time,data-provider,provider,score,url';
    const line2 = `2,11,2,4,"${timestamp}","${dataProvider}","Daguerreobase",14,"http://123"`;
    const line3 = `1,12,2,5,"${timestamp}","${dataProvider}","Daguerreobase",81,"http://456"`;

    expect(res).toEqual(`${line1}\n\r${line2}\n${line3}`);
  });

  it('should get the tuple', () => {
    expect(service.getTuple(3).length).toEqual(3);
  });

  /*
  it('should download', () => {
    jest.spyOn(window.URL, 'createObjectURL');
    expect(service.download('', '')).toBeTruthy();
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });
  */
});
