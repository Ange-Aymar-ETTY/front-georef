import { PageNotFoundComponent } from './views/page-not-found/page-not-found.component';
import { AccessDeniedComponent } from './views/access-denied/access-denied.component';
import { AuthGuard } from './guard/auth.guard';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { AccueilComponent } from './views/accueil/accueil.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { UtilisateurComponent } from './views/utilisateur/utilisateur.component';
import { ChangePasswordComponent } from './views/change-password/change-password.component';
import { AuthorizationGuard } from './guard/authorization.guard';
import { PROFIL } from './helpers/enumeration';
import { ExportComponent } from './views/export/export.component';

const routes: Routes = [
  { path: '', redirectTo: '/accueil', pathMatch: 'full' },
  {
    path: '',
    component: AccueilComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthorizationGuard],
    children: [
      { path: 'accueil', component: DashboardComponent },
      { path: 'export', component: ExportComponent },
      {
        path: 'utilisateur', component: UtilisateurComponent,
        data: {
          allowedRoles: [PROFIL.SUPER]
        }
      },
      { path: 'change-password', component: ChangePasswordComponent },
    ]
  },
  { path: 'accessdenied', component: AccessDeniedComponent },
  { path: 'login', component: LoginComponent },
  { path: 'pagenotfound', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/pagenotfound' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
