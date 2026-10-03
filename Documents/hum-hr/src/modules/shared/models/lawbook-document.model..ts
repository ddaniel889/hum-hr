import { DocumentTypeDefinition } from './document-type-definition.model';
import { FileDocumentMetadata } from './file-document-metadata.model';
import { LsdStates } from './lsd-states.model';
export class LawbookDocument {
    public static readonly periodSystemName = "_peri";
    public static readonly tipoPresentacionSysName = '_tpresentacion';
    public static readonly tipoNominaSysName = '_tnomina';
    public static readonly sateSysName = '_estadoLLS';
    public static readonly commentSysName = '_coment';
    public static readonly nonEditableMetadata: string[] = ["_peri", '_estadoLLS', '_tnomina', '_tpresentacion'];

    id: number;
    documentType: DocumentTypeDefinition;
    metadatas: FileDocumentMetadata[];
    organizationalUnitId: number;
    organizationalUnitName?: string;
    name: string;
    categories: any[];
    containers: any[];
    isDocumentPerFile: boolean;
    signFileNames: String[];
    documentDate: Date;
    documentTypeSystemName: string;
    hasFiles: boolean;
    statusId: number;
    versionId?: number;

    constructor() {
        this.name = '';
        this.isDocumentPerFile = false;
        this.metadatas = [];
        this.signFileNames = [];
    }

    get period(): string {
        return this.getMetadataValue(LawbookDocument.periodSystemName);
    }
    set period(value: string) {
        this.setMetadata(LawbookDocument.periodSystemName, value);
    }

    get nomina(): string {
        return this.getMetadataValueDescription(LawbookDocument.tipoNominaSysName);
    }
    set nomina(value: string) {
        this.setMetadata(LawbookDocument.tipoNominaSysName, value);
    }

    get presentacion(): string {
        return this.getMetadataValueDescription(LawbookDocument.tipoPresentacionSysName);
    }
    set presentacion(value: string) {
        this.setMetadata(LawbookDocument.tipoPresentacionSysName, value);
    }

    get presentacionValue(): string {
        return this.getMetadataValue(LawbookDocument.tipoPresentacionSysName);
    }
    set presentacionValue(value: string) {
        this.setMetadata(LawbookDocument.tipoPresentacionSysName, value);
    }

    get estado(): string {
        return this.getMetadataValueDescription(LawbookDocument.sateSysName);
    }
    set estado(value: string) {
        this.setMetadata(LawbookDocument.sateSysName, value);
    }

    get comment(): string {
        return this.getMetadataValue(LawbookDocument.commentSysName);
    }
    set periodcomment(value: string) {
        this.setMetadata(LawbookDocument.commentSysName, value);
    }

    getMetadataValue(key: string): any {
        const mv = this.getMetadata(key);
        return mv != null ? mv.metadataValue : null;
    }

    getMetadataValueDescription(key: string): any {
        const mv = this.getMetadata(key);
        if (!mv) {
            return null;
        }
        return mv.metadataValueDescription != null ? mv.metadataValueDescription : mv.metadataValue;
    }

    getMetadata(key: string): FileDocumentMetadata {
        if (!this.metadatas) {
            return null;
        }
        const mvalues = this.metadatas.filter(
            item => item.systemName === key
        );
        if (mvalues.length > 0) {
            return mvalues[0];
        }

        return null;
    }

    setMetadataFull(metadato: any, value: any) {
        let metadata = this.getMetadata(metadato.systemName);

        if (metadata != null) {
            metadata.metadataValue = value;
        } else {
            metadata = new FileDocumentMetadata();

            metadata.systemName = metadato.systemName;
            metadata.metadataValue = value;
            metadata.metadataId = 0; // va 0 o null?
            metadata.asName = metadato.asName;
            metadata.metadataIsRequired = metadato.metadataIsRequired;
            metadata.metadataIsUnique = metadato.metadataIsUnique;
            metadata.metadataLabel = metadato.metadataLabel;
            metadata.metadataType = metadato.metadataType;
            metadata.metadataValueDescription = metadato.metadataValueDescription;
            metadata.position = metadato.position;

            this.metadatas.push(metadata);
        }
    }

