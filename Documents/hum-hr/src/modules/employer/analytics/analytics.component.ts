import { Component, OnInit, OnChanges } from '@angular/core';

import { ChartDataset } from 'chart.js';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { Analytics } from '../../shared/models/analytics.model';
import { OrganizationalUnit, ContainerType } from '../../shared/models';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { NotificationService } from '../../shared/services/notification.service';
import { NotificationSearchDto } from '../../shared/models/NotificationSearchDto.model';
import { SegmentEmployeeFind } from '../../shared/models/segment-employee-find.model';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { MetadataFind } from '../../shared/models/metadata.model';
import { EmployeeFind } from '../../shared/models/employee-find.model';
import { MessageAtributtes, MessageType } from '../../shared/models/message-types.model';
import { GenericBottomSheetComponent } from '../../shared/generic-bottom-sheet/generic-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { KeyValuePair } from "../../shared/models/Generics/ikeyValuePair.model";
import { AuthService } from '../../shared/auth/auth.service';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styles: []
})

export class AnalyticsComponent implements OnInit, OnChanges {
  organizationalUnitId: number;
  analytics: Analytics = new Analytics();
  period: string;
  selectedOrganizationalUnit: OrganizationalUnit;
  organizationalUnits: OrganizationalUnit[];
  loading = true;
  analyticsFind: Analytics = new Analytics();
  segmentList: SegmentEmployeeFind[];
  placeHolderDescription = "";
  containerType: ContainerType;
  selectedEmployeeFind: EmployeeFind[];
  clickOnce = false;
  ouid:number;
  views: KeyValuePair<string, string>[] = [
    { key: 'Recibos de Sueldo', value: 'employer/analytics' }
  ];
  selectedView: KeyValuePair<string, string>;

  // barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  // Ejemplo de dataset para bar chart
  // public barChartData: ChartDataset[] = [
  //     { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A', stack: 'a', backgroundColor: 'red', hoverBackgroundColor: 'red' },
  //     { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B', stack: 'a', backgroundColor: 'green', hoverBackgroundColor: 'green' }
  // ];
  // El Stack es la linea donde agrupa
  // var model = new AnalyticsDTO();
  // model.Labels = new string[] { "SAC", "RECIBOS", "VACACIONES", "CERTIFICADOS", "LICENCIA", "ART", "DECLARACION" };
  // model.ChartData = new List<ChartModel>();
  // model.ChartData.Add(new ChartModel { Data = new int[] { 65, 59, 80, 81, 56, 55, 40 }, Label = "Firmados", Stack = "a", BackgroundColor = "red" });
  // model.ChartData.Add(new ChartModel { Data = new int[] { 28, 48, 40, 19, 86, 27, 90 }, Label = "No Firmados", Stack = "a", BackgroundColor = "green" });

