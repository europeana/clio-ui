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

  it('should generate the title', () => {
    expect(component.generateTitle()).toBeTruthy();
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
});