    setMetadata(key: string, value: any) {
        let metadata = this.getMetadata(key);

        if (metadata != null) {
            metadata.metadataValue = value;
        } else {
            metadata = new FileDocumentMetadata();

            metadata.systemName = key;
            if (!value || !value.$date) {
                metadata.metadataValue = value;
            } else {
                const now = new Date();
                metadata.metadataValue = new Date(+value.$date + now.getTimezoneOffset() * 60 * 1000);
            }
            metadata.metadataId = 0; // va 0 o null?
            metadata.asName = false;
            metadata.metadataIsRequired = false;
            metadata.metadataIsUnique = false;
            metadata.metadataLabel = null;
            metadata.metadataType = null;
            metadata.metadataValueDescription = null;
            metadata.position = 0;

            this.metadatas.push(metadata);
        }
    }

    toDocumentVersionDTO(): any {
        const documentTypes = [
            {
                documentTypeId: this.documentType.id,
                metadatas: this.metadatas
            }
        ];

        return {
            id: this.id,
            organizationalUnitId: this.organizationalUnitId,
            name: this.name,
            categories: this.categories,
            containers: this.containers,
            isDocumentPerFile: this.isDocumentPerFile,
            documentTypes: documentTypes,
            signFileNames: this.signFileNames
        };
    }

    isFinished(states: LsdStates[]): boolean {
        const finishOk = states.find(s => s.key === "FinishOk");
        if (finishOk.states.findIndex(s => s === this.getMetadataValue(LawbookDocument.sateSysName)) > -1) {
            return true;
        }

        const finishError = states.find(s => s.key === "FinishError");
        if (finishError.states.findIndex(s => s === this.getMetadataValue(LawbookDocument.sateSysName)) > -1) {
            return true;
        }

        return false;
    }

    getStateClass(states: LsdStates[]): string {
        const finishOk = states.find(s => s.key === "FinishOk");
        if (finishOk.states.findIndex(s => s === this.getMetadataValue(LawbookDocument.sateSysName)) > -1) {
            return "ok";
        }

        const finishError = states.find(s => s.key === "FinishError");
        if (finishError.states.findIndex(s => s === this.getMetadataValue(LawbookDocument.sateSysName)) > -1) {
            return "not-ok";
        }

        return "pending";
    }

    getStateIcon(states: LsdStates[]) {
        const finishOk = states.find(s => s.key === "FinishOk");
        if (finishOk.states.findIndex(s => s === this.getMetadataValue(LawbookDocument.sateSysName)) > -1) {
            return "fa-file-check";
        }

        const finishError = states.find(s => s.key === "FinishError");
        if (finishError.states.findIndex(s => s === this.getMetadataValue(LawbookDocument.sateSysName)) > -1) {
            return "fa-file-times";
        }

        return "fa-file-upload";
    }

    getMetadataIcon(systemName: string) {
        switch (systemName) {
            case LawbookDocument.sateSysName:
                return "fa-file-medical-alt";
            case LawbookDocument.commentSysName:
                return "fa-comment-alt";
            default:
                return "fa-file-alt";
        }
    }

    public setMetadataValue(systemName: string, value: any) {
        const metadata = this.getMetadata(systemName);
        if (metadata) {
            metadata.metadataValue = value;
        } else {
            const meta = new FileDocumentMetadata();
            meta.systemName = systemName;
            meta.metadataValue = value;
            this.metadatas.push(meta);
        }
    }

    public setDescriptionValue(systemName: string, value: any) {
        const metadata = this.getMetadata(systemName);
        if (metadata) {
            if (metadata.metadataType === 'comboKV' || metadata.metadataType === 'combo') {
                metadata.metadataValueDescription = value;
            }
        }
    }

    public canEdit(systemName: string): boolean {
        return LawbookDocument.nonEditableMetadata.findIndex(m => m === systemName) < 0;
    }
}
