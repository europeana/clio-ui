export type FilterParameterName =
  | 'provider'
  | 'dataProvider'
  | 'datasetId'
  | 'datasetName'
  | 'dateFrom'
  | 'dateTo'
  | 'checkId'
  | 'percentInOperation';

export interface CheckDataRequest {
  filters: {
    [details in FilterParameterName]: Array<string>;
  };
}

export interface DownloadRequest extends CheckDataRequest {
  excluded_check_ids?: Array<string>;
}

export interface CheckDataResults {
  filteringOptions: { [key: string]: Array<string> };
  results: Array<ClioCheck>;
}

export interface Dataset {
  id: number;
  datasetName: string;
  dataProvider: string;
  provider: string;
}

export interface ClioCheck {
  checkId: number;
  createdDate: string;
  datasetId: string;
  datasetName: string;
  provider: string;
  dataProvider: string;
  percentInOperation: number;
}

export interface CheckGroup {
  list: Array<ClioCheck>;
  opened: boolean;
  percentInOperation: number;
}

export interface ClioInfo {
  filterOps: { [key: string]: Array<string> };
  list: Array<ClioCheck>;
  datasetChecks: { [key: string]: CheckGroup };
  listLength: number;
  listAverageScore: number;
  titleMarkup: Array<{ label: string; fn?: () => void }>;
}
