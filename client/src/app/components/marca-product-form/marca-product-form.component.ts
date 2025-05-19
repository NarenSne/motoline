import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MarcasFormsComponent } from '../marcas-forms/marcas-forms.component';
import { ProductService } from '../../services/product/product.service';
import { MarcasycategoriasService } from '../../services/marcasycategorias.service';

@Component({
  selector: 'app-marca-product-form',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule],
  templateUrl: './marca-product-form.component.html',
  styleUrl: './marca-product-form.component.css'
})
export class MarcaProductFormComponent  {
  marcaForm: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { marca: any, isEdit: boolean },
    private dialogRef: MatDialogRef<MarcaProductFormComponent>,
    private formBuilder: FormBuilder,
    private productService: MarcasycategoriasService
  ) {
    this.marcaForm = new FormBuilder().group({
      name: ['', [Validators.required]]
    })
    if (data.isEdit) {
      this.marcaForm.get('name')?.setValue(data.marca.name)
    }
  }
  onSubmit() {
    if (this.data.isEdit) {
      this.productService.updateMarca(this.data.marca._id,this.marcaForm.getRawValue()).subscribe({
        next: (data) => {
          this.dialogRef.close()
        },
      })
    } else {
      this.productService.createMarca(this.marcaForm.getRawValue()).subscribe({
        next: (data) => {
          this.dialogRef.close()
        },
      })
    }

  }
}
