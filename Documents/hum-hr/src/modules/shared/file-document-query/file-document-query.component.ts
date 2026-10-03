import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { FileDocument } from '../models/file-document.model';
import { AuthService } from '../auth/auth.service';
import { FileDocumentQueryService } from '../services/file-document-query.service';
import {MsgType, MsgTypeLabels, QueryDocument} from '../models/query-document.model';
import {MessageService} from "../errorHandler/message.service";
import {LocalStorageService} from "../services/local-storage.service";

@Component({
  selector: 'app-file-document-query',
  templateUrl: './file-document-query.component.html',
  styleUrls: ['./_fileDocumentQuery.scss'],
})
export class FileDocumentQueryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() doc: FileDocument;
  @Input() organizationalUnitId: number;
  @Input() showQuery = false;
  @Input() hideCloseQuery = false;

  @Output() queryChanged = new EventEmitter<boolean>();
  @Output() activeChange = new EventEmitter<boolean>();
  @Output() closedQuery = new EventEmitter<boolean>();

  private _scrollContainer: ElementRef;

  @ViewChild('scrollContainer') set scrollContainer(content: ElementRef) {
    if (content) {
      this._scrollContainer = content;
      this.scrollToBottom();
    }
  }

  loading = false;
  querying = false; // Controla si el panel está abierto o solo se ve el botón
  hasQuery = false; // Controla si el documento ya tiene una consulta previa
  useDocComments = false;
  isMinimized = false;

  queryHistory: QueryDocument[] = [];
  currentUser: { id: number; lastName: string, firstName: string };

  queryForm = {
    messageType: null as MsgType | null,
    message: ''
  };

  replyText = '';
  motives: { id: MsgType, description: string }[] = [];

  constructor(
    private readonly queryService: FileDocumentQueryService,
    private readonly authService: AuthService,
    private readonly msjService: MessageService,
    private readonly localStorage: LocalStorageService
  ) { }

  ngOnInit() {
    const userId = this.authService.getUserId();
    this.useDocComments = this.localStorage.get('useDocComments');
    this.currentUser = {
      id: Number(userId),
      lastName: localStorage.getItem('userLastname'),
      firstName: localStorage.getItem('userFirstname'),
    };

    this.getMotives();

    if (this.doc?.id) {
      this.checkExistingQuery();
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['doc'] && this.doc) {
      this.checkExistingQuery();
    }

    if (changes['showQuery'] && !changes['showQuery'].currentValue) {
      this.closeQuery();
    }
  }

  // --- MÉTODOS DE FLUJO ---

  startQueryFlow() {
    if (!this.showQuery) return;
    this.querying = true;
    this.activeChange.emit(true);

    if (this.hasQuery) {
      this.scrollToBottom();
    }
  }
  closeQuery() {
    this.querying = false;
    this.isMinimized = false;
    this.activeChange.emit(false);
  }

  ngOnDestroy() {
    console.log('Destroy Query Component');
    this.closeQuery();
  }

  validateInput(event: any) {
    const input = event.target as HTMLTextAreaElement;
    const regex = /[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ ¡!¿?().,;:\n]/g;

    if (regex.test(input.value)) {
      const cleanValue = input.value.replace(regex, '');
      input.value = cleanValue;
      this.replyText = cleanValue;
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }
  // --- LÓGICA DE DATOS ---

  private getMotives() {
    this.motives = this.queryService.getMotives();
    if (this.motives.length > 0) {
      this.queryForm.messageType = this.motives[0].id;
    }
  }

  getFriendlyLabel(type: any): string {
    if (!type) return '';
    const numericType = MsgType[type as keyof typeof MsgType];
    return MsgTypeLabels[numericType as unknown as MsgType] || type;
  }

  private checkExistingQuery() {
    this.loading = true;
    this.queryHistory = [];
    this.replyText = '';
    this.queryForm = { messageType: null, message: '' };

    this.queryService.getQueryData(this.doc.id, 4).subscribe({
      next: (data) => {
        this.queryHistory = data;
        this.hasQuery = data && data.length > 0;
        this.loading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        this.loading = false;
        this.hasQuery = false;
        console.error("Error verificando consultas previas", err);
      }
    });
  }

  async submitNewQuery() {
    if (!this.queryForm.messageType || !this.queryForm.message.trim()) {
      this.msjService.showInfo("Debe completar todos los campos", false, true);
      return;
    }

    this.loading = true;

    const newQuery: QueryDocument = {
      documentId: this.doc.id,
      documentationName: this.doc.metadatas.find(m => m.systemName === "_nomDocumentacion")?.metadataValue,
      ouId: this.organizationalUnitId,
      message: this.queryForm.message,
      messageType: this.queryForm.messageType,
      userId: this.currentUser.id
    };

    this.queryService.postQuery(newQuery).subscribe({
      next: (res) => {
        this.doc.hasMessage = true;
        this.doc.threadClosed = false;
        this.hasQuery = true;
        this.queryChanged.emit(true);
        this.queryHistory.push(res);
        this.loading = false;
        this.msjService.showInfo("Consulta enviada correctamente", false, true);
      },
      error: (err) => {
        this.loading = false;
        this.msjService.showError("Error al enviar la consulta");
      }
    });
  }

  async sendReply() {
    if (!this.replyText.trim() || this.loading) return;

    this.loading = true;

    const reply: QueryDocument = {
      documentId: this.doc.id,
      documentationName: this.doc.metadatas.find(m => m.systemName === "_nomDocumentacion")?.metadataValue,
      ouId: this.organizationalUnitId,
      message: this.replyText,
      messageType: this.queryHistory[0]?.messageType || MsgType.Otros,
      userId: this.currentUser.id
    };

    this.queryService.postReply(reply).subscribe({
      next: (res) => {
        this.queryHistory.push(res);
        this.replyText = '';
        this.loading = false
        this.msjService.showInfo("Consulta enviada correctamente", false, true);
        this.scrollToBottom();
      },
      error: (err) => {
        this.loading = false;
        this.replyText = '';
        this.msjService.showError(err);
      }
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this._scrollContainer?.nativeElement) {
        const el = this._scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 300);
  }

  deleteMessage(msgId: string) {
    this.loading = true;
    this.queryService.deleteMessage(msgId).subscribe({
      next: () => {
        const msgIndex = this.queryHistory.findIndex(m => m.id === msgId);
        if(msgIndex !== -1){
          Object.assign(this.queryHistory[msgIndex], {
            isDeleted: true
          });
          this.queryHistory = [...this.queryHistory];
        }
        this.loading = false;
        this.msjService.showInfo("Mensaje eliminado correctamente", false, true);
      },
      error: () => {
        this.loading = false;
        this.msjService.showError("Error al eliminar el mensaje");
      }
    });
  }

  async closeQueryThread() {
    if (!this.queryHistory || this.queryHistory.length === 0) return;
    const docID = this.doc.id;

    this.loading = true;
    this.queryService.closeQuery(docID).subscribe({
      next: () => {
        this.loading = false;
        this.doc.threadClosed = true;
        this.closedQuery.emit(true);
        this.msjService.showInfo("La consulta ha sido cerrada correctamente", false, true);
        this.closeQuery();
      },
      error: (err) => {
        this.loading = false;
        this.msjService.showError("No se pudo cerrar la consulta");
        console.error("Error al cerrar hilo:", err);
      }
    });
  }
}
