import { UserServiceService } from './services/user/user-service.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContactUsComponent } from './layouts/contact-us/contact-us.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    NavbarComponent,
    FooterComponent,
    FormsModule,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isLogged: Boolean = true;

  constructor(private useLog: UserServiceService, private router: Router) { }
  ngOnInit(): void {
    //this.isLogged = this.useLog.isAdmin();
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('admin')) {
          this.isLogged = false;
        } else {
          this.isLogged = true;
        }
      }
    })
    // console.log(this.useLog.isAdmin());
    // throw new Error('Method not implemented.');
  }
  title = 'client';
}
