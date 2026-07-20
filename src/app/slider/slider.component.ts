import {
  Component,
  EventEmitter,
  forwardRef,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

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
  imports: [NgClass, NgIf, ReactiveFormsModule]
})
export class SliderComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Output() change = new EventEmitter<number | null>();

  internalControl = new FormControl<number | null>(null);
  private destroy$ = new Subject<void>();

  onChange: (_: number | null) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    this.internalControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        const numValue = val !== null && val !== undefined ? Number(val) : null;

        // this fires the value back up to the parent formControlName wrapper cleanly
        this.onChange(numValue);
        this.change.emit(numValue);
      });
  }

  writeValue(value: number | null | string): void {
    const numValue =
      value !== null && value !== undefined && value !== ''
        ? Number(value)
        : null;
    this.internalControl.setValue(numValue, { emitEvent: false });
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
