import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MyMaterialModule } from '../../../app.material';
import { WelcomeModule } from '../welcome/welcome.module';
import { InboxModule } from '../inbox/inbox.module';
import { ProfileModule } from '../../profile/profile.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DocumentDetailModule } from '../document-detail/document-detail.module';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    MyMaterialModule,
    WelcomeModule,
    DocumentDetailModule,
    InboxModule,
    ProfileModule,
    FlexLayoutModule,
    MatMenuModule
  ],
  declarations: [HomeComponent]
})
export class HomeModule {}
