import { OrderService } from './../../services/order/order.service';
import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { AddressComponent } from '../../components/address/address.component';
import { DeliveryComponent } from '../../components/delivery/delivery.component';
import { PaymentComponent } from '../../components/payment/payment.component';
import { ReviewComponent } from '../../components/review/review.component';
import { CommonModule } from '@angular/common';
import { UserServiceService } from '../../services/user/user-service.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CountService } from '../../services/count/count.service';
import { COLOMBIA_LOCATIONS, DEPARTMENTS } from '../../Utils/colombia-locations';
declare var WidgetCheckout: any;

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
    address: { street: string; complement: string; department: string; city: string; zip: string };
    date: Date;
    status: 'pending' | 'accepted' | 'rejected';
    customerFirstName: string;
    customerLastName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerDocumentType: 'CC' | 'NIT';
    customerCedula: string;
  };

  street: string = '';
  addressComplement: string = '';
  department: string = '';
  city: string = '';
  zip: string = '';
  departments = DEPARTMENTS;
  shippingCost: number | null = null;
  shippingLoading = false;
  shippingError = '';
  private shippingRequest = 0;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  documentType: 'CC' | 'NIT' = 'CC';
  documentNumber: string = '';
  formError: string = '';
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
      address: { street: '', complement: '', department: '', city: '', zip: '' },
      date: new Date(),
      status: 'pending',
      customerFirstName: '',
      customerLastName: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerDocumentType: 'CC',
      customerCedula: '',
    };
  }

  ngOnInit() {

    this.loadWompiScript();
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
          (acc: number, product: any) => acc + product.price * product.quantity,
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
      if (this.currentStep === 1) {
        this.formError = this.validateCustomerForm();
        if (this.formError) {
          return;
        }
      }

      this.currentStep++;
    }

    if (this.currentStep === 3) {
      this.order.address = {
        street: this.street.trim(),
        complement: this.addressComplement.trim(),
        department: this.department,
        city: this.city,
        zip: this.zip.trim(),
      };
      this.order.customerFirstName = this.firstName.trim();
      this.order.customerLastName = this.lastName.trim();
      this.order.customerName = this.fullName;
      this.order.customerEmail = this.email.trim();
      this.order.customerPhone = this.phone.trim();
      this.order.customerDocumentType = this.documentType;
      this.order.customerCedula = this.documentNumber.trim();

      this.orderService.createOrder(this.order).subscribe({
        next: (data: any) => {
          this.pagarConWompi(data.message);

        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {

        },
      });
    }
  }

  get cities(): string[] {
    return COLOMBIA_LOCATIONS[this.department] ?? [];
  }

  get total(): number {
    return this.order.totalPrice + (this.shippingCost ?? 0);
  }

  onDepartmentChange() {
    this.city = '';
    this.resetShipping();
  }

  onCityChange(city: string) {
    this.resetShipping();
    if (!city || !this.department) return;

    const request = ++this.shippingRequest;
    this.shippingLoading = true;
    this.orderService.getShippingQuote(this.department, city).subscribe({
      next: (quote) => {
        if (request !== this.shippingRequest) return;
        this.shippingCost = quote.cost;
        this.shippingLoading = false;
      },
      error: (error) => {
        console.error(error);
        if (request !== this.shippingRequest) return;
        this.shippingError = 'No pudimos calcular el envío. Intenta de nuevo.';
        this.shippingLoading = false;
      },
    });
  }

  private resetShipping() {
    this.shippingRequest++;
    this.shippingCost = null;
    this.shippingLoading = false;
    this.shippingError = '';
  }

  get fullName(): string {
    return `${this.firstName.trim()} ${this.lastName.trim()}`.trim();
  }

  validateCustomerForm(): string {
    if (!this.firstName.trim()) return 'Ingresa tus nombres.';
    if (!this.lastName.trim()) return 'Ingresa tus apellidos.';
    if (!this.email.trim()) return 'Ingresa tu correo electrónico.';
    if (!/^\d{7,15}$/.test(this.phone.trim())) {
      return 'Ingresa un número de teléfono válido (solo dígitos).';
    }
    if (!/^\d{5,15}(-\d)?$/.test(this.documentNumber.trim())) {
      return this.documentType === 'NIT'
        ? 'Ingresa un NIT válido (ej. 900123456-7).'
        : 'Ingresa una cédula válida (solo dígitos).';
    }
    if (!this.street.trim()) return 'Ingresa tu dirección.';
    if (!this.department) return 'Selecciona tu departamento.';
    if (!this.cities.includes(this.city)) return 'Selecciona una ciudad del departamento.';
    if (this.shippingLoading) return 'Estamos calculando el costo de envío, espera un momento.';
    if (this.shippingCost === null) return this.shippingError || 'No se pudo calcular el costo de envío.';
    if (!this.zip.trim()) return 'Ingresa tu código ZIP.';
    return '';
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

  loadWompiScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    document.body.appendChild(script);
  }
  pagarConWompi(orderId: string) {
    this.orderService.getWompiCheckout(orderId).subscribe({
      next: (checkout: any) => {
        if (typeof WidgetCheckout === 'undefined') {
          Swal.fire('Error', 'No se pudo cargar la pasarela de pago. Intenta de nuevo.', 'error');
          return;
        }
        const redirectPath = localStorage.getItem('token')
          ? '/order-history'
          : `/seguimiento/${checkout.reference}`;
        try {
          sessionStorage.setItem(
            'lastOrder',
            JSON.stringify({ id: checkout.reference, email: this.email.trim() })
          );
        } catch {
          // sin sessionStorage: el cliente escribirá su correo en la página de seguimiento
        }
        // Wompi responde 403 si redirectUrl apunta a localhost, así que en desarrollo se omite.
        const isLocalHost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
        const widget = new WidgetCheckout({
          currency: checkout.currency,
          amountInCents: checkout.amountInCents,
          reference: checkout.reference,
          publicKey: checkout.publicKey,
          signature: checkout.signature,
          ...(isLocalHost ? {} : { redirectUrl: window.location.origin + redirectPath }),
          customerData: {
            email: this.email.trim(),
            fullName: this.fullName,
            phoneNumber: this.phone.trim(),
            phoneNumberPrefix: '+57',
            legalId: this.documentNumber.trim().split('-')[0],
            legalIdType: this.documentType,
          },
        });

        this.countService.setProduct();
        widget.open((result: any) => {
          console.log('Wompi transaction:', result?.transaction);
          if (isLocalHost && result?.transaction) {
            this.router.navigateByUrl(redirectPath);
          }
        });
      },
      error: (error) => {
        console.error(error);
        Swal.fire('Error', 'No se pudo iniciar el pago. Intenta de nuevo.', 'error');
      },
    });
  }

}
