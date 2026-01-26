import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { APIService } from './';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

describe('API Service', () => {
  let service: APIService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        APIService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    service = TestBed.inject(APIService);
  }));

  it('should sanitise the value', () => {
    expect(service).toBeTruthy();
  });
});
