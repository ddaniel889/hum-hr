import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ChartDataset, ChartOptions, Color, TooltipLabelStyle } from 'chart.js';
import { Analytics } from '../models/analytics.model';

@Component({
    selector: 'app-cs-charts-control',
    templateUrl: './cs-charts-control.component.html',
    styles: []
})
export class CsChartsControlComponent implements OnInit, OnChanges {
    @Output() dateSelected = new EventEmitter<any>();
    @Input() chartLegend: true;
    @Input() responsive: Boolean = true;
    @Input() data: Analytics;
    @Input() chartType: string;
    chartLabels: TooltipLabelStyle[] = [];
    chartData: ChartDataset[] = [];
    chartOptions: ChartOptions = {
        responsive: true,
        aspectRatio: 2,
        indexAxis: 'y',
        scales: {
            xAxis: {
            },
            yAxis: {
            }
        },

        plugins: {
            //estilo de leyenda
            legend: {
                display: false,
                position: 'bottom',
                labels: {
                    padding: 40,
                    usePointStyle: true,
                }
            },
            //estilo de tooltip
            tooltip: {
                titleSpacing: 16,
                titleMarginBottom: 16,
                bodySpacing: 16,
                footerSpacing: 16,
                padding: 16,
            },
            //estilo de ejes

        }
    };

    chartColors: Color[];
    constructor() { }

    chartClicked(event: { active: string | any[]; }) {
        if (event.active.length > 0) {
            this.dateSelected.emit(this.data[+event.active[0]._index]);
            // Emmit event
        }
    }

    ngOnInit() {
    }
    ngOnChanges() {
        if (this.data) {
            this.chartLabels = this.data.labels;
            this.chartData = this.data.chartData;
            this.chartType = this.data.chartType;
        }
        // if (this.data.length > 0) {
        //     const colors: Color[] = [];
        //     this.chartLabels = this.data.map((d: { labels: any; }) => d.labels);
        //     this.chartData = this.data.map((d: { data: any; }) => d.data);
        //     colors.push({ backgroundColor: this.data.map((d: { color: any; }) => d.color) });
        //     this.chartColors = colors;
        // }
        //    chartLabels: Label[] = [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
        //    chartData: SingleDataSet = [300, 500, 1000];
        //    charColors: Color[] = [
        // {
        //     backgroundColor: ['blue', 'red', 'green']
        // }
        //    ];
    }
}
