export type FilterParameterName =
  | 'provider'
  | 'dataProvider'
  | 'datasetId'
  | 'datasetName'
  | 'dateFrom'
  | 'dateTo'
  | 'id'
  // TODO: these are not actually arrays...
  | 'offset'
  | 'limit'
  | 'percentLinksInOperationFrom'
  | 'percentLinksInOperationTo';

export interface CheckDataRequest {
  filters: {
    [details in FilterParameterName]: Array<string>;
  };
}

export interface DownloadRequest extends CheckDataRequest {
  excluded_check_ids?: Array<string>;
}

export interface CheckDataResults {
  filterOptions: { [key: string]: Array<string> };
  results: Array<ClioCheck>;
}

export interface Dataset {
  id: number;
  datasetName: string;
  dataProvider: string;
  provider: string;
}

export interface ClioCheck {
  id: number;
  date: string;
  datasetId: string;
  datasetName: string;
  provider: string;
  dataProvider: string;
  percentLinksInOperation: number;
}

export interface CheckGroup {
  list: Array<ClioCheck>;
  opened: boolean;
  percentLinksInOperation: number;
}

export interface ClioInfo {
  filterOps: { [key: string]: Array<string> };
  list: Array<ClioCheck>;
  datasetChecks: { [key: string]: CheckGroup };
  listLength: number;
  listAverageScore: number;
  titleMarkup: Array<{ label: string; fn?: () => void }>;
}
