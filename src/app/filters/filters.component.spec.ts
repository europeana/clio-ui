import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { BehaviorSubject } from 'rxjs';
import { FiltersComponent } from '.';
import { APIService } from '../_services';
import { MockAPIService } from '../_mocked';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;

  let router: Router;
  const params: BehaviorSubject<Params> = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({} as Params);

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [FiltersComponent, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: {}, queryParams }
        },
        {
          provide: APIService,
          useClass: MockAPIService
        }
      ]
    }).compileComponents();
    router = TestBed.inject(Router);
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate the title markup', () => {
    component.ngOnInit();
    expect(component.generateTitleMarkup().length).toBeTruthy();
  });

  it('should summarise by batchId', () => {
    jest.spyOn(component, 'updatePageUrl');
    component.ngOnInit();
    component.summariseBatchId(1);
    expect(component.updatePageUrl).toHaveBeenCalled();
  });

  it('should summarise by datasetId', () => {
    jest.spyOn(component, 'updatePageUrl');
    component.ngOnInit();
    component.summariseDatasetId(1);
    expect(component.updatePageUrl).toHaveBeenCalled();
  });

  it('should update the page location', () => {
    jest.spyOn(router, 'navigate');
    component.ngOnInit();
    fixture.detectChanges();
    component.updatePageUrl();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should react to the page params (dataset-id)', () => {
    jest.spyOn(component, 'loadData');
    component.ngOnInit();
    fixture.detectChanges();
    queryParams.next({ 'dataset-id': '1' });
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should react to the page params (batch-id)', () => {
    jest.spyOn(component, 'loadData');
    component.ngOnInit();
    fixture.detectChanges();
    queryParams.next({ 'batch-id': '1' });
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should react to the page params (from-date)', () => {
    jest.spyOn(component, 'loadData');
    component.ngOnInit();
    fixture.detectChanges();
    queryParams.next({ 'date-from': '2026-01-06' });
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should react to the page params (to-date)', () => {
    jest.spyOn(component, 'loadData');
    component.ngOnInit();
    fixture.detectChanges();
    queryParams.next({ 'date-to': '2026-01-06' });
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should react to the page params (provider)', () => {
    jest.spyOn(component, 'loadData');
    component.ngOnInit();
    fixture.detectChanges();
    queryParams.next({
      provider: ['My Provider', 'My Other Provider']
    });
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should get the set checkbox values', () => {
    component.ngOnInit();
    fixture.detectChanges();
    jest.spyOn(component, 'loadData');

    expect(component.getSetCheckboxValues('provider').length).toBeFalsy();
    component.form.patchValue({
      provider: ['my_provider']
    });
    //expect(component.getSetCheckboxValues('provider').length).toBeTruthy();
  });
});
