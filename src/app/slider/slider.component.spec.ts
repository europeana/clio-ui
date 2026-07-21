import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SliderComponent } from './slider.component';

// Wrapper component to mimic exactly how parent templates consume the slider
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SliderComponent],
  template: `
    <form [formGroup]="testForm">
      <app-slider
        formControlName="sliderVal"
        (valueChange)="onSliderChange($event)"
      ></app-slider>
    </form>
  `
})
class TestHostComponent {
  testForm!: FormGroup;
  constructor(private fb: FormBuilder) {
    this.testForm = this.fb.group({
      sliderVal: [null]
    });
  }
  onSliderChange(_: number | null): void {}
}

describe('SliderComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let sliderComponent: SliderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;

    fixture.detectChanges(); // Triggers host initializations

    // Resolve the embedded child component instance cleanly
    const sliderDebugEl = fixture.debugElement.query(
      By.directive(SliderComponent)
    );
    sliderComponent = sliderDebugEl.componentInstance;
  });

  it('should create', () => {
    expect(sliderComponent).toBeTruthy();
  });

  it('should pass value down from parent form to internal control via writeValue', () => {
    // 1. Initial state check (should be null/unset)
    expect(hostComponent.testForm.get('sliderVal')?.value).toBeNull();
    expect(sliderComponent.internalControl.value).toBeNull();

    // 2. Simulate setting a value via the parent form
    hostComponent.testForm.get('sliderVal')?.setValue(60);
    fixture.detectChanges();

    // 3. Child internal control must reflect the parent value update
    expect(sliderComponent.internalControl.value).toBe(60);
  });

  it('should emit changes up to parent form control on input manipulation', () => {
    jest.spyOn(hostComponent, 'onSliderChange');

    // Simulate value modification directly inside the slider component
    sliderComponent.internalControl.setValue(40);
    fixture.detectChanges();

    // Verify parent form group context caught the update cleanly
    expect(hostComponent.testForm.get('sliderVal')?.value).toBe(40);
    expect(hostComponent.onSliderChange).toHaveBeenCalledWith(40);
  });

  it('should explicitly emit valueChange when internal control changes', () => {
    // Spy directly on the EventEmitter instance
    const emitSpy = jest.spyOn(sliderComponent.valueChange, 'emit');

    // Trigger the value change
    sliderComponent.internalControl.setValue(85);
    fixture.detectChanges();

    // Verify the output emitter itself was called with the correct mapped value
    expect(emitSpy).toHaveBeenCalledWith(85);
  });

  it('should properly render the unset visual CSS state condition', () => {
    hostComponent.testForm.get('sliderVal')?.setValue(null);
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('label'));
    expect(
      labelElement.nativeElement.classList.contains('clio-state-unset')
    ).toBe(true);
  });
});
