export type FilterParameterName =
  | 'provider'
  | 'dataProvider'
  | 'datasetId'
  | 'datasetName'
  | 'dateFrom'
  | 'dateTo'
  | 'id'
  | 'offset'
  | 'limit'
  | 'percentLinksInOperationFrom'
  | 'excludedDatasetId'
  | 'percentLinksInOperationTo';

export interface CheckDataRequest {
  filters: {
    [details in FilterParameterName]?: Array<string> | string | number;
  };
}

export interface DownloadRequest extends CheckDataRequest {
  excluded_check_ids?: Array<string>;
}

export interface CheckDataResults {
  filterOptions: { [key: string]: Array<string> };
  results: Array<ClioCheck>;
}

export interface DatasetSummary {
  datasetId: string;
  datasetName: string;
  provider: string;
  dataProvider: string;
  percentLinksInOperation: number;
  datasetSize: number;
  datasetLastIndex: string;
}

export interface DatasetRun {
  runId: number;
  startingTime: string;
  percentLinksInOperation: number;
}

export interface ClioCheck {
  datasetId: string;
  datasetName: string;
  provider: string;
  dataProvider: string;
  percentLinksInOperation: number;

  // Pre-aggregated dataset summary parameters
  datasetSize?: number;
  datasetLastIndex?: string;

  // Standalone run parameters (Optional for lazy-loaded sub-rows)
  id?: number;
  date?: string;
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
