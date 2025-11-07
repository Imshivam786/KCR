import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CasereviewComponent } from './pages/casereview/casereview.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'case/:caseId', component: CasereviewComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
