import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class UserServiceService {
  private apiUrl = 'http://localhost:3000/api/users';
  //private apiUrl = 'https://motolineparts.com/api/users';

  constructor(private http: HttpClient) {}

  // Define the login method
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data)
  }
  // Define the register method
  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data).pipe(
      // Handle any errors
      catchError(this.handleError)
    );
  }
  getAllUsers() {
    return this.http
      .get(`${this.apiUrl}/all`)
      .pipe(catchError(this.handleError));
  }

  forgetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgotPassword`, data).pipe(
      // Handle any errors
      catchError(this.handleError)
    );
  }

  // Reset password with the provided reset token
  resetPassword(newPassword: string, resetToken: string): Observable<any> {
    const data = {
      password: newPassword,
      passwordConfirm: newPassword,
      resetToken: resetToken,
    };
    return this.http
      .patch(`${this.apiUrl}/resetPassword/${resetToken}`, data)
      .pipe(catchError(this.handleError));
  }
  getCartSize(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart/size`, {
      withCredentials: true // 👈 necesario para enviar la cookie de sesión
    }).pipe(
      catchError(this.handleError)
    );
  }
  addCart(data: any,quantity:number): Observable<any> {
    console.log('id ' + data);
    const product = { productId: data,quantity:quantity };
    return this.http.post(`${this.apiUrl}/cart`, product, {
      withCredentials: true // 👈 necesario para enviar la cookie de sesión
    }).pipe(
      // Handle any errors
      catchError(this.handleError)
    );
  }
  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart`, {
      withCredentials: true // 👈 necesario para enviar la cookie de sesión
    }).pipe(
      // Handle any errors
      catchError(this.handleError)
    );
  }
  deleteCart(data: any): Observable<any> {
    console.log('id ' + data);
    const product = { productId: data.productId, type: data.type };
    return this.http.post(`${this.apiUrl}/cart/delete`, product, {
      withCredentials: true // 👈 necesario para enviar la cookie de sesión
    }).pipe(
      // Handle any errors
      catchError(this.handleError)
    );
  }
  // Error handling function
  private handleError(error: HttpErrorResponse) {
    // Handle different types of errors
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client-side error:', error.error.message);
    } else {
      // Server-side error
      console.error(`Server-side error: ${error.status} - ${error.message}`);
    }
    // Return an observable with an error message
    return throwError(
      `An error occurred while trying to Handle request Please try again later.`
    );
  }
  public isAdmin(): Boolean {
    let role = localStorage.getItem('role');
    if (role == 'admin') {
      return true;
    } else {
      return false;
    }
  }
  public isLoggedIn(): Boolean {
    let IsLoggedInUser = localStorage.getItem('token');
    if (IsLoggedInUser != null) {
      return true;
    } else {
      return false;
    }
  }
}
