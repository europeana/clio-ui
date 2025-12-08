import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { APIService } from './_services';
import { MockAPIService } from './_mocked';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: APIService, useClass: MockAPIService }],
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should loadReportByBatchId', () => {
    component.loadReportByBatchId();
    expect(component).toBeTruthy();
  });

  it('should loadLatestReport', () => {
    component.loadLatestReport();
    expect(component).toBeTruthy();
  });

  it('should loadBatches', () => {
    component.loadBatches();
    expect(component).toBeTruthy();
  });

  it('should loadAvailableReports', () => {
    component.loadAvailableReports();
    expect(component).toBeTruthy();
  });
});
