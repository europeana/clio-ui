import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockAPIService } from '../_mocked';
import { APIService } from '../_services';
import { ListingComponent } from '.';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fixture: ComponentFixture<ListingComponent>;
  let api: APIService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [ListingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: APIService,
          useClass: MockAPIService
        }
      ]
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(ListingComponent);
    component = fixture.componentInstance;
    api = TestBed.inject(APIService);
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the preview', () => {
    jest.spyOn(api, 'loadLatestReportJSON');
    component.openPreview(123);
    expect(api.loadLatestReportJSON).toHaveBeenCalled();
    expect(component.previewedId).toBeTruthy();

    component.openPreview(123);
    expect(api.loadLatestReportJSON).toHaveBeenCalledTimes(1);
    expect(component.previewedId).toBeFalsy();
  });
});
