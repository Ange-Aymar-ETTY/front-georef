import { FooterComponent } from './components/footer/footer.component';
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserIsLoggedDirective } from './directives/user-is-logged.directive';
import { AccueilComponent } from './views/accueil/accueil.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { LoginComponent } from './views/login/login.component';
import { UtilisateurComponent } from './views/utilisateur/utilisateur.component';
import { TableComponent } from './components/table/table.component';
import { ShowAuthedSuperDirective } from './directives/show-authed-super.directive';
import { AccessDeniedComponent } from './views/access-denied/access-denied.component';
import { ChangePasswordComponent } from './views/change-password/change-password.component';
import { ErrorManagerComponent } from './components/error-manager/error-manager.component';
import { PageNotFoundComponent } from './views/page-not-found/page-not-found.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ImportComponent } from './components/import/import.component';
import { ToastrModule } from 'ngx-toastr';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { storage } from './helpers/storage';
import { ExportComponent } from './views/export/export.component';
import { FormShareComponent } from './components/modal/form-share/form-share.component';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { PostInterceptor } from './interceptors/post.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { NgSelect2Module } from 'ng-select2';

export function tokenGetters() {
  return storage.getItem('access_token');
}

const config: SocketIoConfig = {
  url: environment.webSocketUrl,
  options: { transports: ['websocket'], path: '/socket.io' }
};
@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    UserIsLoggedDirective,
    AccueilComponent,
    DashboardComponent,
    LoginComponent,
    UtilisateurComponent,
    TableComponent,
    ShowAuthedSuperDirective,
    AccessDeniedComponent,
    ChangePasswordComponent,
    ErrorManagerComponent,
    PageNotFoundComponent,
    ImportComponent,
    ExportComponent,
    FormShareComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatDialogModule,
    MatListModule,
    MatSnackBarModule,
    MatMenuModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(),
    SocketIoModule.forRoot(config),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetters,
        allowedDomains: [environment.apiUrl],
        disallowedRoutes: [environment.apiUrl + 'api/auth'],
      }
    }),
    NgSelect2Module,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: PostInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptor, multi: true }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
