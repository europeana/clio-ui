export interface InputDescription {
  controlName: string;
  group: string;
}

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
