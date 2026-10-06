import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../../interfaces/order';
import { cartHeaders } from '../../Utils/cart-id';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  //private API_URL = 'http://localhost:3000/api/orders';
  private API_URL = 'https://motolineparts.com/api/orders';

  constructor(private http: HttpClient) { }

  createOrder(order: any) {
    return this.http.post<any>(this.API_URL, order, { headers: cartHeaders() });
  }

  trackOrder(orderNumber: string, email: string) {
    return this.http.post<any>(`${this.API_URL}/track`, { orderNumber, email });
  }

  getShippingQuote(department: string, city: string) {
    return this.http.post<{ cost: number; zone: string; weightKg: number }>(
      `${this.API_URL.replace(/\/orders$/, '/shipping')}/quote`,
      { department, city },
      { headers: cartHeaders() }
    );
  }

  getWompiCheckout(orderId: string) {
    return this.http.get<any>(
      `${this.API_URL.replace(/\/orders$/, '/payments')}/wompi/${orderId}/checkout`
    );
  }

  getOrders(
    page: number | undefined = undefined,
    pageSize: number | undefined = undefined
  ) {
    const params = new HttpParams()
      .set('page', page ? page.toString() : '')
      .set('limit', pageSize ? pageSize.toString() : '');

    return this.http.get<{
      orders: Order[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalOrders: number;
      };
    }>(this.API_URL, { params });
  }

  getOrderById(id: string) {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  deleteOrder(id: string) {
    return this.http.delete<any>(`${this.API_URL}/${id}/cancel`);
  }

  updateOrderStatus(id: string, status: 'accept' | 'reject', body: object = {}) {
    return this.http.put<any>(`${this.API_URL}/${id}/${status}`, body);
  }

  updateOrderTracking(id: string, trackingNumber: string) {
    return this.http.patch<any>(`${this.API_URL}/${id}/tracking`, { trackingNumber });
  }

  getChartsMyOrders() {
    return this.http.get<any>(`${this.API_URL}/reports/status`);
  }
}
