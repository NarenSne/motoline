import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product/product.service';
import { Product } from '../../interfaces/product';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductFormComponent } from '../product-form/product-form.component';
import { MarcasycategoriasService } from '../../services/marcasycategorias.service';
import { MatIconModule } from '@angular/material/icon';
import { ProductEditFormComponent } from '../product-edit-form/product-edit-form.component';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-products-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    LoadingSpinnerComponent,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [ProductService],
  templateUrl: './products-overview.component.html',
  styleUrl: './products-overview.component.css',
})
export class ProductsOverviewComponent {
  allProducts: Product[] = [];
  displayedProducts: Product[] = [];
  currentPage = 0;
  pageSize = 10;
  isLoading = true;
  create = true;
  searchForm: FormGroup;
  searchValue = '';
  searchResults: string[] = [];
  proudctFilter: Product[] = [];
  products: Product[] = [];
  colors: string[] = ["Rojo", "Azul", "Negro", "Blanco", "Gris", "Amarillo", "Verde"];
  newColor = '';

  constructor(
    private pService: ProductService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private categoryService: MarcasycategoriasService
  ) {
    this.searchForm = this.fb.group({
      search: [''],
      color: ['']
    });

    this.categoryService.getAllColors().subscribe({
      next: (data: any) => {
        this.colors = data.colors ? data.colors.map((c: any) => c.name) : (data || []);
      },
      error: (err) => {
        console.error('Error loading colors', err);
      }
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      panelClass: 'mat-dialog-container-large',
      data: this.create,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('create dialog closed');

      this.loadProducts();
    })
  }

  openEditDialog(product: any) {
    this.loadProducts();

    const editDialog = this.dialog.open(ProductEditFormComponent, {
      panelClass: 'mat-dialog-container-large',
      data: { product }
    })

    editDialog.afterClosed().subscribe(result => {
      this.loadProducts();
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  createColor() {
    if (!this.newColor || this.newColor.trim() === '') return;
    const name = this.newColor.trim();
    this.categoryService.createColor({ name }).subscribe({
      next: (res: any) => {
        console.log('Color creado', res);
        this.newColor = '';
      },
      error: (err: any) => console.error('Error creando color', err)
    })
  }
 

  loadProducts(): void {
    this.isLoading = true;
    this.pService.getAllProducts(this.currentPage + 1, this.pageSize).subscribe({
      next: (response: any) => {
        this.allProducts = response.totalProducts;
        this.displayedProducts = response.products;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error:', error);
        // Handle error
      },

    });
  }

  deleteProduct(id: any) {
    this.pService.deleteProduct(id).subscribe({
      next: (data: any) => {
        this.displayedProducts = this.displayedProducts.filter(
          (prod) => prod._id != id
        );
      },
      error: (error) => console.log(error)
    })
    setTimeout(() => {
      this.loadProducts();  
    }, 1000);
    
  }

  onPageChanged(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  // part of search
  search() {
    const { search, color } = this.searchForm.value;
    // if no filters provided, reload default (paginated) list
    if ((!search || search.trim() === '') && (!color || color === '')) {
      this.loadProducts();
      return;
    }

    this.pService.getAllProducts().subscribe({
      next: (data: any) => {
        this.products = data.products;
        let filtered = this.products;
        if (search && search.trim() !== '') {
          filtered = filtered.filter((result) =>
            result.name.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (color && color !== '') {
          filtered = filtered.filter((result) => result.color === color);
        }
        this.displayedProducts = filtered;
      },
      error: (error) => {
        console.error('404 Not Found');
      },
    });
  }
  emptySearch() {
    this.searchForm.reset();
    this.proudctFilter = [];
  }
  // Function to perform the search (replace with actual search logic)
  filterProducts(term: string): Product[] {
    return this.products.filter((result) =>
      result.name.toLowerCase().includes(term.toLowerCase())
    );
  }
}
