import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent {
  @Output() cardNumberChange = new EventEmitter<string>();
  @Output() cardHolderChange = new EventEmitter<string>();
  @Output() expirationDateChange = new EventEmitter<string>();
  @Output() cvvChange = new EventEmitter<string>();
  @Output() isCheckChange = new EventEmitter<boolean>();

  setCardNumber(e: any) {
    this.cardNumberChange.emit(e.target.value);
  }

  setCardHolder(e: any) {
    this.cardHolderChange.emit(e.target.value);
  }

  setExpirationDate(e: any) {
    this.expirationDateChange.emit(e.target.value);
  }

  setCvv(e: any) {
    this.cvvChange.emit(e.target.value);
  }

  setIsCheck(e: any) {
    this.isCheckChange.emit(e.target.checked);
  }
}
