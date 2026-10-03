import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OtpComponent } from "./otp.component";
import { MyMaterialModule } from "src/app/app.material";
import { FlexLayoutModule } from '@angular/flex-layout';
import { OtpRoutingModule } from "./otp.routes";

@NgModule({
  imports: [
    CommonModule,
    MyMaterialModule,
    FlexLayoutModule,
    OtpRoutingModule
  ],
  declarations: [OtpComponent]
})
export class OtpModule { }
