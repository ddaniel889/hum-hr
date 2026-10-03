import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeEmployerComponent } from './welcomeEmployer.component';

const routes: Routes = [
  {
    path: '',
    component: WelcomeEmployerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WelcomeEmployerRoutingModule { }
