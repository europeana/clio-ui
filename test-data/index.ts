import { createServer, IncomingMessage, ServerResponse } from 'http';

const fakeData = [
  {
    "reportId": 1281,
    "batchId": 1291,
    "creationTime": "2025-12-04T04:47:48.616Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1291"
  },
  {
    "reportId": 1280,
    "batchId": 1290,
    "creationTime": "2025-11-27T04:48:32.112Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1290"
  },
  {
    "reportId": 1247,
    "batchId": 1257,
    "creationTime": "2025-11-20T04:52:35.179Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1257"
  },
  {
    "reportId": 1214,
    "batchId": 1224,
    "creationTime": "2025-11-13T04:48:34.666Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1224"
  },
  {
    "reportId": 1213,
    "batchId": 1223,
    "creationTime": "2025-11-06T04:45:34.428Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1223"
  },
  {
    "reportId": 1212,
    "batchId": 1222,
    "creationTime": "2025-10-30T04:46:04.106Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1222"
  },
  {
    "reportId": 1179,
    "batchId": 1189,
    "creationTime": "2025-10-23T04:51:25.016Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1189"
  },
  {
    "reportId": 1178,
    "batchId": 1188,
    "creationTime": "2025-10-16T04:48:07.627Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1188"
  },
  {
    "reportId": 1177,
    "batchId": 1187,
    "creationTime": "2025-10-09T04:46:47.630Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1187"
  },
  {
    "reportId": 1144,
    "batchId": 1154,
    "creationTime": "2025-10-02T04:46:31.077Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1154"
  },
  {
    "reportId": 1111,
    "batchId": 1121,
    "creationTime": "2025-09-25T04:47:34.284Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1121"
  },
  {
    "reportId": 1110,
    "batchId": 1120,
    "creationTime": "2025-09-18T04:50:56.334Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1120"
  },
  {
    "reportId": 1109,
    "batchId": 1119,
    "creationTime": "2025-09-11T04:48:09.743Z",
    "url": "https://clio-reporting-rest.test.eanadev.org/report-by-batch-id?batchId=1119"
  }
];

new (class {
  serverName = 'Clio';
  port = 3000;

  constructor() {
    createServer((request: IncomingMessage, response: ServerResponse): void => {
      this.headerAccess(response);
      this.handleRequest(request, response);
    }).listen(this.port, () => {
      console.log(`test server "${this.serverName}" is listening on ${this.port}`);
    });
  }

  get404(): string {
    return '<h2>404</h2>';
  }

  headerAccess(response: ServerResponse): void {
    response.setHeader('Access-Control-Allow-Origin', '*');
  }

  headerJSON(response: ServerResponse): void {
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
  }

  headerText(response: ServerResponse): void {
    response.setHeader('Content-Type', 'text/html;charset=UTF-8');
  }

  handleRequest(request: IncomingMessage, response: ServerResponse): void {
    const route = (request.url as string).split('?')[0];
    const defResult:Array<unknown> = [];

    this.headerJSON(response);

    if(route === '/search') {
      response.end(JSON.stringify(fakeData));
      return;
    }
    /*
    */

    if(route.match(/\/available-reports/)) {
      response.end(JSON.stringify({ data: 'available-reports' }));
      return;
    }
    if(route.match(/\/batches/)) {
      response.end(JSON.stringify({ data: 'batches' }));
      return;
    }
    if(route.match(/\/latest-report/)) {
      response.end(JSON.stringify({ data: 'latest-report' }));
      return;
    }
    if(route === '/report-by-batch-id') {
      response.end(JSON.stringify({ data: 'report-by-batch-id' }));
      return;
    }

    response.end(JSON.stringify(defResult));
  }
});
