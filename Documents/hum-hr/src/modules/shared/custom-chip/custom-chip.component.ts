import { Component, Input } from "@angular/core";

export type CustomChipTheme =
  | "brown"
  | "blue"
  | "red"
  | "green"
  | "orange"
  | "magenta";

@Component({
  selector: "app-custom-chip",
  template: `
    <span matRipple [ngClass]="['app-custom-chip', 'theme-' + customTheme]">
      {{ text }}
    </span>
  `,
  styleUrls: ["./custom-chip.component.scss"],
})
export class CustomChipComponent {
  @Input() text: string = "";
  /**
   * Sets the theme of the chip.
   * Supported values are "brown", "blue", "red", "green", "orange", "magenta".
   * If not provided, the default theme is "blue".
   */
  @Input() customTheme: CustomChipTheme = "blue";
}
