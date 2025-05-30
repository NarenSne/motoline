import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserServiceService } from '../../services/user/user-service.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { CountService } from '../../services/count/count.service';
import Swal from 'sweetalert2';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterModule,CurrencyPipe],
  providers: [UserServiceService, LocalStorageService],
  templateUrl: './product-card.component.html',
  styles: ``,
})
export class ProductCardComponent implements OnInit {
  @Input() product: any;
  wishListBtn = false;

  constructor(private userService: UserServiceService, private localStorage: LocalStorageService, private countService: CountService) { }

  ngOnInit(): void {
    let products: any = this.localStorage.getItem('wishList');
    if (this.product) {
      if (products && products.some((prod: any) => prod._id === this.product._id)) {
        this.wishListBtn = true;
      }
    }

  }

  addToCart() {
    console.log(this.product._id);
    if (!this.product.stock) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡Lo sentimos este producto no tiene stock disponible!',
        confirmButtonColor: '#FACC15',
        color: '#000000',
      });
      return;
    }
    this.userService.addCart(this.product._id,1).subscribe({
      next: (data) => { this.countService.setProduct(); },
      error: (error) => console.error(error),
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
      if (products.some((prod: any) => prod._id === this.product._id)) {
        products = products.filter((prod: any) => prod._id !== this.product._id);
      } else {
        products.push(this.product)
      }
      this.localStorage.setItem('wishList', products);
    } else {
      products = [];
      products.push(this.product);
      this.localStorage.setItem('wishList', products);
    }
  }
}
