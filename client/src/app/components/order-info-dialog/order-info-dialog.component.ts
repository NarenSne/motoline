import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrderService } from '../../services/order/order.service';
import { orderStatusClass, orderStatusLabel } from '../../Utils/order-status';

@Component({
  selector: 'app-order-info-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-info-dialog.component.html',
})
export class OrderInfoDialogComponent implements OnInit {
  order: any = null;
  products: any[] = [];
  isLoading = true;
  error = '';
  statusLabel = orderStatusLabel;
  statusClass = orderStatusClass;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { orderId: string },
    private dialogRef: MatDialogRef<OrderInfoDialogComponent>,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.orderService.getOrderById(this.data.orderId).subscribe({
      next: ({ order, products }) => {
        this.order = order;
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.error = 'No se pudo cargar la información del pedido.';
        this.isLoading = false;
      },
    });
  }

  get customerName(): string {
    return this.order.customerName || this.order.user?.fullName || '—';
  }

  get customerEmail(): string {
    return this.order.customerEmail || this.order.user?.email || '—';
  }

  get customerPhone(): string {
    return this.order.customerPhone || this.order.user?.phone || '—';
  }

  get customerDocument(): string {
    return this.order.customerCedula
      ? `${this.order.customerDocumentType || ''} ${this.order.customerCedula}`.trim()
      : '—';
  }

  get total(): number {
    return (this.order.totalPrice || 0) + (this.order.shippingCost || 0);
  }

  close(): void {
    this.dialogRef.close();
  }
}
