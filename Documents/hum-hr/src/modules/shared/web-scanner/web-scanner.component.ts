import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as Dynamsoft from 'dwt';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: "app-web-scanner",
  templateUrl: "./web-scanner.component.html",
  styles: []
})
export class WebScannerComponent implements OnInit, OnDestroy {
  containerId = "DWT001";
  webTwain: WebTwain;
  sources: any[];
  selectedSource: any;
  @Output() OnScanComplete = new EventEmitter<Blob>();
  @Output() OnScanPage = new EventEmitter<Blob>();

  constructor() { }

  ngOnInit() {
    Dynamsoft.WebTwainEnv.AutoLoad = false;
    Dynamsoft.WebTwainEnv.Containers = [{ ContainerId: this.containerId, Width: '0px', Height: '0px' }];
    Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', () => {
      this.configure();
      this.loadSources();
    });
    Dynamsoft.WebTwainEnv.Trial = JSON.parse(AppConfig.settings.webTwain.isTrial);
    Dynamsoft.WebTwainEnv.ProductKey = AppConfig.settings.webTwain.key;

    if (AppConfig.settings.webTwain.ResourcesPath != ''){
      Dynamsoft.WebTwainEnv.ResourcesPath = AppConfig.settings.webTwain.ResourcesPath;
    }
    Dynamsoft.WebTwainEnv.Load();
  }

  ngOnDestroy(): void {
    this.webTwain.CloseSource();
    Dynamsoft.WebTwainEnv.Unload();
  }

  configure() {
    this.webTwain = Dynamsoft.WebTwainEnv.GetWebTwain(this.containerId);
    this.webTwain.Resolution = 300;
    this.webTwain.IfDuplexEnabled  = true;
    this.webTwain.IfAutoDiscardBlankpages = true;
    this.webTwain.IfShowUI = false;
    this.webTwain.AllowMultiSelect = true;
  }

  loadSources(): void {
    const count = this.webTwain.SourceCount;
    this.sources = [];
    for (let i = 0; i < count; i++) {
      this.sources.push({ name: this.webTwain.GetSourceNameItems(i), id: i});
    }

    if (count === 1) {
      this.selectedSource = this.sources[0];
    }
  }

  acquireImage(): void {
    if (this.selectedSource && this.webTwain.SelectSourceByIndex(this.selectedSource.id)) {
      const previousCount = this.webTwain.HowManyImagesInBuffer;
      this.webTwain.OpenSource();
      this.webTwain.AcquireImage(() => {
        const indices = [];
        for (let i = previousCount; i < this.webTwain.HowManyImagesInBuffer; i++) {
          indices.push(i);
        }
        this.OnScanPage.emit(this.createBlob(indices));
      });
    }
  }

  createBlob(indices?: number[]) {
    if (!indices || indices.length === 0) {
      indices = [];
      for (let i = 0; i < this.webTwain.HowManyImagesInBuffer; i++) {
        indices.push(i);
      }
    }
    return this.webTwain.ConvertToBlob(indices, EnumDWT_ImageType.IT_PDF);
  }

  finish() {
    const blob = this.createBlob();
    this.OnScanComplete.emit(blob);
    this.webTwain.RemoveAllImages();
    this.webTwain.CloseSource();
  }

  canFinish(): boolean {
    if (!this.webTwain) {
      return false;
    }

    return this.webTwain.SelectedImagesCount === 0;
  }
}
