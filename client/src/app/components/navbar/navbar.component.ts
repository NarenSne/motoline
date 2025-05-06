import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styles: ``,
})
export class NavbarComponent {
  toggleBurgerMenu = false;
  selectedCategory: string = 'Pastillas y bandas';

  categories = [
    {
      name: 'Pastillas y bandas',
      subcategories: ['KROSS', 'RUNNING PARTS', 'AUTECO', 'GPP', 'EBC', 'CASARELLA', 'REVO'],
    },
    {
      name: 'Kit de arrastre',
      subcategories: ['CHOHO', 'DID', 'ENDURANCE', 'Revo'],
    },
    {
      name: 'Carenajes farolas y guardabarros',
      subcategories: ['GENÉRICO', 'AUTECO', 'GPP'],
    },
    {
      name: 'Tornilleria especial',
      subcategories: ['GPP', 'REVO'],
    },
    {
      name: 'Aceites y lubricantes',
      subcategories: ['MOTUL', 'CASTROL', 'SHELL'],
    },
    {
      name: 'Partes eléctricas',
      subcategories: ['NGK', 'GPP', 'GENÉRICO'],
    },
  ];

  get selectedSubcategories() {
    const found = this.categories.find(c => c.name === this.selectedCategory);
    return found ? found.subcategories : [];
  }
  toggleMenu() {
    this.toggleBurgerMenu = !this.toggleBurgerMenu;
  }
  islogin() {
    return localStorage.getItem('token');
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.reload();
  }
}
