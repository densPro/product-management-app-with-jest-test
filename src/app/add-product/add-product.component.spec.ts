import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddProductComponent } from './add-product.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { ProductService } from '../product.service';
import { catchError, of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as fromActions from '../ngrx/actions/header.actions';

describe('AddProductComponent', () => {
  let component: AddProductComponent;
  let fixture: ComponentFixture<AddProductComponent>;
  let router: Router;
  let store: MockStore;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let navigateByUrlSpy: jasmine.Spy;

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['addProduct']);

    await TestBed.configureTestingModule({
      imports: [
        AddProductComponent,
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCardModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: Router, useValue: { navigateByUrl: {} } },
        { provide: Store, useValue: { dispatch: jasmine.createSpy() } },
        { provide: ProductService, useValue: productServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    store = TestBed.inject(Store) as MockStore;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProductComponent);
    component = fixture.componentInstance;
    navigateByUrlSpy = spyOn(router, 'navigateByUrl').and.returnValue(
      Promise.resolve(true)
    );
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch updateHeaderTitle action with correct title', () => {
    expect(store.dispatch).toHaveBeenCalledWith(
      fromActions.updateHeaderTitle({ title: 'Add Product' })
    );
  });

  it('should call addProduct method and navigate to home page on success',  fakeAsync(() => {
    // Simulate form input the user need to type 
    component.productForm.patchValue({
      name: 'Test Product',
      description: 'Test Description',
      price: 20,
    });

    // Mock the addProduct method of the ProductService to return an observable of object with next method
    productServiceSpy.addProduct.and.returnValue(
      of({
        next: (response: any) => {        }
      })
    );

    component.addProduct();
    tick();

    expect(component.loading).toBeFalse(); 
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/'); 
    expect(productServiceSpy.addProduct).toHaveBeenCalled();
  }));

  it('should set loading to false on error', () => {
    productServiceSpy.addProduct.and.returnValue(
      of({}).pipe(
        catchError((error) => {
          expect(component.loading).toBeFalse(); // Ensure loading flag is set to false
          return throwError(() =>error);
        })
      )
    );

    component.addProduct();
  });

  it('should mark all form controls as touched if form is invalid', () => {
    component.productForm.controls['name'].markAsDirty();

    component.addProduct();

    expect(component.productForm.touched).toBeTrue(); // Ensure all form controls are marked as touched
  });

  it('should navigate to home page on cancel', () => {
    component.cancel();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/'); // Ensure navigateByUrl method is called with '/'
  });
});
