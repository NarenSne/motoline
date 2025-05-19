import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MarcasycategoriasService } from '../../services/marcasycategorias.service';

@Component({
  selector: 'app-category-product-form',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule],
  templateUrl: './category-product-form.component.html',
  styleUrl: './category-product-form.component.css'
})
export class CategoryProductFormComponent  {
  categoriaForm: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { marca: any, isEdit: boolean },
    private dialogRef: MatDialogRef<CategoryProductFormComponent>,
    private formBuilder: FormBuilder,
    private productService: MarcasycategoriasService
  ) {
    this.categoriaForm = new FormBuilder().group({
      name: ['', [Validators.required]]
    })
    if (data.isEdit) {
      this.categoriaForm.get('name')?.setValue(data.marca.name)
    }
  }
  onSubmit() {
    if (this.data.isEdit) {
      this.productService.updateCategoria(this.data.marca._id,this.categoriaForm.getRawValue()).subscribe({
        next: (data) => {
          this.dialogRef.close()
        },
      })
    } else {
      this.productService.createCategoria(this.categoriaForm.getRawValue()).subscribe({
        next: (data) => {
          this.dialogRef.close()
        },
      })
    }

  }
}

