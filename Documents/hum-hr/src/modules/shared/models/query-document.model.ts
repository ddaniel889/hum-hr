export enum MsgType {
    DescuentoIncorrecto = 1,
    HorasExtrasNoLiquidadas = 2,
    ErrorEnHaberes = 3,
    Otros = 4
}

export const MsgTypeLabels: Record<MsgType, string> = {
    [MsgType.DescuentoIncorrecto]: 'Descuento Incorrecto',
    [MsgType.HorasExtrasNoLiquidadas]: 'Horas Extras No Liquidadas',
    [MsgType.ErrorEnHaberes]: 'Error en Haberes',
    [MsgType.Otros]: 'Otros'
};

export interface QueryDocument {
    id?: string;
    documentId: number;
    documentationName: string;
    ouId: number;
    creationDate?: Date | string;
    message: string;
    messageType: MsgType | string;
    userId: number;
    userName?: string;
    userMail?: string;
    readed?: boolean;
    closed?: boolean;
    isDeleted?: boolean;
  }
