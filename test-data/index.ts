import { createServer, IncomingMessage, ServerResponse } from 'http';
import { AvailableReport } from '../src/app/_models';

const fakeData: Array<AvailableReport> = [
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
    const defResult:Array<AvailableReport> = [];

    this.headerJSON(response);

    if(route.match(/\/available-reports/)) {
      response.end(JSON.stringify({ data: 'available-reports' }));
      return;
    }
    if(route.match(/\/batches/)) {
      response.end(JSON.stringify(fakeData));
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
