import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { IdName } from '../models/Generics/IdName.model';
import { startWith, map } from 'rxjs/operators';
import { OrganizationalUnitAccess } from '../models/ou-access.model';
import { OrganizationalUnit } from '../models';

@Component({
  selector: 'app-autocomplete-chip',
  templateUrl: './autocomplete-chip.component.html',
  styles: []
})
export class AutocompleteChipComponent implements OnInit {
  @Input() originalList: IdName[];
  @Input() OrganizationList: OrganizationalUnit[];
  @Input() AccessList: OrganizationalUnitAccess[];
  @Input() placeHolderText: string;
  @Input() selectedItemsList: IdName[] = [];
  @Input() disabledAutocomplete = false;
  @Input() showIcons = false;
  @Input() iconName: string;
  @Input() listView = false;
  @Input() simpleSelection = false;
  @Input() itemButtonIcon: string;
  @Input() itemButtonTitle: string = 'Opciones';
  @Input() AccessView = false;
  @Input() OuView = false;
  @Output() OnChipClick = new EventEmitter<IdName>();
  @Output() OnAccessClick = new EventEmitter<OrganizationalUnitAccess>();
  @Output() OnItemSelected = new EventEmitter<IdName>();
  @Output() OnOuSelected = new EventEmitter<OrganizationalUnit>();
  @Output() OnValidSelected = new EventEmitter<String>();
  @Output() OnRemoveItem = new EventEmitter<IdName>();
  @Output() OnActiveList = new EventEmitter<string>();

  formCtrl = new UntypedFormControl();
  autocompleteNameList: Observable<String[]>;
  autocompleteAccessList: Observable<OrganizationalUnitAccess[]>;
  autocompleteOuList:Observable<OrganizationalUnit[]>;
  selectedOrganizationalUnit: OrganizationalUnit;

  @ViewChild('autocompleteChipInput') autocompleteChipInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor() { }

  ngOnInit() {
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnChanges(changes: SimpleChanges) {
    this.autocomplete();
  }

  chipClick(entity: IdName) {
    this.OnChipClick.emit(entity);
  }

  activeList(name:string){
      let newName = this.formCtrl.value;
      if(newName != undefined){
        this.OnActiveList.emit(newName);
      }
  }

  accessClick(entity: OrganizationalUnitAccess) {
    this.OnAccessClick.emit(entity);
  }
  autocomplete() {

    this.autocompleteNameList = this.formCtrl.valueChanges.pipe(
      startWith(null),
      map(name => this.filterOnValueChange(name))
    );

     this.autocompleteAccessList = this.formCtrl.valueChanges.pipe(
      startWith(null),
      map(name => this.filterAccessOnValueChange(name)));

       this.autocompleteOuList = this.formCtrl.valueChanges.pipe(
        startWith(null),
        map(name => this.filterOuOnValueChange(name)));
  }

  removeItem(item: IdName): void {
    const index = this.selectedItemsList.indexOf(item);
    if (index >= 0) {
      this.selectedItemsList.splice(index, 1);
      this.resetInputs();
      this.OnRemoveItem.emit(item);
    }
  }

  itemSelected(event: MatAutocompleteSelectedEvent): void {
    this.OnItemSelected.emit(event.option.value);
    // this.selectDocumentationType(event.option.value);
    this.resetInputs();
  }

  ouSelected(event: MatAutocompleteSelectedEvent): void {
    this.OnOuSelected.emit(event.option.value);

  }


  private resetInputs() {
    if (this.autocompleteChipInput && this.autocompleteChipInput.nativeElement) {
      this.autocompleteChipInput.nativeElement.value = '';
      this.autocompleteChipInput.nativeElement.blur();
    }
    this.formCtrl.setValue(null);
  }

  private filterOnValueChange(itemName: string | null): String[] {
    if (!this.originalList) {
      return [];
    }
    let result: String[] = [];
    const allItemssLessSelected = this.originalList.filter(dt => this.selectedItemsList.filter(sdt => sdt.id == dt.id).length <= 0);
    if (itemName) {
      result = this.filterItemList(allItemssLessSelected, itemName);
    } else {
      result = allItemssLessSelected.map(dt => dt.name);
    }
    return result;
  }

  private filterItemList(itemList: IdName[], itemName: String): String[] {
    let autocompleteNameList: IdName[] = [];
    const filterValue = itemName.toLowerCase();
    const itemMatchingName = itemList.filter(dt => dt.name.toLowerCase().indexOf(filterValue) >= 0);
    if (itemMatchingName.length) {
      autocompleteNameList = itemMatchingName;
    } else {
      autocompleteNameList = itemList;
    }
    return autocompleteNameList.map(dt => dt.name);
  }


  private filterAccessOnValueChange(itemName: string | null): OrganizationalUnitAccess[] {
    if (!this.AccessList) {
      return [];
    }
    let result: OrganizationalUnitAccess[] = [];
    const allItemssLessSelected = this.AccessList;
    if (itemName) {
      result = this.filterAccessList(allItemssLessSelected, itemName);
    } else {
      result = allItemssLessSelected.map(dt => dt);
    }
    return result;
  }

  private filterAccessList(itemList: OrganizationalUnitAccess[], itemName: String): OrganizationalUnitAccess[] {
    let autocompleteaccessList: OrganizationalUnitAccess[] = [];
    const filterValue = itemName.toLowerCase();
    const itemMatchingName = itemList.filter(dt => dt.ouName?.toLowerCase().indexOf(filterValue) >= 0);
    if (itemMatchingName.length) {
      autocompleteaccessList = itemMatchingName;
    } else {
      autocompleteaccessList = itemList;
    }
    return autocompleteaccessList.map(dt => dt);
  }
  private filterOuOnValueChange(itemName: string | null): OrganizationalUnit[] {
    if (!this.OrganizationList) {
      return [];
    }
    let result: OrganizationalUnit[] = [];
    const allItemssLessSelected = this.OrganizationList;
    if (itemName) {
      result = this.filterOuList(allItemssLessSelected, itemName);
    } else {
      result = allItemssLessSelected.map(dt => dt);
    }
    return result;
  }

  private filterOuList(itemList: OrganizationalUnit[], itemName: String): OrganizationalUnit[] {
    let autocompleteOuList: OrganizationalUnit[] = [];
    const filterValue = itemName.toLowerCase();
    const itemMatchingName = itemList.filter(dt => dt.name.toLowerCase().indexOf(filterValue) >= 0);
    if (itemMatchingName.length) {
      autocompleteOuList = itemMatchingName;
    } else {
      autocompleteOuList = itemList;
    }
    this.OnValidSelected.emit(itemName);
    return autocompleteOuList.map(dt => dt);
  }
}
