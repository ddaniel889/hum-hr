import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CandidateFindComponent } from './candidateFind.component';

const routes: Routes = [
  {
    path: '',
    component: CandidateFindComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CandidateFindRoutingModule { }
