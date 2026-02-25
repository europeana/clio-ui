import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormGroup
} from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

interface InputDescription {
  controlName: string;
  group: string;
}

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  imports: [NgIf, FormsModule, ReactiveFormsModule, NgClass]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() form: UntypedFormGroup;
  @Input() labelText: string;
  @Input() group: string;
  @Input() controlName: string;

  @Output() valueChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() keySelectionMade: EventEmitter<InputDescription> =
    new EventEmitter();

  writeValue(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  setParent(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  onChange(): void {
    this.valueChanged.emit();
  }

  onSpaceKey(): void {
    this.keySelectionMade.emit({
      group: this.group,
      controlName: this.controlName
    });
  }
}
