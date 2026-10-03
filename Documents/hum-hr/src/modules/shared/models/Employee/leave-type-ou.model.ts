import { LeaveType } from "./leave-type.model";

export interface LeaveTypeOu {
  id: number;
  isAccumulateDays: boolean;
  leaveType: LeaveType;
  workflowApprove?: WorkflowApproveType
}

export interface WorkflowApproveType {
  id: number;
  description: string;
}
