import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { APIService } from './_services';
import { MockAPIService, MockAPIServiceErrors } from './_mocked';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let api: APIService;

  const configureTestbed = (errorMode = false): void => {
    console.log('errorMode = ' + errorMode + ', api ' + api);

    TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        }
      ]
    }).compileComponents();
    api = TestBed.inject(APIService);
  };

  describe('Normal Operations', () => {
    beforeEach((): void => {
      configureTestbed();
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  /*
  describe('Errors', () => {
    beforeEach((): void => {
      configureTestbed(true);
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      component.showSwaggerEndpoints = true;
      fixture.detectChanges();
    });

  });
  */
});
