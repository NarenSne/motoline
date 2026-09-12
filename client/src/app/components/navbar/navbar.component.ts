import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MarcasycategoriasService } from '../../services/marcasycategorias.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styles: ``,
})
export class NavbarComponent {
  toggleBurgerMenu = false;
  @ViewChild('menu', { static: false }) menu!: ElementRef;
  @ViewChild('menudeploy', { static: false }) menudeploy!: ElementRef;

  selectedCategory: string = '';

  categories: { name: string; subcategories: string[] }[] = [];

  constructor(private marcasycategoriasService: MarcasycategoriasService) {}

  ngOnInit(): void {
    this.marcasycategoriasService.getAllCategorias().subscribe({
      next: (categoriasData: any) => {
        const categorias = categoriasData.categorias ?? [];
        this.marcasycategoriasService.getAllMarcas().subscribe({
          next: (marcasData: any) => {
            const marcas = marcasData.marcas ?? [];
            this.categories = categorias.map((categoria: any) => ({
              name: categoria.name,
              subcategories: marcas
                .filter((marca: any) => marca.category === categoria.name)
                .map((marca: any) => marca.name),
            }));
            if (!this.selectedCategory && this.categories.length) {
              this.selectedCategory = this.categories[0].name;
            }
          },
          error: (error) => {
            console.error('Error loading marcas:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error loading categorias:', error);
      },
    });
  }

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
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    console.log(this.toggleBurgerMenu)
    if (
      this.toggleBurgerMenu &&
      this.menu && this.menudeploy &&
      !this.menudeploy.nativeElement.contains(event.target) &&
      !this.menu.nativeElement.contains(event.target)
    ) {
      this.toggleBurgerMenu = false;
    }
  }
}
