import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriasMarcasComponent } from './categorias-marcas.component';

describe('CategoriasMarcasComponent', () => {
  let component: CategoriasMarcasComponent;
  let fixture: ComponentFixture<CategoriasMarcasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriasMarcasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriasMarcasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
