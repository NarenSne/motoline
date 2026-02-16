import { Component } from '@angular/core';
import { ProductService } from '../../services/product/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../interfaces/product';
import { UserServiceService } from '../../services/user/user-service.service';
import Swal from 'sweetalert2';
import { recommendation } from '../../Utils/products'
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-overview',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule],
  providers: [ProductService, UserServiceService],
  templateUrl: './product-overview.component.html',
  styles: ``
})

export class ProductOverviewComponent {

  id: any;
  product: Product | undefined;
  primaryImage = '';
  availability = '';
  stock = 0;
  recommendationProduct = recommendation;
  isLoading = true;
  sizes = new Set<string>();
  colors = new Set<string>();
  wishListBtn = false;
  currentImageIndex = 0;
  references: string[] = [];
  quantity: number = 1;

  constructor(myRoute: ActivatedRoute, private productService: ProductService, private userService: UserServiceService, private localStorage: LocalStorageService) {
    this.id = myRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.productService.getProductById(this.id).subscribe({
      next: (data) => {
        this.product = data;
        this.stock = data.stock;
        this.isLoading = false;

        if (this.product?.ReferenciaVehiculo) {
          this.references = this.product.ReferenciaVehiculo.split(',').map((ref: string) => ref.trim());
        }

        const products: any = this.localStorage.getItem('wishList');
        if (this.product) {
          if (products && products.some((prod: any) => prod._id === this.product?._id)) {
            this.wishListBtn = true;
          }
        }
      },
      error: (error) => console.error(error)
    })
  }

  checkAvailability(): boolean {
    if (this.stock > 0) {
      return true;
    }
    return false;
  }

  addToCart() {
    if (!this.stock) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡Lo sentimos este producto no tiene stock disponible!',
        confirmButtonColor: '#FACC15',
        color: '#000000',
      });
      return;
    }
    this.userService.addCart(this.id, this.quantity).subscribe({
      next: (data) => { },
      error: (error) => console.error(error)
    });
    Swal.fire({
      icon: 'success',
      title: '¡Excelente!',
      text: 'Producto añadido a su carrito correctamente',
      confirmButtonColor: '#FACC15',
      color: '#000000',
    })
  }

  addProductToWishList() {
    let products: any;
    if (this.localStorage.getItem('wishList')) {
      products = this.localStorage.getItem('wishList');
      if (products.some((prod: any) => prod._id === this.product?._id)) {
        products = products.filter((prod: any) => prod._id !== this.product?._id);
        this.wishListBtn = false;
      } else {
        products.push(this.product);
        this.wishListBtn = true;
      }
      this.localStorage.setItem('wishList', products);
    } else {
      products = [];
      products.push(this.product);
      this.wishListBtn = true;
      this.localStorage.setItem('wishList', products);
    }
  }

  prevImage() {
    if (this.product && this.product.images) {
      this.currentImageIndex = (this.currentImageIndex > 0) ? this.currentImageIndex - 1 : this.product.images.length - 1;
    }
  }

  nextImage() {
    if (this.product && this.product.images) {
      this.currentImageIndex = (this.currentImageIndex < this.product.images.length - 1) ? this.currentImageIndex + 1 : 0;
    }
  }
}
