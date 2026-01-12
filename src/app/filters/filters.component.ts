import { JsonPipe, NgFor } from '@angular/common';
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
  imports: [NgFor, CheckboxComponent, JsonPipe]
})
export class FiltersComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);

  form: UntypedFormGroup;

  formControlFields = [
    {
      name: 'content_tier',
      options: [
        { name: 'field_1', label: 'label 1' },
        { name: 'field_2', label: 'label 2' },
        { name: 'field_3', label: 'label 3' }
      ]
    },
    {
      name: 'metadata_tier',
      options: [
        { name: 'field_4', label: 'label 4' },
        { name: 'field_5', label: 'label 5' }
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
      metadata_tier: formGroup
    });
  }

  updateFilter(): void {
    console.log('updateFilter ');
  }
}
