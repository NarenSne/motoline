import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../../services/product/product.service';

@Component({
  selector: 'app-marcas-forms',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './marcas-forms.component.html',
  styleUrl: './marcas-forms.component.css'
})
export class MarcasFormsComponent {
  marcaForm: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { marca: any, isEdit: boolean },
    private dialogRef: MatDialogRef<MarcasFormsComponent>,
    private formBuilder: FormBuilder,
    private productService: ProductService
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
      this.productService.updateMarcaVehicular(this.data.marca._id,this.marcaForm.getRawValue()).subscribe({
        next: (data) => {
          this.dialogRef.close()
        },
      })
    } else {
      this.productService.createMarcaVehicular(this.marcaForm.getRawValue()).subscribe({
        next: (data) => {
          this.dialogRef.close()
        },
      })
    }

  }
}
