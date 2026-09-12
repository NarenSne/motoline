import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MarcasycategoriasService } from '../../services/marcasycategorias.service';
import { MarcaProductFormComponent } from '../marca-product-form/marca-product-form.component';
import { CategoryProductFormComponent } from '../category-product-form/category-product-form.component';

@Component({
  selector: 'app-categorias-marcas',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  templateUrl: './categorias-marcas.component.html',
  styleUrl: './categorias-marcas.component.css'
})
export class CategoriasMarcasComponent {
  pageOrders: any[] = [];
  pageMarca: any[] = []; // Ensure allOrders is initialized as an array
  pageSize = 10;
  numberOfCategorias = 0;
  numberOfMarcas = 0;
  visible = false;
  create = true;
  constructor(
    public dialog: MatDialog, private productService: MarcasycategoriasService) {

  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadMarcas();
  }

  loadCategories(): void {
    this.productService.getAllCategorias().subscribe({
      next: (response: any) => {
        this.pageOrders = response.categorias;
        this.numberOfCategorias = response.totalCategory;
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }

  loadMarcas(): void {
    this.productService.getAllMarcas().subscribe({
      next: (response: any) => {
        this.pageMarca = response.marcas;
        this.numberOfMarcas = response.totalmarcas;
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }

  onCategoryPageChange(event: any): void {
    this.productService.getAllCategorias(event.pageIndex + 1, this.pageSize).subscribe({
      next: (response: any) => {
        this.pageOrders = response.categorias;
        this.numberOfCategorias = response.totalCategory;
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }

  onMarcaPageChange(event: any): void {
    this.productService.getAllMarcas(event.pageIndex + 1, this.pageSize).subscribe({
      next: (response: any) => {
        this.pageMarca = response.marcas;
        this.numberOfMarcas = response.totalmarcas;
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }
  editarCategoria(marca: any) {
    const dialogRef = this.dialog.open(CategoryProductFormComponent, {
      panelClass: 'mat-dialog-container-large',
      data: {marca: marca,isEdit:true},
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('create dialog closed');

      this.loadCategories();
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(CategoryProductFormComponent, {
      panelClass: 'mat-dialog-container-large',
      data: this.create,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('create dialog closed');

      this.loadCategories();
    })
  }

  openDialogMarcas(){
    const dialogRef = this.dialog.open(MarcaProductFormComponent, {
      panelClass: 'mat-dialog-container-large',
      data: this.create,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('create dialog closed');

      this.loadMarcas();
    })
  }
  editarMarca(marca: any) {
    const dialogRef = this.dialog.open(MarcaProductFormComponent, {
      panelClass: 'mat-dialog-container-large',
      data: {marca: marca,isEdit:true},
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('create dialog closed');

      this.loadMarcas();
    })
  }

}
