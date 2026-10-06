import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserServiceService } from '../../services/user/user-service.service';
import { CountService } from '../../services/count/count.service';
import { RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
interface Item {
  _id: string;
  name: string;
  price: number;
  desc: string;
  stock: number;
  image: string;
  count: number;
}
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  providers: [UserServiceService],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  totalPrice: number = 0;
  fakeItems: any[] = [];
  isLoading = true;

  constructor(
    private userService: UserServiceService,
    private countService: CountService
  ) {
    this.userService.getCart().subscribe({
      next: (data) => {
        this.fakeItems = data.data;

        this.calculateTotalPrice();
        this.isLoading = false;
      },
      error: (error) => console.error(error),
    });
  }
  ngOnInit(): void {
    this.calculateTotalPrice();
  }
  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      const remove = {
        productId: item._id,
        type: 'remove',
      };
      this.userService.deleteCart(remove).subscribe({
        next: (data) => { this.countService.setProduct(); },
        error: (error) => console.error(error),
      });
    }
    this.calculateTotalPrice();
  }
  calculateTotalPrice() {
    this.totalPrice = this.fakeItems.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);
  }

  increaseQuantity(item: any) {
    if (item.quantity >= item.stock) return;
    item.quantity++;
    this.userService.addCart(item._id, 1).subscribe({
      next: (data) => { this.countService.setProduct(); },
      error: (error) => console.error(error),
    });
    this.calculateTotalPrice();
  }

  removeItem(item: any) {
    const index = this.fakeItems.indexOf(item);
    if (index > -1) {
      this.fakeItems.splice(index, 1);
      const remove = {
        productId: item._id,
        type: 'removeAll',
      };
      this.userService.deleteCart(remove).subscribe({
        next: (data) => {
          this.countService.setProduct();
        },

        error: (error) => console.error(error),
      });
    }
    this.calculateTotalPrice();
  }
}
