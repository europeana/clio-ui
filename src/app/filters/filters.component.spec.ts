import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { FiltersComponent } from '.';
import { APIService } from '../_services';
import { MockAPIService } from '../_mocked';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;

  const params: BehaviorSubject<Params> = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({} as Params);

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [FiltersComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: {}, queryParams: {} }
        },
        {
          provide: APIService,
          useClass: MockAPIService
        }
      ]
    }).compileComponents();
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
});
