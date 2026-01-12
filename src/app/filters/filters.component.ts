import { NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';

import { CheckboxComponent } from '../checkbox';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  imports: [NgFor, CheckboxComponent]
})
export class FiltersComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);

  form: UntypedFormGroup;

  formControlFields = [
    {
      name: 'content_tier',
      options: [
        { name: '0', label: 'Zero' },
        { name: '1', label: '1' },
        { name: '2', label: '2' },
        { name: '3', label: '3' },
        { name: '4', label: '4' }
      ]
    },
    {
      name: 'metadata_tier',
      options: [
        { name: 'A', label: 'A' },
        { name: 'B', label: 'B' }
      ]
    },
    {
      name: 'media_type',
      options: [
        { name: 'TEXT', label: 'TEXT' },
        { name: 'Video', label: 'VIDEO' }
      ]
    }
  ];

  ngOnInit(): void {
    const formGroup = new UntypedFormGroup({});
    this.formControlFields.forEach((f) =>
      f.options.forEach((o) =>
        formGroup.addControl(o.name, new FormControl(null, []))
      )
    );
    this.form = new UntypedFormGroup({
      content_tier: formGroup,
      metadata_tier: formGroup,
      media_type: formGroup
    });
  }

  updateFilter(): void {
    console.log(JSON.stringify(this.form.value));
  }

  clearCheckboxes(): void {
    Object.keys(this.form.controls).forEach((group: string) => {
      Object.keys((this.form.get(group) as UntypedFormGroup).controls).forEach(
        (key) => {
          (this.form.get(group + '.' + key) as FormControl).setValue(false);
        }
      );
    });
  }
}
