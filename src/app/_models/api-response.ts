export interface AvailableReport {
  reportId: number;
  batchId: number;
  creationTime: string;
  url: string;
}

export interface BatchItem {
  creationTime: string;
  lastUpdateTimeInSolr: string;
  lastUpdateTimeInMetisCore: string;
  datasetsExcludedAlreadyRunning: number;
  datasetsExcludedNotIndexed: number;
  datasetsExcludedWithoutLinks: number;
  datasetsProcessed: number;
  datasetsPending: number;
}
