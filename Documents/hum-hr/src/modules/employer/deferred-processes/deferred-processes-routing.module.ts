import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProcessListPage } from './pages/process-list/process-list.page';
import { ProcessDetailsPage } from './pages/process-details/process-details.page';

const routes: Routes = [
  {
    path: '',
    component: ProcessListPage,
  },
  {
    path: ':id',
    component: ProcessDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeferredProcessesRoutingModule { }
