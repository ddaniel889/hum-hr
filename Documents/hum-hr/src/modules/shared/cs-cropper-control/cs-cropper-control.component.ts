import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-cs-cropper-control',
  templateUrl: './cs-cropper-control.component.html',
  styles: [
  ]
})
export class CsCropperControlComponent implements OnInit {
  @Input() mantainAspectRatio: boolean = true;
  @Input() aspectRatio = 1;
  @Input() resizeToWidth = 0;
  @Input() resizeToHeight = 0;
  @Input() saveButtonName = 'Guardar';
  @Input() cancelButtonName = 'Cancelar';
  @Input() imageChangedEvent: any = null;
  @Input() fileBase64: string = null;

  @Output() uploadImage = new EventEmitter<string>();
  @Output() cancelCropper = new EventEmitter<boolean>();

  croppedImage: any = '';

  constructor() { }

  ngOnInit(): void {
  }
  
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  uploadFile() {
    this.uploadImage.emit(this.croppedImage);
    this.croppedImage = '';
  }

  cancel() {
    this.cancelCropper.emit(false);
    this.croppedImage = '';
  }
}
