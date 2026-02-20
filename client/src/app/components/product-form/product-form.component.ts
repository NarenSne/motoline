import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product/product.service';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { MatSelectModule } from '@angular/material/select';
import { MarcasycategoriasService } from '../../services/marcasycategorias.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, MatSelectModule],
  templateUrl: './product-form.component.html',
  styles: ``
})
export class ProductFormComponent {

  selectedFiles: File[] = [];
  formData: any;
  isLoading = false;
  list: any;
  listReferencia: any;
  listReferencias: any;
  listCategories: any;

  constructor(private productService: ProductService, public dialog: MatDialog, public categoryService: MarcasycategoriasService) {

    this.formData = new FormData();
    this.productService.getAllMarcaVehicular().subscribe({
      next: (data: any) => {
        this.list = data.marcaVehicular
      }
    })
    this.productService.getAllReferenciaVehicular().subscribe({
      next: (data: any) => {
        this.listReferencia = data.referenciaVehicular
        this.listReferencias = data.referenciaVehicular
      }
    })
    this.categoryService.getAllCategorias().subscribe({
      next: (data: any) => {
        this.listCategories = data.categorias
      }
    })
  }

  filtrarReferencias(event: any) {
    console.log(event)
    this.listReferencia = this.listReferencias.filter((ele: any) => event.value == ele.marca)
  }
  productForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    sku: new FormControl(0, [Validators.required]),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    desc: new FormControl('', [Validators.required]),
    stock: new FormControl(0, [Validators.required, Validators.pattern("^[0-9]*$")]), // Ensure only numbers
    images: new FormControl([], [Validators.required]),
    brand: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    Marcavehicular: new FormControl(''),
    ReferenciaVehiculo: new FormControl([]),
  });

  onFileChange(event: any) {
    const files = event.target.files;
    this.selectedFiles = Array.from(files);
    this.selectedFiles.forEach((file, index) => {
      console.log(file);
      this.formData.append('images', file);
    });
  }

  // uploadFiles() {
  //   // Append each selected file to the FormData object
  //   this.selectedFiles.forEach((file, index) => {
  //     this.formData.append('images', file);
  //   });
  //   // formData.append(`productId`, '');
  // }


  onSubmit() {
    this.isLoading = true;
    let product: any = { ...this.productForm.value };
    let productId = '';
    product.ReferenciaVehiculo = product.ReferenciaVehiculo?.join(",")
    this.productService.createProduct(product).subscribe({
      next: (data: any) => {
        productId = data.product._id;
        console.log(productId);
        this.formData.append(`productId`, productId);
        if (this.selectedFiles.length > 0) {
          this.productService.uploadProductImage(this.formData).subscribe({
            next: res => {
              this.isLoading = false;
              this.dialog.closeAll();
            },
            error: error => console.log(error)
          })
        }


      },
      error: error => console.error(error)
    });
  }
}
