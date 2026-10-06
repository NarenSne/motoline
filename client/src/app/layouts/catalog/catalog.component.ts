import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product/product.service';
import { Product } from '../../interfaces/product';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table'
import { Observable } from 'rxjs';
import { MarcasycategoriasService } from '../../services/marcasycategorias.service';
import { matchesSearch, normalizeText, searchTokens } from '../../Utils/product-search';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCardComponent, CommonModule, LoadingSpinnerComponent, MatSelectModule, MatPaginatorModule],
  templateUrl: './catalog.component.html',
  providers: [ProductService],
  styles: ``
})
export class CatalogComponent {
  list: any;
  categorie: any;
  brand: any;
  search = '';
  private tokens: string[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild('sidebar', { static: true }) sidebar!: ElementRef<HTMLElement>;
  obs!: Observable<any>;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  listReferencias: any;
  listCategories: any;
  constructor(private productService: ProductService, private router: ActivatedRoute, private nav: Router, public categoryService: MarcasycategoriasService) {
    router.queryParams.subscribe((data: any) => {
      const categoryChanged = data.categorie !== this.categorie;
      const newSearch = (data.search ?? '').trim();
      const searchChanged = !!newSearch && newSearch !== this.search;
      this.categorie = data.categorie
      this.brand = data.brand
      this.search = (data.search ?? '').trim();
      this.tokens = searchTokens(this.search);
      if (!this.isLoading) {
        if (searchChanged) {
          this.resetSidebarFilters();
        }
        if (categoryChanged || searchChanged) {
          this.checksCategory = this.categorie ? [this.categorie] : [];
        }
        this.checksBrand = this.brand ?? '';
        this.filter();
      }
    })
    this.productService.getAllMarcaVehicular().subscribe({
      next: (data: any) => {
        this.list = data.marcaVehicular
      }
    })
    this.productService.getAllReferenciaVehicular().subscribe({
      next: (data: any) => {
        this.listReferencias = data.referenciaVehicular
      }
    })

    this.categoryService.getAllCategorias().subscribe({
      next: (data: any) => {
        this.listCategories = data.categorias
      }
    })
  }

  products: Product[] = [];
  checksCategory: string[] = [];
  checksBrand: string = '';
  checksMarca = new Set<string>;
  filteredProducts: Product[] = [];
  minPrice = 0;
  maxPrice = 0;
  colors = new Set<string>();
  sortToggle = false;
  isLoading = true;

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: (data: any) => {
        this.products = data.products;
        this.filteredProducts = this.products;
        console.log(this.filteredProducts);
        this.dataSource.data = this.filteredProducts;
        this.dataSource.paginator = this.paginator;
        this.obs = this.dataSource.connect();
        this.isLoading = false;
        if (this.categorie) {
          this.checksCategory = [this.categorie];
        }
        if (this.brand) {
          this.checksBrand = this.brand;
        }
        if (this.categorie || this.brand || this.search) {
          this.filter()
        }
      },
      error: (error) => {
        console.error("404 Not Found");
      }
    })
  }

  getCategoriesFilters(inputValue: any) {
    const inputVal = inputValue.target.value;
    if (!inputValue.target.checked) {
      const idx = this.checksCategory.indexOf(inputVal);
      if (idx > -1) {
        this.checksCategory.splice(idx, 1);
      }
    } else {
      this.checksCategory.push(inputVal)
    }
    this.filter();
  }

  getMarcaFilters(inputValue: any) {
    const inputVal = inputValue.value;
    if (this.checksMarca.has(inputVal)) {
      this.checksMarca.delete(inputVal);
    } else {
      this.checksMarca.add(inputVal);
    }
    this.filter();
  }

  getMinPriceFilter(priceInput: any) {
    this.minPrice = priceInput.target.value;
    this.filter();
  }

  getMaxPriceFilter(priceInput: any) {

    const maxVal = priceInput.target.value;
    if (maxVal > this.minPrice)
      this.maxPrice = maxVal;
    if (!maxVal)
      this.maxPrice = NaN;

    console.log(!maxVal)
    this.filter();
  }

  getSizeFilters(sizeVal: any) {
    if (this.colors.has(sizeVal.value)) {
      this.colors.delete(sizeVal.value);
    } else {
      this.colors.add(sizeVal.value);
    }
    this.filter();
  }

  getColorFilters(colorVal: string) {
    if (this.colors.has(colorVal)) {
      this.colors.delete(colorVal);
    } else {
      this.colors.add(colorVal);
    }
    this.filter();
  }

  getSort(sortVal: string) {
    if (sortVal === "Asc") {
      this.filteredProducts = this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this.filteredProducts = this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    }
    this.dataSource.data = this.filteredProducts;
    this.sortToggle = false;
  }


  private resetSidebarFilters() {
    this.checksCategory = [];
    this.checksMarca.clear();
    this.colors.clear();
    this.minPrice = 0;
    this.maxPrice = 0;
    this.sidebar?.nativeElement
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[type="number"], select')
      .forEach((control) => {
        if (control instanceof HTMLSelectElement) control.selectedIndex = 0;
        else control.value = '';
      });
  }

  clearSearch() {
    this.nav.navigate([], { queryParams: { search: null }, queryParamsHandling: 'merge' });
  }

  filter() {
    if (!this.checksCategory.length && !this.search && !this.checksBrand.length && !this.maxPrice && !this.minPrice && !this.checksMarca && !this.colors) {
      this.filteredProducts = this.products; // Reset to all products
      this.dataSource.data = this.filteredProducts
    }
    else {
      const categoryKeys = new Set(this.checksCategory.map(normalizeText));
      this.filteredProducts = this.products.filter(prod => {
        return (
          (!categoryKeys.size || categoryKeys.has(normalizeText(prod.category))) &&
          matchesSearch(prod, this.tokens) &&
          (!this.checksBrand || this.checksBrand == prod.brand) &&
          (!this.minPrice || prod.price >= this.minPrice) &&
          (!this.maxPrice || prod.price <= this.maxPrice) &&
          (!this.checksMarca.size || this.checksMarca.has(prod.Marcavehicular)) &&
          (!this.colors.size || this.colors.has(prod.ReferenciaVehiculo))
        );
      });
      this.dataSource.data = this.filteredProducts;
      this.dataSource.paginator = this.paginator;
      this.paginator?.firstPage();
      this.obs = this.dataSource.connect();
    }
  }

}
