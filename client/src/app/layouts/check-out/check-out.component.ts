import { OrderService } from './../../services/order/order.service';
import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { AddressComponent } from '../../components/address/address.component';
import { DeliveryComponent } from '../../components/delivery/delivery.component';
import { PaymentComponent } from '../../components/payment/payment.component';
import { ReviewComponent } from '../../components/review/review.component';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { UserServiceService } from '../../services/user/user-service.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CountService } from '../../services/count/count.service';
declare var ePayco: any;

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [
    CommonModule,
    AddressComponent,
    DeliveryComponent,
    ReviewComponent,
    FormsModule,
    PaymentComponent
  ],
  templateUrl: './check-out.component.html',
  styleUrl: './check-out.component.css',
  providers: [UserServiceService],
})
export class CheckOutComponent implements OnInit {
  currentStep = 1;
  cart: any[] = [];
  order: {
    products: { [key: string]: number };
    totalPrice: number;
    address: { street: string; city: string; zip: string };
    date: Date;
    status: 'pending' | 'accepted' | 'rejected';
  };

  street: string = '';
  city: string = '';
  zip: string = '';
  fullname: string = '';
  email: string = '';
  cardNumber: string = '';
  cardHolder: string = '';
  expirationDate: string = '';
  cvv: string = '';
  isCheck: boolean = false;

  constructor(
    private userService: UserServiceService,
    private router: Router,
    private orderService: OrderService,
    private countService: CountService,
    private elementRef: ElementRef
  ) {
    this.order = {
      products: {},
      totalPrice: 0,
      address: { street: '', city: '', zip: '' },
      date: new Date(),
      status: 'pending',
    };
  }

  ngOnInit() {

    this.loadEpaycoScript();
    this.userService.getCart().subscribe({
      next: (products) => {
        console.log(products);

        this.cart = products.data;
        this.order.products = this.cart.reduce(
          (acc: { [key: string]: number }, product: any) => {
            acc[product._id] = product.quantity;
            return acc;
          },
          {}
        );
        console.log(this.order)
        this.order.totalPrice = this.cart.reduce(
          (acc: number, product: Product) => acc + product.price,
          0
        );

        console.log(this.cart, this.order);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  nextStep() {
    if (this.currentStep <= 2) {
      if (
        this.currentStep === 1 &&
        (this.street === '' || this.city === '' || this.zip === '')
      ) {
        return;
      }

      this.currentStep++;
    }

    if (this.currentStep === 3) {
      this.order.address = {
        street: this.street,
        city: this.city,
        zip: this.zip,
      };

      this.orderService.createOrder(this.order).subscribe({
        next: (data: any) => {
          this.pagarConEpayco(data.message);

        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {

        },
      });
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  setStreet(street: string) {
    this.street = street;
  }

  setCity(city: string) {
    this.city = city;
  }

  setZip(zip: string) {
    this.zip = zip;
  }

  setCardNumber(cardNumber: string) {
    this.cardNumber = cardNumber;
  }

  setCardHolder(cardHolder: string) {
    this.cardHolder = cardHolder;
  }

  setExpirationDate(expirationDate: string) {
    this.expirationDate = expirationDate;
  }

  setCvv(cvv: string) {
    this.cvv = cvv;
  }

  setIsCheck(isCheck: boolean) {
    this.isCheck = isCheck;
  }

  loadEpaycoScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.epayco.co/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }
  pagarConEpayco(orderId: any) {
    const handler = ePayco.checkout.configure({
      key: '83f65a1de38c66faad76373792c4ba64',
      test: true,
    });
    if (this.order.totalPrice <= 100000) {
      this.order.totalPrice += 8000
    }
    const data = {
      name: 'Motoline Parts',
      description: 'Pedido',
      invoice: orderId,
      currency: 'cop',
      amount: this.order.totalPrice,
      tax_base: '0',
      tax: '0',
      country: 'co',
      lang: 'es',
      external: 'false',
      response: 'http://localhost:4200/order-history',
      confirmation: 'https://www.motolineparts.com/api/orders/updateOrderStatus',
      method: 'POST'
    };

    this.countService.setProduct();
    handler.open(data);
  }

}