  constructor(
    private analyticsService: AnalyticsService,
    private msjService: MessageService,
    private organizationalUnitService: OrganizationalUnitService,
    private notificationService: NotificationService,
    private containerTypeService: ContainerTypeService,
    private _bottomSheet: MatBottomSheet,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {    
    this.route.params.subscribe(params => {
      this.ouid = +params['id']
    });    
    this.views = this.authService.viewsAnalitycsAvailables();
    this.selectedView = this.views.find(v => v.key === 'Recibos de Sueldo');
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);        
        if (this.organizationalUnitService.getCurrentOrChildOU() == null || this.organizationalUnitService.getCurrentOrChildOU().isRoot) {          
          this.selectedOrganizationalUnit = this.organizationalUnits[0];
          this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
        } else {          
          if(isNaN( this.ouid) || this.ouid === undefined)
          {
             this.selectedOrganizationalUnit = this.organizationalUnitService.getCurrentOrChildOU();
          }
          else
          {
            this.selectedOrganizationalUnit = this.organizationalUnits.find((o) =>{ return o.id===this.ouid});
          }
      }
        this.loading = true; this.setActualPeriod();
        this.getContainer();
      },
        err => this.msjService.showError(err)
      );
  }
  ngOnChanges(changes) {    
    if ((!this.segmentList || changes.containerType) && this.containerType) {
      this.getSegments();
    }
  }
  changeView(view: KeyValuePair<string, string>) {     
    this.router.navigate([view.value,this.selectedOrganizationalUnit.id]);
  }

  getContainer() {    
    this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
    this.loading = true;
    return this.containerTypeService
      .getContainerType(this.selectedOrganizationalUnit.id.toString())
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
        this.getSegments();
        this.search();
      }).catch(err => {
        this.loading = false;
        this.msjService.showError(err);
      });
  }
  getSegments() {
    this.segmentList = [];
    this.placeHolderDescription = "";
    this.selectedEmployeeFind = [];
    const metas = this.containerType.metadata.filter(m => m.isSearchCriteria);
    metas.forEach(meta => {
      if (meta.optionValues) {
        const options: any[] = JSON.parse(meta.optionValues.toString());
        this.placeHolderDescription = this.placeHolderDescription === '' ? meta.metadataLabel : this.placeHolderDescription.concat(', ', meta.metadataLabel); options.forEach(opt => {
          const desc = opt.description ? opt.description : opt.value;
          const segmentEmployeeFind = new SegmentEmployeeFind(opt.value, meta.metadataLabel + ': ' + desc, meta.metadataSystemName);
          this.segmentList.push(segmentEmployeeFind);
        });
      }
    });
    this.placeHolderDescription = 'Ingresa ' + this.placeHolderDescription;
  }
  selectEmployeeFind(employeeName) {
    const foundEmployee = this.segmentList.filter(dt => dt.name == employeeName);
    if (foundEmployee.length) {
      const meta: MetadataFind = {
        MetadataSearchTypeFrom: 'Equal',
        MetadataSearchTypeTo: null,
        MetadataSystemName: foundEmployee[0].systemName,
        MetadataValueFrom: foundEmployee[0].id,
        MetadataValueTo: null,
        Nullvalue: false,
        metadataIsMultivalue: false
      }; const employeeFind = new EmployeeFind(foundEmployee[0].id, foundEmployee[0].name, meta);
      this.selectedEmployeeFind.push(employeeFind);
    }
  }
  changeOu() {    
    const previousOu = this.organizationalUnitService.getCurrentOrChildOU();
    if (this.selectedOrganizationalUnit && this.selectedOrganizationalUnit.id != null) {
      this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
      if (previousOu && previousOu.id !== this.selectedOrganizationalUnit.id) {
        this.getContainer();
      }
    }
  }
  search() {
    this.analyticsFind.period = this.period;
    this.analyticsFind.organizationalUnitId = this.selectedOrganizationalUnit.id;
    this.analyticsFind.containerTypeId = this.containerType.id;
    this.loading = true;
    this.analyticsService.find(this.analyticsFind).toPromise()
      .then(res => {
        this.analytics = res;
        this.loading = false;
      })
      .catch(err => {
        this.loading = false;
        this.msjService.showError(err);
      });
  }
  filteredSearch() {    
    this.analyticsFind.employeeFind = this.selectedEmployeeFind;
    this.search();
  }
  setActualPeriod() {
    const date = new Date();
    const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
    const year = date.getUTCFullYear();
    this.period = year + month;
  }
  notifToEmployee() {
    const parameters: MessageAtributtes = {
      bodyText: 'Notificar Pendientes',
      valueText: 'Vamos a enviar las notificaciones',
      infoText: 'Puedes continuar con tus tareas, nosotros te avisaremos si ocurre algo inesperado',
      type: MessageType.SpanMsg
    }; const t = this._bottomSheet.open(GenericBottomSheetComponent, { data: parameters, disableClose: true });
    t.instance.close.subscribe(async (response: boolean) => {
      if (response) {
        this.clickOnce = true;
        const dto: NotificationSearchDto = {
          ouId: this.selectedOrganizationalUnit.id.toString(),
          periodo: this.period
        };
        this.notificationService.notifPendingAction(dto).toPromise().then(
          () => {
            this.clickOnce = false;
            this.msjService.showInfo('Los usuarios han sido notificados exitosamente');
          },
          error => {
            this.clickOnce = false;
            this.msjService.showError(error);
          }
        );
      }
    });
  }
}
