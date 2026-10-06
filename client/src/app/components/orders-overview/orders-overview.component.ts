import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order/order.service';
import { CommonModule } from '@angular/common';
import { Order } from '../../interfaces/order';
import { MatDialog } from '@angular/material/dialog';
import { OrderInfoDialogComponent } from '../order-info-dialog/order-info-dialog.component';
import { OrderTrackingDialogComponent } from '../order-tracking-dialog/order-tracking-dialog.component';
import { orderStatusClass, orderStatusLabel } from '../../Utils/order-status';

@Component({
  selector: 'app-orders-overview',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  providers: [OrderService],
  templateUrl: './orders-overview.component.html',
  styleUrl: './orders-overview.component.css',
})
export class OrdersOverviewComponent implements OnInit {
  pageOrders: Order[] = []; // Ensure allOrders is initialized as an array
  currentPage = 0;
  pageSize = 10;
  numberOfOrders = 0;
  numberOfPages = 0;
  visible = false;
  statusLabel = orderStatusLabel;
  statusClass = orderStatusClass;

  constructor(private orderService: OrderService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (response: {
        orders: Order[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalOrders: number;
        };
      }) => {
        this.pageOrders = response.orders;
        this.numberOfPages = response.pagination.totalPages;
        this.numberOfOrders = response.pagination.totalOrders;
        const pruductIds = Array.from(
          new Set(
            response.orders.flatMap((order) =>
              order.products.flatMap((product) => product)
            )
          )
        );
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.orderService.getOrders(this.currentPage, 10).subscribe({
      next: (response: {
        orders: Order[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalOrders: number;
        };
      }) => {
        this.pageOrders = response.orders;
        this.pageSize = response.orders.length;
        this.numberOfPages = response.pagination.totalPages;
        this.numberOfOrders = response.pagination.totalOrders;
        console.log(
          response.orders,
          'current page: ' + this.currentPage,
          'page size: ' + this.pageSize,
          'number of pages: ' + this.numberOfPages,
          'number of orders: ' + this.numberOfOrders
        );
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }

  getProductName(product: any): string {
    return product.name;
  }

  orderTotal(order: Order): number {
    return (order.totalPrice ?? order.total ?? 0) + (order.shippingCost || 0);
  }

  openOrderInfo(order: Order): void {
    this.dialog.open(OrderInfoDialogComponent, {
      data: { orderId: order._id },
      width: '760px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
  }

  acceptOrder(order: Order): void {
    this.openTrackingDialog(order, 'accept');
  }

  editTracking(order: Order): void {
    this.openTrackingDialog(order, 'edit');
  }

  private openTrackingDialog(order: Order, mode: 'accept' | 'edit'): void {
    this.dialog
      .open(OrderTrackingDialogComponent, {
        data: { orderId: order._id, mode, trackingNumber: order.trackingNumber },
        autoFocus: 'input',
      })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.loadOrders();
        }
      });
  }

  rejectOrder(order: Order): void {
    this.orderService.updateOrderStatus(order._id, 'reject').subscribe({
      next: (response) => {
        console.log('Order accepted:', response);
        this.loadOrders();
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }
}
