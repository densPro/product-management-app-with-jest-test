import { Component, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { take } from 'rxjs';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as fromActions from '../ngrx/actions/header.actions';
import { Product } from '../product.model';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  productForm: FormGroup;
  product: Product | undefined;
  loading = false;

  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private _ngZone: NgZone,
    private router: Router,
    private store: Store,
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [null, Validators.required],
    });
    this.store.dispatch(fromActions.updateHeaderTitle({ title: 'Add Product' }));
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  addProduct(): void {
    if (this.productForm.valid) {
      const formData = {
        ...this.productForm.value,
        id: this.product?.id,
      } as Product;

      this.loading = true;
      this.productService
        .addProduct(formData)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.productForm.reset();
            this.router.navigateByUrl(`/`);
          },
          error: (error) => {
            this.loading = false;
          },
        });
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  cancel(): void {
    this.router.navigateByUrl(`/`);
  }
}
