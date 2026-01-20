export interface InputDescription {
  controlName: string;
  group: string;
}

/*
export interface ReportItem {
  datasetId: number;
  portalUrl: string;
  datasetSize: number;
  provider: string;
  dataProvider: string;
  recordId: string;
  lastRecordIndex: string;
  //  recordEdmType: "TEXT",
  recordEdmType: string;
  recordContentTier: number;
  recordMetadataTier: number | string;
  linkType: string;
  link: string;
  linkServer: string;
  timeOfChecking: string;
  error: string;
}
*/

//////////////////

export interface Dataset {
  id: number;
  name: string;
  size: number;
  dataProvider: string;
  provider: string;
  lastIndexTime: string;
}

export interface Run {
  id: number;
  creationTime: string;
  datasetId: number;
  batchId: number;
  reportId: number;
  score: number;
  url: string;
}

export interface Run_DATA extends Run {
  provider: string;
  dataProvider: string;
}

export interface Link {
  id: string;
  runId: number;
  recordId: string;
  recordEdmType: string;
  recordContentTier: string;
  recordMetadataTier: string;
  linkType: string;
  linkServer: string;
  linkUrl: string;
  error?: string;
  checkTime: string;
}

export interface ClioInfo {
  list: Array<Run>;
  listLength: number;
  listAverageScore: number;
}
