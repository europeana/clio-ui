import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle the field change and emit inverted value', () => {
    const spyEmit = jest.spyOn(component.valueChanged, 'emit');
    fixture.componentRef.setInput('checked', false);
    fixture.detectChanges();
    component.onChange();
    expect(spyEmit).toHaveBeenCalledWith(true);
  });

  it('should handle the space key with structural metadata payloads', () => {
    const spyEmit = jest.spyOn(component.keySelectionMade, 'emit');

    fixture.componentRef.setInput('group', 'provider');
    fixture.componentRef.setInput('controlName', 'AthenaPlus');
    fixture.detectChanges();

    component.onSpaceKey();

    expect(spyEmit).toHaveBeenCalledWith({
      group: 'provider',
      controlName: 'AthenaPlus'
    });
  });
});
