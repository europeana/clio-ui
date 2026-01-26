import { createServer, IncomingMessage, ServerResponse } from 'http';
import {
  BreakdownRequest,
  BreakdownResults
} from '../src/app/_models';
import { dataServerRequest } from '../src/app/_data/static/data-server';

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

  handleOptions(response: ServerResponse){
    response.setHeader(
      'Access-Control-Allow-Headers',
      'authorization,X-Requested-With,content-type'
    );
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,POST,PUT,DELETE,OPTIONS'
    );
    response.setHeader('Access-Control-Max-Age', '1800');
    response.setHeader(
      'Allow',
      'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH'
    );
    response.setHeader('Connection', 'Keep-Alive');
    response.end();
  }

  handleRequest(request: IncomingMessage, response: ServerResponse): void {

    if (request.method === 'OPTIONS') {
      this.handleOptions(response);
      return;
    }

    const route = (request.url as string).split('?')[0];

    if (request.method === 'POST') {
      let body = '';
      request.on('data', (chunk) => {
        body += chunk;
      });
      request.on('end', () => {

        const br = JSON.parse(body) as BreakdownRequest;

        if(route.match(/\/download/)) {

          this.headerText(response);

          const data = dataServerRequest(br);
          const csvData = JSON.stringify(data);

          // TODO transform to csv

          response.end(csvData);
          return;
        }
        if(route.match(/\/reports/)) {
          this.handleBreakdownRequest(response, br);
        }
      });
      return;
    }
    response.end({});
  }

  /** handleBreakdownRequest
  */
  handleBreakdownRequest(
    response: ServerResponse,
    breakdownRequest: BreakdownRequest
  ): void {
    this.headerJSON(response);
    response.end(JSON.stringify(dataServerRequest(breakdownRequest)));
  }
});
