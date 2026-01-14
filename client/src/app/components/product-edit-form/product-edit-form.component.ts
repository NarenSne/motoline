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
  imports: [ReactiveFormsModule, CommonModule, LoadingSpinnerComponent, MatSelectModule],
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
  listReferencias: any;

  constructor(private productService: ProductService, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) {
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
  }

  ngOnInit(): void {
    let { name, price, images, desc, stock, brand, category, Marcavehicular, ReferenciaVehiculo, sku } = this.data.product;
    this.product = this.data.product;
    ReferenciaVehiculo = ReferenciaVehiculo.split(",");
    this.imagesUrl = images;
    this.productForm.get("name")?.setValue(name)
    this.productForm.get("price")?.setValue(price)
    this.productForm.get("desc")?.setValue(desc)
    this.productForm.get("stock")?.setValue(stock)
    this.productForm.get("images")?.setValue(images)
    this.productForm.get("brand")?.setValue(brand)
    this.productForm.get("category")?.setValue(category)
    this.productForm.get("Marcavehicular")?.setValue(Marcavehicular)
    this.productForm.get("ReferenciaVehiculo")?.setValue(ReferenciaVehiculo)
    this.productForm.get("sku")?.setValue(sku)
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
    sku: new FormControl(0, [Validators.required]),
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
    this.productForm.get("images")?.setValue(this.imagesUrl);
    console.log(this.productForm.getRawValue());
  }

  onFileChange(event: any) {
    const files = event.target.files;
    this.selectedFiles = Array.from(files);
  }
  filtrarReferencias(event:any){
    console.log(event)
    this.listReferencia = this.listReferencias.filter((ele:any)=>event.value == ele.marca)
  }
  uploadFiles() {
    let product: any = this.productForm.getRawValue();

    product.ReferenciaVehiculo = product.ReferenciaVehiculo?.join(",")
    this.productService.updateProduct(this.product._id, product).subscribe({
      next: res => {

      }
    });

    this.isLoading = true;
    const formData = new FormData();
    // Append each selected file to the FormData object
    if (this.selectedFiles.length > 0) {
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
    } else {
      this.dialog.closeAll();
      this.isLoading = false;
    }

  }
}
