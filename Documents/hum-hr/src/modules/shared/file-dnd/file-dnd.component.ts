import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MessageService } from '../errorHandler/message.service';


@Component({
  selector: 'app-upload-form',
  templateUrl: './file-dnd.html'
})
export class UploadFormComponent {
  @ViewChild('fileInput') input: ElementRef;
  @Input() multipleSelection: boolean;
  @Input() acceptedExtensions: string;
  @Input() canRemove: boolean;
  @Input() canViewFile: boolean;
  @Input() disabled = false;
  @Input() maxFile: number;
  @Input() title = "Arrastrá los archivos aquí";
  @Input() showDropZone = true;

  @Output()
  filesChanged = new EventEmitter<any>();

  @Output()
  seeFileDefault = new EventEmitter<File>();

  @Output()
  fileSelected = new EventEmitter<File>();

  @Output()
  fileNotAllowed = new EventEmitter<any>();

  isHovering: boolean;
  @Input() files: File[] = [];
  constructor(private msjService: MessageService) {
    this.canViewFile = false;
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  startUpload(fileList: FileList) {
    if (this.disabled) {
      return;
    }

    if (this.files.length < Number(this.maxFile)) {
      if (fileList && fileList.length > 0) {
        let countNotAllowed = 0;
        for (let index = 0; index < fileList.length; index++) {
          const fileExist = this.files.filter(f => f.name == fileList[index].name);
          if (this.files.filter(f => f.name == fileList[index].name).length > 0) {
            continue;
          }

          const file = fileList.item(index);
          const extension = file.name.substring(file.name.lastIndexOf('.'));
          if (this.acceptedExtensions.toLowerCase().includes(extension.toLowerCase())) {
            this.files.push(file);
          } else {
            countNotAllowed++;
          }
        }

        if (countNotAllowed > 0) {
          const all = countNotAllowed === fileList.length;
          this.fileNotAllowed.emit({allNotAllowed: all, countNotAllowed: countNotAllowed});
          if (all) {
            return;
          }
        }
      }
      if (this.input && this.input.nativeElement) {
        this.input.nativeElement.value = null;
      }
      this.filesChanged.emit({files: this.files, isAdding: true});
    } else {
      this.msjService.showInfo("Se alcanzó el número máximo de archivos permitidos para adjuntar.");
    }
  }

  remove(i: number) {
    this.files.splice(i, 1);
    this.filesChanged.emit({files: this.files, isAdding: false});
  }

  view(file: File) {
    this.fileSelected.emit(file);
  }

  viewBigFile(ev, file: File) {
    ev.preventDefault();
    ev.stopPropagation();
    this.seeFileDefault.emit(file);
  }
}
