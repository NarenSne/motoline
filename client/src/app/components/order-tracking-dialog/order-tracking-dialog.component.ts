import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrderService } from '../../services/order/order.service';

export interface OrderTrackingDialogData {
  orderId: string;
  mode: 'accept' | 'edit';
  trackingNumber?: string;
}

@Component({
  selector: 'app-order-tracking-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-tracking-dialog.component.html',
})
export class OrderTrackingDialogComponent {
  trackingNumber: string;
  saving = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OrderTrackingDialogData,
    private dialogRef: MatDialogRef<OrderTrackingDialogComponent, boolean>,
    private orderService: OrderService
  ) {
    this.trackingNumber = data.trackingNumber ?? '';
  }

  get isAccept(): boolean {
    return this.data.mode === 'accept';
  }

  save(): void {
    const trackingNumber = this.trackingNumber.trim();
    if (!this.isAccept && !trackingNumber) {
      this.error = 'Ingresa el número de guía.';
      return;
    }
    if (trackingNumber && !/^[A-Za-z0-9-]{4,40}$/.test(trackingNumber)) {
      this.error = 'La guía debe tener entre 4 y 40 caracteres: letras, números o guiones.';
      return;
    }

    this.saving = true;
    this.error = '';
    const request = this.isAccept
      ? this.orderService.updateOrderStatus(this.data.orderId, 'accept', { trackingNumber })
      : this.orderService.updateOrderTracking(this.data.orderId, trackingNumber);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (error) => {
        console.error(error);
        this.saving = false;
        this.error = error?.error?.error || 'No se pudo guardar. Intenta de nuevo.';
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
