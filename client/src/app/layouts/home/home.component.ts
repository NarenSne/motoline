import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import Splide from '@splidejs/splide';
import { ProductService } from '../../services/product/product.service';
import { Product } from '../../interfaces/product';
import { CommonModule } from '@angular/common';
import { UserServiceService } from '../../services/user/user-service.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit {
  bestSellingProducts: Product[] = [];

  constructor(private productService: ProductService, private userService: UserServiceService) {}

  ngOnInit(): void {
    this.productService.getBestSellingProducts().subscribe((products) => {
      this.bestSellingProducts = products;
      setTimeout(() => {
        let splide = new Splide(".splide", {
          type: "loop",
          focus: 0,
          gap: "1rem",
          perPage: 4,
          breakpoints: {
            640: {
              perPage: 2,
            },
            480: {
              perPage: 1,
            },
          },
        });

        splide.mount();
      });
    });
  }

  addToCart(productId: string): void {
    this.userService.addCart(productId, 1).subscribe(() => {
      // Optionally, you can show a success message or update the UI
      console.log('Product added to cart');
    });
  }
}