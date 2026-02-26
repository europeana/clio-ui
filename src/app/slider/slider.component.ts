import { Component, forwardRef, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormGroup
} from '@angular/forms';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true
    }
  ],
  imports: [FormsModule, NgClass, NgIf, ReactiveFormsModule]
})
export class SliderComponent implements ControlValueAccessor {
  @Input() form: UntypedFormGroup;
  @Input() controlName: string;

  value = 0;

  onChange(): void {}
  onTouched(): void {}

  updateChanges() {
    this.onChange();
  }

  writeValue(value: number): void {
    this.value = value;
    this.updateChanges();
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }
}
