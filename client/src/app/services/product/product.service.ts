import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  //private API_URL = 'http://localhost:3000/api/products';
  private API_URL = 'https://motolineparts.com/api/products';

  constructor(private http: HttpClient) { }

  getBestSellingProducts() {
    return this.http.get<Product[]>(`${this.API_URL}/best-selling`);
  }

  getAllProducts(page: number | undefined = undefined, limit: number | undefined = undefined) {
    return this.http.get<Product[]>(
      `${this.API_URL}?page=${page}&limit=${limit}`
    );
  }

  getProductById(id: string) {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  createProduct(product: any) {
    return this.http.post(this.API_URL, product);
  }

  updateProduct(id: string, product: any) {
    return this.http.put(`${this.API_URL}/${id}`, product);
  }

  deleteProduct(id: string) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  decreaseStock(products: { id: string; count: number }[]) {
    return this.http.post(`${this.API_URL}/decrease-stock`, { products });
  }

  uploadProductImage(data: FormData) {
    console.log(data);
    return this.http.patch(`${this.API_URL}/updateImage`, data);
  }

  getChartsProducts() {
    return this.http.get(`${this.API_URL}/product-counts-by-brand`);
  }

  getAllMarcaVehicular(page: number | undefined = undefined, limit: number | undefined = undefined) {
    return this.http.get<Product[]>(
      `${this.API_URL}/marcaVehicular?page=${page}&limit=${limit}`
    );
  }

  createMarcaVehicular(product: any) {
    return this.http.post(this.API_URL + "/marcaVehicular", product);
  }

  updateMarcaVehicular(id: string, product: any) {
    return this.http.put(`${this.API_URL}/marcaVehicular/${id}`, product);
  }

  getAllReferenciaVehicular(page: number | undefined = undefined, limit: number | undefined = undefined) {
    return this.http.get<Product[]>(
      `${this.API_URL}/referenciaVehicular?page=${page}&limit=${limit}`
    );
  }

  createReferenciaVehicular(product: any) {
    return this.http.post(this.API_URL + "/referenciaVehicular", product);
  }

  updateReferenciaVehicular(id: string, product: any) {
    return this.http.put(`${this.API_URL}/referenciaVehicular/${id}`, product);
  }

}