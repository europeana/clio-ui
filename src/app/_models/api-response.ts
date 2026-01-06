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

// implicit models in Java code
/*

public class Dataset {

  private final String datasetId;
  private final String name;
  private final Integer size;
  private final Instant lastIndexTime;
  private final String provider;
  private final String dataProvider;
}


public class Link { // (to be checked once as part of a run)

  private final long linkId;
  private final String recordId;
  private final Instant recordLastIndexTime;
  private final String recordEdmType;
  private final String recordContentTier;
  private final String recordMetadataTier;

  private final LinkType linkType;    = 'isShownAt' / 'isShownBy'

  private final String linkUrl;
  private final String server;
  private final String error;
  private final Instant checkingTime;



 public class Report {
     private final long reportId;
     private final long batchId;
     private final long creationTime;
     private final String reportString;



 public class Run {
       private final long runId;
       private final Instant startingTime;
       private final Dataset dataset;

*/
