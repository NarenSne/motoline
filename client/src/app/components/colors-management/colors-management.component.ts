import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MarcasycategoriasService } from '../../services/marcasycategorias.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-colors-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './colors-management.component.html',
  styles: [`
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 8px; border-bottom: 1px solid #eee; }
  `]
})
export class ColorsManagementComponent implements OnInit {
  colors: any[] = [];
  loading = false;
  newColor = '';
  editingId: string | null = null;
  editingName = '';

  constructor(private categoryService: MarcasycategoriasService) {}

  ngOnInit(): void {
    this.loadColors();
  }

  loadColors() {
    this.loading = true;
    this.categoryService.getAllColors().subscribe({
      next: (res: any) => {
        // handle both { colors: [...] } and direct array
        this.colors = res.colors ? res.colors : res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading colors', err);
        this.loading = false;
      }
    })
  }

  createColor() {
    if (!this.newColor || this.newColor.trim() === '') return;
    const payload = { name: this.newColor.trim() };
    this.categoryService.createColor(payload).subscribe({
      next: (res: any) => {
        this.newColor = '';
        this.loadColors();
      },
      error: (err: any) => console.error('Error creating color', err)
    });
  }

  startEdit(color: any) {
    this.editingId = color._id;
    this.editingName = color.name;
  }

  cancelEdit() {
    this.editingId = null;
    this.editingName = '';
  }

  saveEdit(id: string) {
    if (!this.editingName || this.editingName.trim() === '') return;
    this.categoryService.updateColor(id, { name: this.editingName.trim() }).subscribe({
      next: (res: any) => {
        this.cancelEdit();
        this.loadColors();
      },
      error: (err: any) => console.error('Error updating color', err)
    })
  }

  deleteColor(id: string) {
    if (!confirm('Eliminar color?')) return;
    this.categoryService.deleteColor(id).subscribe({
      next: (res: any) => this.loadColors(),
      error: (err: any) => console.error('Error deleting color', err)
    })
  }
}
