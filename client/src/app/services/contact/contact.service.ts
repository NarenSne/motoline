import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  terms: boolean;
  website: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  //private API_URL = 'http://localhost:3000/api/contact';
  private API_URL = 'https://motolineparts.com/api/contact';

  constructor(private http: HttpClient) {}

  send(message: ContactMessage) {
    return this.http.post<{ ok: boolean }>(this.API_URL, message);
  }
}
