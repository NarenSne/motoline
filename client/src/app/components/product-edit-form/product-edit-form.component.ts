import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product/product.service';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { SimpleChanges } from '@angular/core';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-product-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoadingSpinnerComponent,MatSelectModule],
  templateUrl: './product-edit-form.component.html',
  styles: ``
})
export class ProductEditFormComponent {

  product: any = {};
  imagesUrl: any;
  selectedFiles: File[] = [];
  isLoading = false;
  list: any;
  listReferencia: any;

  constructor(private productService: ProductService, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) {
    this.productService.getAllMarcaVehicular().subscribe({
      next: (data: any) => {
        this.list = data.marcaVehicular
      }
    })
    this.productService.getAllReferenciaVehicular().subscribe({
      next: (data: any) => {
        this.listReferencia = data.referenciaVehicular
      }
    })
  }

  ngOnInit(): void {
    let { name, price, images, desc, stock, brand, category, Marcavehicular, ReferenciaVehiculo } = this.data.product;
    this.product = this.data.product;
    ReferenciaVehiculo = ReferenciaVehiculo.split(",");
    this.productForm.setValue({ name, price, desc, stock, images, brand, category, Marcavehicular, ReferenciaVehiculo })
    this.imagesUrl = images;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.productService.getProductById(this.product._id).subscribe({
      next: response => {
        this.product = response;
        this.imagesUrl = response.images;
      },
    })
  }

  productForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    desc: new FormControl('', [Validators.required]),
    stock: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]), // Ensure only numbers
    images: new FormControl([]),
    brand: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    Marcavehicular: new FormControl(''),
    ReferenciaVehiculo: new FormControl([]),
  });

  removeImage(image: any) {
    this.imagesUrl = this.imagesUrl.filter((img: any) => img != image);
    this.productForm.value.images = this.imagesUrl;
    console.log(this.productForm.value.images);
  }

  onFileChange(event: any) {
    const files = event.target.files;
    this.selectedFiles = Array.from(files);
  }

  uploadFiles() {
    let product: any = this.productForm.getRawValue();
    product.images = [];
    product.ReferenciaVehiculo = product.ReferenciaVehiculo?.join(",")
    this.productService.updateProduct(this.product._id, product).subscribe({
      next: res => {

      }
    });

    this.isLoading = true;
    const formData = new FormData();
    this.imagesUrl.forEach((image: any, index: any) => {
      let file = this.dataURLtoFile(image, index);
      formData.append('images', file);
    })
    // Append each selected file to the FormData object
    this.selectedFiles.forEach((file, index) => {
      formData.append('images', file);
    });
    formData.append(`productId`, this.product._id);

    // Send the FormData to the server using HttpClient
    this.productService.uploadProductImage(formData).subscribe({
      next: res => {
        this.dialog.closeAll();
        this.isLoading = false;
      },
      error: error => console.log(error)

    })
  }
  dataURLtoFile(dataurl:any, filename:any) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}
