import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProductService } from '../../services/product/product.service';
import { MatDialog } from '@angular/material/dialog';
import { MarcasFormsComponent } from '../marcas-forms/marcas-forms.component';
import { ReferenciasFormsComponent } from '../referencias-forms/referencias-forms.component';

@Component({
  selector: 'app-marcas-referencias',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  templateUrl: './marcas-referencias.component.html',
  styleUrl: './marcas-referencias.component.css'
})
export class MarcasReferenciasComponent {
  pageOrders: any[] = [];
  pageReferencia: any[] = []; // Ensure allOrders is initialized as an array
  currentPage = 0;
  pageSize = 10;
  numberOfOrders = 0;
  numberOfPages = 0;
  visible = false;
  create = true;
  constructor(
    public dialog: MatDialog, private productService: ProductService) {

  }

  ngOnInit(): void {
    this.loadMarcas();
    this.loadReferencias();
  }

  loadMarcas(): void {
    this.productService.getAllMarcaVehicular().subscribe({
      next: (response: any) => {
        this.pageOrders = response.marcaVehicular;
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }

  loadReferencias(): void {
    this.productService.getAllReferenciaVehicular().subscribe({
      next: (response: any) => {
        this.pageReferencia = response.referenciaVehicular;
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.productService.getAllMarcaVehicular(this.currentPage, 10).subscribe({
      next: (response: any) => {
        this.pageOrders = response.marcaVehicular;
        this.pageSize = response.marcaVehicular.length;
        this.numberOfPages = response.pagination.totalPages;
        this.numberOfOrders = response.pagination.totalOrders;
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }
  editarMarca(marca: any) {
    const dialogRef = this.dialog.open(MarcasFormsComponent, {
      panelClass: 'mat-dialog-container-large',
      data: {marca: marca,isEdit:true},
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('create dialog closed');

      this.loadMarcas();
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(MarcasFormsComponent, {
      panelClass: 'mat-dialog-container-large',
      data: this.create,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('create dialog closed');

      this.loadMarcas();
    })
  }

  openDialogReferencias(){
    const dialogRef = this.dialog.open(ReferenciasFormsComponent, {
      panelClass: 'mat-dialog-container-large',
      data: this.create,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('create dialog closed');

      this.loadReferencias();
    })
  }
  editarReferencia(marca: any) {
    const dialogRef = this.dialog.open(ReferenciasFormsComponent, {
      panelClass: 'mat-dialog-container-large',
      data: {marca: marca,isEdit:true},
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('create dialog closed');

      this.loadReferencias();
    })
  }

}
