import { Injectable } from '@angular/core';
import { AvailableReport, BatchItem } from '../_models';

@Injectable({ providedIn: 'root' })
export class ExportCSVService {
  headersAvailableReport: Array<string> = [
    'report-id',
    'batch-id',
    'creation-time',
    'url',
  ];

  fieldNamesAvailableReport = ['reportId', 'batchId', 'creationTime', 'url'];

  headersBatchItem: Array<string> = [
    'creation-time',
    'last-update-time-in-solr',
    'datasets-excluded-already-running',
    'datasets-excluded-not-indexed',
    'datasets-excluded-without-links',
    'datasets-processed',
    'datasets-pending',
  ];

  fieldNamesBatchItem = [
    'creationTime',
    'lastUpdateTimeInSolr',
    'lastUpdateTimeInMetisCore',
    'datasetsExcludedAlreadyRunning',
    'datasetsExcludedNotIndexed',
    'datasetsExcludedWithoutLinks',
    'datasetsProcessed',
    'datasetsPending',
  ];

  sanitiseVal(str: string): string {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  pushToTuple(
    arr: Array<string | number | undefined>,
    val: string | number | undefined,
  ): void {
    val = val && typeof val === 'string' ? this.sanitiseVal(val) : val;
    arr.push(val);
  }

  getTuple(padding: number): Array<string | number | undefined> {
    const res: Array<string | number | undefined> = [];
    new Array(padding).fill(null).forEach(() => {
      res.push(undefined);
    });
    return res;
  }

  csvFromBatchItem(items: Array<BatchItem>): string {
    const tuples: Array<Array<string | number | undefined>> = [];
    let tuple: Array<string | number | undefined> = [];

    items.forEach((item: BatchItem) => {
      this.fieldNamesBatchItem.forEach((fieldName: string) => {
        this.pushToTuple(tuple, item[fieldName as keyof BatchItem]);
      });
      tuples.push(tuple);
      tuple = this.getTuple(0);
    });

    return this.joinCSV(this.headersBatchItem, tuples);
  }

  csvFromAvailableReport(items: Array<AvailableReport>): string {
    const tuples: Array<Array<string | number | undefined>> = [];
    let tuple: Array<string | number | undefined> = [];

    items.forEach((item: AvailableReport) => {
      this.fieldNamesAvailableReport.forEach((fieldName: string) => {
        this.pushToTuple(tuple, item[fieldName as keyof AvailableReport]);
      });
      tuples.push(tuple);
      tuple = this.getTuple(0);
    });
    return this.joinCSV(this.headersAvailableReport, tuples);
  }

  joinCSV(
    headers: Array<string>,
    tuples: Array<Array<string | number | undefined>>,
  ): string {
    return (
      headers.join(',') +
      '\n\r' +
      tuples
        .map((tuple: Array<string | number | undefined>) => {
          return tuple.join(',');
        })
        .join('\n')
    );
  }

  async download(data: string, downloadName: string): Promise<void> {
    const anchor = document.createElement('a');
    anchor.href = window.URL.createObjectURL(
      new Blob([data], { type: 'text/csv;charset=utf-8' }),
    );
    anchor.target = '_blank';
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
