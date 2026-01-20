import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListingComponent } from '.';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fixture: ComponentFixture<ListingComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [ListingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: []
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(ListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
