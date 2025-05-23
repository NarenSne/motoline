import { Routes } from '@angular/router';
import { ContactUsComponent } from './layouts/contact-us/contact-us.component';
import { AboutUsComponent } from './layouts/about-us/about-us.component';
import { LoginComponent } from './layouts/login/login.component';
import { SignupComponent } from './layouts/signup/signup.component';
import { IsAdminService } from './services/is-admin/is-admin.service';
import { IsUserService } from './services/is-user/is-user.service';
import { IsLoggedService } from './services/is-logged/is-logged.service';
import { IsNotLoggedService } from './services/is-not-logged/is-not-logged.service';
import { ForgotPasswordComponent } from './layouts/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './layouts/reset-password/reset-password.component';
import { CheckOutComponent } from './layouts/check-out/check-out.component';
import { CatalogComponent } from './layouts/catalog/catalog.component';
import { ProductOverviewComponent } from './layouts/product-overview/product-overview.component';
import { ProfileComponent } from './layouts/profile/profile.component';
import { ProfileInformationComponent } from './components/profile-information/profile-information.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { CardIsNotEmptyService } from './services/card-is-not-empty/card-is-not-empty.service';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { CartComponent } from './components/cart/cart.component';
import { AccountComponent } from './layouts/account/account.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ManageAddressComponent } from './components/manage-address/manage-address.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AccountsOverviewComponent } from './components/accounts-overview/accounts-overview.component';
import { OrdersOverviewComponent } from './components/orders-overview/orders-overview.component';
import { ProductsOverviewComponent } from './components/products-overview/products-overview.component';
import { HomeComponent } from './layouts/home/home.component';
import { OverviewComponent } from './components/overview/overview.component';
import { TerminosComponent } from './layouts/terminos/terminos.component';
import { Component } from '@angular/core';
import { GarantiaComponent } from './layouts/garantia/garantia.component';
import { MarcasReferenciasComponent } from './components/marcas-referencias/marcas-referencias.component';
import { CategoriasMarcasComponent } from './components/categorias-marcas/categorias-marcas.component';
export const routes: Routes = [
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'accounts-overview', component: AccountsOverviewComponent },
      { path: 'orders-overview', component: OrdersOverviewComponent },
      { path: 'products-overview', component: ProductsOverviewComponent },
      { path: 'marcas-referencias', component: MarcasReferenciasComponent },
      { path: 'categorias-marcas', component: CategoriasMarcasComponent },
      // { path: '', redirectTo: 'accounts', pathMatch: 'full' },
    ],
    canActivate: [IsLoggedService, IsAdminService],
  },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent, pathMatch: 'full' },
  { path: 'contact-us', component: ContactUsComponent },
  {
    path: 'about-us',
    component: AboutUsComponent,
  },
  { path: `terminos`, component: TerminosComponent},
  {
    path: 'catalog',
    component: CatalogComponent
  },
  {
    path: 'product-overview/:id',
    component: ProductOverviewComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    children: [
      { path: 'information', component: ProfileInformationComponent },
      { path: 'edit', component: EditProfileComponent },
      { path: 'address', component: ManageAddressComponent },
      { path: 'password', component: ChangePasswordComponent },
      { path: 'wishlist', component: WishlistComponent },
    ],
    canActivate: [IsLoggedService, IsUserService],
  },
  {
    path: 'order-history',
    component: OrderHistoryComponent,
    canActivate: [IsLoggedService, IsUserService],
  },
  {
    path: 'orders/:id',
    component: OrderDetailComponent,
    canActivate: [IsLoggedService, IsUserService],
  },
  {
    path: 'profile-information',
    component: ProfileInformationComponent,
    canActivate: [IsLoggedService, IsUserService],
  },
  {
    path: 'edit-profile',
    component: EditProfileComponent,
    canActivate: [IsLoggedService, IsUserService],
  },
  {
    path: 'manage-address',
    component: ManageAddressComponent,
    canActivate: [IsLoggedService, IsUserService],
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [IsLoggedService, IsUserService],
  },
  {
    path: 'wishList',
    component: WishlistComponent,
    canActivate: [IsLoggedService, IsUserService],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [IsNotLoggedService],
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [IsNotLoggedService],
  },
  {
    path: 'forget-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [IsLoggedService],
  },
  {
    path: 'check-out',
    component: CheckOutComponent,
    canActivate: [IsLoggedService, IsUserService, CardIsNotEmptyService],
  },

  {
    path: 'cart',
    component: CartComponent
  },
  { path: `garantia`,
    component: GarantiaComponent
  },
];
