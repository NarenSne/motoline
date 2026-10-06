import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order/order.service';

interface TrackingResult {
  orderNumber: string;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
  trackingNumber: string | null;
  destination: { city?: string; department?: string };
  items: { name: string; quantity: number }[];
  total: number;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tracking.component.html',
})
export class TrackingComponent implements OnInit {
  orderNumber = '';
  email = '';
  loading = false;
  error = '';
  result: TrackingResult | null = null;
  copied = false;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.orderNumber = id;
    try {
      const last = JSON.parse(sessionStorage.getItem('lastOrder') || 'null');
      if (last?.email && last?.id && last.id.startsWith(id.toLowerCase().slice(0, 24))) {
        this.email = last.email;
        this.search();
      }
    } catch {
      // sin datos guardados: el cliente escribe su correo
    }
  }

  get steps(): { label: string; done: boolean }[] {
    const accepted = this.result?.status === 'accepted';
    return [
      { label: 'Pedido recibido', done: true },
      { label: 'Pedido aceptado', done: accepted },
      { label: 'Enviado', done: accepted && !!this.result?.trackingNumber },
    ];
  }

  search(): void {
    const orderNumber = this.orderNumber.trim().replace(/^#/, '');
    const email = this.email.trim();

    if (!/^[0-9a-fA-F]{8,24}$/.test(orderNumber)) {
      this.error = 'Ingresa el número de tu pedido (8 a 24 caracteres, letras de la A a la F y números).';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.error = 'Ingresa el correo electrónico con el que hiciste la compra.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.result = null;
    this.orderService.trackOrder(orderNumber, email).subscribe({
      next: (result) => {
        this.result = result;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error =
          error.status === 404
            ? 'No encontramos un pedido con esos datos. Revisa el número y el correo.'
            : error.status === 429
            ? 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
            : 'No pudimos consultar tu pedido. Intenta de nuevo.';
      },
    });
  }

  newSearch(): void {
    this.result = null;
    this.error = '';
  }

  async copyTrackingNumber(): Promise<void> {
    if (!this.result?.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(this.result.trackingNumber);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    } catch {
      this.copied = false;
    }
  }
}
