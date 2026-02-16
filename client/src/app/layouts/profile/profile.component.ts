import { routes } from './../../app.routes';
import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order/order.service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { ProfileService } from '../../services/profile/profile.service';
import { AccountComponent } from '../account/account.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    AccountComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
    CurrencyPipe,
    CommonModule,
    DatePipe
  ],
  providers: [ProfileService, OrderService],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  userInfo: any = {};
  showAccount: boolean = true;
  isLoading = true;
  orders: any[] = [];
  address: any[] = [];

  constructor(
    public profileService: ProfileService,
    private router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.userInfo = data;
        this.address = this.userInfo.address;
        console.log(this.userInfo);
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.orderService.getOrders(1, 5).subscribe({
      next: (data) => {
        this.orders = data.orders;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
      }
    });

    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (val.url === '/profile') {
          this.showAccount = true;
        } else {
          this.showAccount = false;
        }
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
  isAddressEmpty(): boolean {
    return this.address.length === 0;
  }
}
