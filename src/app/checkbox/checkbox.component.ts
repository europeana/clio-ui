import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

export interface InputDescription {
  controlName: string;
  group: string;
}

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  imports: [NgClass]
})
export class CheckboxComponent {
  checked = input<boolean>(false);
  labelText = input<string>('');
  group = input<string>('');
  controlName = input<string>('');

  valueChanged = output<boolean>();
  keySelectionMade = output<InputDescription>();

  onChange(): void {
    this.valueChanged.emit(!this.checked());
  }

  onSpaceKey(): void {
    this.keySelectionMade.emit({
      group: this.group(),
      controlName: this.controlName()
    });
  }
}
