import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { ProductDetailsComponent } from './product-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ProductService } from '../product.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import { Product } from '../product.model';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;
  let productServiceMock: Partial<ProductService>;
  let router: Router;
  let dialogMock: Partial<MatDialog>;
  let storeMock: Partial<Store>;
  let navigateByUrlSpy: jest.SpyInstance;

  beforeEach(async () => {
    productServiceMock = { 
      getProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
    };
     
    dialogMock = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }),
    };
    
    storeMock = {
      dispatch: jest.fn(),
    };

    const mockProduct: Product = {
      id: 1,
      name: 'Mock Product',
      description: 'Mock Description',
      price: 10.99,
    };

    (productServiceMock.getProduct as jest.Mock).mockReturnValue(of(mockProduct));
    
    await TestBed.configureTestingModule({
      imports: [
        ProductDetailsComponent,
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCardModule,
      ],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map().set('id', 1) } },
        },
        { provide: Router, useValue: { navigateByUrl: jest.fn() } },
        { provide: Store, useValue: storeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl').mockReturnValue(
      Promise.resolve(true)
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product on ngOnInit', () => {
    const dummyProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 20,
    };
    (productServiceMock.getProduct as jest.Mock).mockReturnValue(of(dummyProduct));

    component.ngOnInit();

    expect(component.loading).toBeFalsy();
    expect(component.product).toEqual(dummyProduct);
    expect(component.productForm.value).toEqual({
      name: dummyProduct.name,
      description: dummyProduct.description,
      price: dummyProduct.price,
    });
  });

  it('should call resizeToFitContent on autosize when triggerResize is called', fakeAsync(() => {
    const resizeToFitContentSpy = jest.spyOn(
      component.autosize,
      'resizeToFitContent'
    );
    component.triggerResize();
    component._ngZone.onStable.emit(null);
    tick();
    expect(resizeToFitContentSpy).toHaveBeenCalled();
  }));

  it('should save product', () => {
    const dummyProduct = {
      id: 1,
      name: 'Updated Test Product',
      description: 'Updated Test Description',
      price: 25,
    };
    const formData = {
      name: 'Updated Test Product',
      description: 'Updated Test Description',
      price: 25,
    };
    (productServiceMock.updateProduct as jest.Mock).mockReturnValue(of(dummyProduct));
    component.product = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 20,
    };
    component.productForm.setValue(formData);

    component.saveProduct();

    expect(component.loading).toBeFalsy();
    expect(productServiceMock.updateProduct).toHaveBeenCalled();
    // Form should be reset
    expect(component.productForm.value).toEqual({
      name: null,
      description: null,
      price: null,
    });
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/');
  });

  it('should handle error while saving product', () => {
    (productServiceMock.updateProduct as jest.Mock).mockReturnValue(throwError(() => 'Error'));
    component.productForm.setValue({
      name: 'Updated Test Product',
      description: 'Updated Test Description',
      price: 25,
    });

    component.saveProduct();

    expect(component.loading).toBeFalsy();
    expect(component.productForm.value).toEqual({
      name: 'Updated Test Product',
      description: 'Updated Test Description',
      price: 25,
    });
  });

  it('should cancel', () => {
    component.cancel();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should delete product', () => {
    (dialogMock.open as jest.Mock).mockReturnValue({
      afterClosed: () => of(true),
    } as MatDialogRef<any, any>);
    const dummyProduct = { id: 1 } as Product;
    (productServiceMock.deleteProduct as jest.Mock).mockReturnValue(of(dummyProduct));
    component.product = dummyProduct;

    component.deleteProduct();

    expect(component.loading).toBeFalsy();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/');
  });

  it('should not delete product when dialog is closed', () => {
    (dialogMock.open as jest.Mock).mockReturnValue({
      afterClosed: () => of(false),
    } as MatDialogRef<any, any>);

    component.deleteProduct();

    expect(component.loading).toBeFalsy();
    expect(productServiceMock.deleteProduct).not.toHaveBeenCalled();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });

  it('should handle error while deleting product', () => {
    (dialogMock.open as jest.Mock).mockReturnValue({
      afterClosed: () => of(true),
    } as MatDialogRef<any, any>);
    (productServiceMock.deleteProduct as jest.Mock).mockReturnValue(throwError(() => 'Error'));

    component.deleteProduct();

    expect(component.loading).toBeFalsy();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });
});
