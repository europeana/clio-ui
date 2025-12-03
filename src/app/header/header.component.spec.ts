import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from '.';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
