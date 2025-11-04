import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarcasycategoriasService {
  //private API_URL = 'http://localhost:3000/api/';
  private API_URL = 'https://motolineparts.com/api/';

  constructor(private http: HttpClient) { }
  getAllCategorias(page: number | undefined = undefined, limit: number | undefined = undefined) {
    return this.http.get(
      `${this.API_URL}categorias?page=${page}&limit=${limit}`
    );
  }

  createCategoria(product: any) {
    return this.http.post(`${this.API_URL}categorias`, product);
  }

  updateCategoria(id: string, product: any) {
    return this.http.put(`${this.API_URL}categorias/${id}`, product);
  }

  deleteCategoria(id: string) {
    return this.http.delete(`${this.API_URL}categorias/${id}`);
  }

  getAllMarcas(page: number | undefined = undefined, limit: number | undefined = undefined) {
    return this.http.get(
      `${this.API_URL}marcas?page=${page}&limit=${limit}`
    );
  }

  createMarca(product: any) {
    return this.http.post(`${this.API_URL}marcas`, product);
  }

  updateMarca(id: string, product: any) {
    return this.http.put(`${this.API_URL}marcas/${id}`, product);
  }

  deleteMarca(id: string) {
    return this.http.delete(`${this.API_URL}marcas/${id}`);
  }
}
