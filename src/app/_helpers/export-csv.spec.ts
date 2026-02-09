import { TestBed, waitForAsync } from '@angular/core/testing';
import { ExportCSVService } from './export-csv';

describe('ExportCSVService', () => {
  let service: ExportCSVService;
  const timestamp = new Date().toISOString();
  const dataProvider =
    'Institute for Bulgarian Language of the Bulgarian Academy of Science';

  const testRuns = [
    {
      runId: 2,
      datasetId: '11',
      datasetName: 'dataset_11',
      creationTime: timestamp,
      dataProvider: dataProvider,
      provider: 'Daguerreobase',
      percentInOperation: 14,
      url: 'http://123'
    },
    {
      runId: 1,
      datasetId: '12',
      datasetName: 'dataset_12',
      creationTime: timestamp,
      dataProvider: dataProvider,
      provider: 'Daguerreobase',
      percentInOperation: 81,
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
      'id,dataset-id,dataset-name,creation-time,data-provider,provider,percent-in-operation,url';
    const line2 = `2,"11","dataset_11","${timestamp}","${dataProvider}","Daguerreobase",14,"http://123"`;
    const line3 = `1,"12","dataset_12","${timestamp}","${dataProvider}","Daguerreobase",81,"http://456"`;

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
