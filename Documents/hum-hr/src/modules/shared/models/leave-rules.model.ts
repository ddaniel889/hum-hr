export class LeaveRules{
  id?: number;
  leaveMinDays?: number;
  leaveStartDay?: string;
  nextAbleDay?: boolean;
  configLeaveOuId?: number;
  useConsecutiveDays?: boolean;
  leaveTypeOuId?:number;
}

export function getKey(leaveStartDay: string)
{
  switch (leaveStartDay.toLowerCase()) {
    case 'lunes': return 1;
    case 'martes': return 2;
    case 'miércoles': return 3;
    case 'miercoles': return 3;
    case 'jueves': return 4;
    case 'viernes': return 5;
    case 'sabado': return 6;
    case 'domingo': return 0;
    default: return -1;
  }
}
