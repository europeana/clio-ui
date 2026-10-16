import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SliderComponent } from './slider.component';

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

  public latestValueReceived: number | null = null;

  constructor(private fb: FormBuilder) {
    this.testForm = this.fb.group({
      sliderVal: [null]
    });
  }

  onSliderChange(val: number | null): void {
    this.latestValueReceived = val;
  }
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

    fixture.detectChanges();

    const sliderDebugEl = fixture.debugElement.query(
      By.directive(SliderComponent)
    );
    sliderComponent = sliderDebugEl.componentInstance;
  });

  it('should create', () => {
    expect(sliderComponent).toBeTruthy();
  });

  it('should pass value down from parent form to internal control and update the signal via writeValue', () => {
    expect(hostComponent.testForm.get('sliderVal')?.value).toBeNull();
    expect(sliderComponent.internalControl.value).toBeNull();
    expect(sliderComponent.sliderValue()).toBeNull();

    hostComponent.testForm.get('sliderVal')?.setValue(60);
    fixture.detectChanges();

    expect(sliderComponent.internalControl.value).toBe(60);
    expect(sliderComponent.sliderValue()).toBe(60);
  });

  it('should emit changes up to parent form control on input manipulation', () => {
    sliderComponent.internalControl.setValue(40);
    fixture.detectChanges();

    expect(hostComponent.testForm.get('sliderVal')?.value).toBe(40);
    expect(hostComponent.latestValueReceived).toBe(40);
  });

  it('should properly render the unset visual CSS state condition using the signal', () => {
    hostComponent.testForm.get('sliderVal')?.setValue(null);
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('label'));
    expect(
      labelElement.nativeElement.classList.contains('clio-state-unset')
    ).toBe(true);
  });
});
