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

  categories = [
    {
      name: 'Pastillas, bandas & discos de frenos',
      image: './assets/images/frenos.png',
      route: '/catalog',
      queryParams: { categorie: 'Pastillas y bandas' }
    },
    {
      name: 'Kit de arrastre',
      image: './assets/images/matrass.png',
      route: '/catalog',
      queryParams: { categorie: 'Kit de arrastre' }
    },
    {
      name: 'Carenajes, farolas & guardabarros',
      image: './assets/images/outdoors.png',
      route: '/catalog',
      queryParams: { categorie: 'Carenajes farolas y guardabarros' }
    },
    {
      name: 'Tornillería especial',
      image: './assets/images/tornillos.png',
      route: '/catalog',
      queryParams: { categorie: 'Tornillería especial' }
    },
    {
      name: 'Aceites y lubricantes',
      image: './assets/images/lubricantes.png',
      route: '/catalog',
      queryParams: { categorie: 'Aceites y lubricantes' }
    },
    {
      name: 'Partes eléctricas',
      image: './assets/images/electricas.png',
      route: '/catalog',
      queryParams: { categorie: 'Partes eléctricas' }
    }
  ];

  constructor(private productService: ProductService, private userService: UserServiceService) { }

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