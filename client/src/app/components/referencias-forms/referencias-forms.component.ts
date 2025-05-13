import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../../services/product/product.service';
import { AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-referencias-forms',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './referencias-forms.component.html',
  styleUrl: './referencias-forms.component.css'
})
export class ReferenciasFormsComponent {
  marcaForm: FormGroup;
  list: any = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { marca: any, isEdit: boolean },
    private dialogRef: MatDialogRef<ReferenciasFormsComponent>,
    private formBuilder: FormBuilder,
    private productService: ProductService
  ) {
    this.marcaForm = new FormBuilder().group({
      marca: ['', [Validators.required]],
      name: ['', [Validators.required]]
    })
    if (data.isEdit) {
      this.marcaForm.get('marca')?.setValue(data.marca.marca)
      this.marcaForm.get('name')?.setValue(data.marca.name)
    }
    this.productService.getAllMarcaVehicular().subscribe({
      next: (data: any) => {
        this.list = data.marcaVehicular
      }
    })
  }
  onSubmit() {
    if (this.data.isEdit) {
      this.productService.updateReferenciaVehicular(this.data.marca._id, this.marcaForm.getRawValue()).subscribe({
        next: (data) => {
          this.dialogRef.close()
        },
      })
    } else {
      this.productService.createReferenciaVehicular(this.marcaForm.getRawValue()).subscribe({
        next: (data) => {
          this.dialogRef.close()
        },
      })
    }
  }

}
