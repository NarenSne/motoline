import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../services/contact/contact.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './contact-us.component.html',
  styles: ``
})
export class ContactUsComponent {
  showMap: boolean = true;

  name = '';
  email = '';
  phone = '';
  category = '';
  message = '';
  terms = false;
  website = '';

  sending = false;
  sent = false;
  error = '';

  constructor(private contactService: ContactService) {}

  validate(): string {
    if (this.name.trim().length < 2) return 'Ingresa tu nombre.';
    if (!/^\S+@\S+\.\S+$/.test(this.email.trim())) return 'Ingresa un correo electrónico válido.';
    if (this.phone.trim() && !/^\+?\d{7,15}$/.test(this.phone.replace(/[\s-]/g, ''))) {
      return 'Ingresa un teléfono válido (solo números, 7 a 15 dígitos).';
    }
    if (!this.category) return 'Elige una categoría.';
    if (this.message.trim().length < 10) return 'Escribe un mensaje de al menos 10 caracteres.';
    if (!this.terms) return 'Debes aceptar los términos y condiciones.';
    return '';
  }

  submit(): void {
    this.sent = false;
    this.error = this.validate();
    if (this.error) return;

    this.sending = true;
    this.contactService
      .send({
        name: this.name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        category: this.category,
        message: this.message.trim(),
        terms: this.terms,
        website: this.website,
      })
      .subscribe({
        next: () => {
          this.sending = false;
          this.sent = true;
          this.name = this.email = this.phone = this.category = this.message = this.website = '';
          this.terms = false;
        },
        error: (error) => {
          this.sending = false;
          this.error =
            error.status === 429
              ? 'Enviaste varios mensajes seguidos. Espera unos minutos e inténtalo de nuevo.'
              : error.status === 400
              ? 'Revisa los datos del formulario e inténtalo de nuevo.'
              : 'No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.';
        },
      });
  }
}
