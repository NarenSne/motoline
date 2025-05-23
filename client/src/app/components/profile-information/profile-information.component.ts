import { Component } from '@angular/core';
import { ProfileService } from '../../services/profile/profile.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-information',
  standalone: true,
  imports: [
    SidebarComponent,
    LoadingSpinnerComponent,
    RouterModule,
    CommonModule,
  ],
  providers: [ProfileService],
  templateUrl: './profile-information.component.html',
})
export class ProfileInformationComponent {
  userInfo: any = {};
  isLoading = true;
  constructor(
    public profileService: ProfileService,
    public router: ActivatedRoute
  ) {
    this.router.url.subscribe((url) => {
      console.log(url);
    });
    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        console.log(data);
        this.userInfo = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
