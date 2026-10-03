import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { MessageService } from '../errorHandler/message.service';

@Component({
  selector: 'app-cs-upload-cropper-control',
  templateUrl: './cs-upload-cropper-control.component.html',
  styleUrls: []
})
export class CsUploadCropperControlComponent implements OnInit, OnChanges {
  @Input() uploadedImage: any = '';
  @Input() roundCropper = false;
  @Input() canDelete = false;
  @Input() aspectRatio = 1;
  @Input() widthSize : 100;
  @Input() heightSize : 100;
  @Input() newCropper : boolean = false;
  @Input() defaultImageName: string = 'user-avatar.png';
  @Output() uploadImage = new EventEmitter<string>();
  @Output() deletedImage = new EventEmitter<string>();
  @Output() editingImage = new EventEmitter<boolean>();

  imageChangedEvent: any = '';
  croppedImage: any = '';
  cropperShow = false;
  defaultImagePath: string;

  constructor(private msjService: MessageService) { }

  ngOnInit() {
    this.croppedImage = this.uploadedImage;
  }

  ngOnChanges() {
    this.defaultImagePath = `../../../assets/img/${this.defaultImageName}`;
  }

  fileChangeEvent(event: any): void {
    const fileName = event.target.files[0].name;
    const extension = fileName.substr(fileName.lastIndexOf('.'));
    if ((extension.toLowerCase() != ".png") &&
      (extension.toLowerCase() != ".jpg") &&
      (extension.toLowerCase() != ".jpeg")) {
      this.msjService.showInfo("El Formato de la imagen es inválido");
      return;
    }

    this.imageChangedEvent = event;
    this.cropperShow = true;
    this.editingImage.emit(true);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  uploadFile() {
    this.uploadImage.emit(this.croppedImage);
    this.croppedImage = '';

  }
  removeFile() {
    this.croppedImage = '';
  }

  deleteImage() {
    this.deletedImage.emit();
  }


  cancel() {
    this.cropperShow = false;
    this.croppedImage = this.uploadedImage;
    this.editingImage.emit(false);
  }
}
