import { createServer, IncomingMessage, ServerResponse } from 'http';
import {
  CheckDataRequest,
  CheckDataResults
} from './src-copy/api-request.mjs';

import { dataServerRequest } from './data-server.mjs';

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
    response.writeHead(200, {'Content-Type':'text/csv;charset=utf-8'});
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
        const br = JSON.parse(body) as CheckDataRequest;
        if(route.match(/\/download/)) {
          this.headerText(response);
          const data = dataServerRequest(br).results;
          /*
          const srv = new ExportCSVService();
          const csvData = srv.csvFromClioChecks(data);
          response.end(csvData);
          */
          response.end(data);
        }
        else if(route.match(/\/runs\/summary/)) {
          this.handleCheckDataRequest(response, br);
        }
      });
    }
  }

  /** handleCheckDataRequest
  */
  handleCheckDataRequest(
    response: ServerResponse,
    dataRequest: CheckDataRequest
  ): void {
    this.headerJSON(response);
    response.end(JSON.stringify(dataServerRequest(dataRequest)));
  }
});
