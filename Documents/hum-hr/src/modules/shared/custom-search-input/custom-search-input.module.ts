import { NgModule } from "@angular/core";
import { CustomSearchInputComponent } from "./custom-search-input.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [CustomSearchInputComponent],
  exports: [CustomSearchInputComponent],
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
})
export class CustomSearchInputModule {}
