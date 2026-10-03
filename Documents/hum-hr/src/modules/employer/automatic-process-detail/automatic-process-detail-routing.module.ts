import { NgModule } from '@angular/core';
import { AutomaticProcessDetailComponent } from './automatic-process-detail.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: AutomaticProcessDetailComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutomaticProcessDetailRoutingModule { }

