import { Component, OnDestroy, OnInit, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-slider',
  standalone: true,
  templateUrl: './slider.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SliderComponent,
      multi: true
    }
  ],
  imports: [NgClass, ReactiveFormsModule]
})
export class SliderComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  public valueChange = output<number | null>();

  public internalControl = new FormControl<number | null>(null);
  private readonly destroy$ = new Subject<void>();

  public sliderValue = signal<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChangeCallback: (value: number | null) => void = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onTouchedCallback: () => void = () => {};

  public ngOnInit(): void {
    this.internalControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        const numValue = val !== null && val !== undefined ? Number(val) : null;

        this.sliderValue.set(numValue);
        this.onChangeCallback(numValue);
        this.valueChange.emit(numValue);
      });
  }

  public writeValue(value: number | null | string): void {
    const numValue =
      value !== null && value !== undefined && value !== ''
        ? Number(value)
        : null;

    this.internalControl.setValue(numValue, { emitEvent: false });
    this.sliderValue.set(numValue);
  }

  public registerOnChange(fn: (value: number | null) => void): void {
    this.onChangeCallback = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
