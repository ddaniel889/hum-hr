import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

@Component({
  selector: "app-custom-search-input",
  template: `
    <div class="custom-search-container" [ngStyle]="{'height': height, 'width': width}">
      <mat-icon class="fa" fontSet="fal" fontIcon="fa-search"></mat-icon>
      <input
        class="custom-search-input"
        type="search"
        placeholder="Buscar"
        (keydown.enter)="onKeyEnterDown()"
        [formControl]="control"
      />
    </div>
  `,
  styleUrls: ["./custom-search-input.component.scss"],
})
export class CustomSearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = "Buscar";
  @Input() control: FormControl;
  @Input() debounceTime: number = 700;
  @Input() height: string = "47px";
  @Input() width: string = "auto";

  /**
   * Emitted when the search input is changed and the debounce time is elapsed.
   * It can be used to trigger a search action.
   */
  @Output() onSearch = new EventEmitter<void>();

  private readonly cancelSearch$ = new Subject<void>();

  ngOnInit(): void {
    this.setupControlValueChanges();
  }

  ngOnDestroy(): void {
    this.cancelSearch$.next();
    this.cancelSearch$.complete();
  }

  onKeyEnterDown() {
    this.cancelSearch$.next();
    this.search();
    this.setupControlValueChanges();
  }

  search() {
    if (this.control?.invalid || this.control?.disabled) return;
    this.onSearch.emit();
  }

  private setupControlValueChanges() {
    this.control.valueChanges
      .pipe(debounceTime(this.debounceTime), takeUntil(this.cancelSearch$))
      .subscribe(() => {
        this.search();
      });
  }
}
