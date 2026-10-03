import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LsdComponent } from './lsd.component';

const routes: Routes = [{
  path: '',
  component: LsdComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LsdRoutingModule { }
