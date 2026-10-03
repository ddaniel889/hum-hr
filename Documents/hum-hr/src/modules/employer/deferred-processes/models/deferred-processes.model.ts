export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedResponse<T> extends PaginationInfo {
  data: T[];
}

export interface OngoingProcessOrchestrationDto {
  id: string;
  created: string;
  createdByUserId?: string;
  createdByUserFirstName: string;
  createdByUserLastName?: string;
  createdByUserFullname?: string;
  createdDate: string;
  updated?: string;
  updatedDate?: string;
  updatedBy?: string;
  customer?: CustomerProcessDto;
  type: ProcessOrchestratorType;
  environment: CustomerEnvironmentDto;
  state: ProcessState;
  groupedState: ProcessGroupedState;
  groupedStateName: string;
  priority: ProcessPriority;
  currentStage?: ProcessOrchestratorStageDto;
  stageHistory: ProcessOrchestratorStageDto[] | null;
  totalActivities: number;
  totalActivitiesCompleted: number;
  totalActivitiesOngoing: number;
  totalActivitiesCompletedWithError: number;
  totalWarnings: number;
  totalErrors: number;
  totalProcessed: number;
  documentationTypeId?: string;
  documentationTypeName?: string;
  metadata?: ProcessOrchestratorMetadataDto[];
}

export interface CustomerProcessDto {
  customerGroupId: string;
  customerGroupCode: string;
  customerGroupName: string;
  customerGroupFullName: string;
  customerFullName: string;
  customerId: string;
  customerCode: string;
  customerName: string;
}

export interface ProcessOrchestratorStageDto {
  id: string;
  code: string;
  name: string;
  relatedProcessId: string | null;
  totalActivities: number;
  totalActivitiesCompleted: number;
  totalActivitiesCompletedWithError: number;
  totalActivitiesOngoing: number;
  totalErrors: number;
  totalIgnored: number;
  totalProcessed: number;
  totalToBeProcessed: number;
  totalWarnings: number;
  isFinished: boolean;
  started: string;
  finished: string;
}

export interface CustomerEnvironmentDto {
  name: string;
  code: string;
}

export enum ProcessGroupedState {
  InProgress = 1,
  Processed = 100,
  PendingActions = 200,
  DeleteInProgress = 300,
  Deleted = 390,
  ReprocessInProgress = 400,
  Reprocessed = 490,
  ProcessedWithErrorsAndPendingActions = 500,
  ProcessedWithErrors = 1000,
}

export enum ProcessDetailsState {
  HasError = 1000,
  NoError = 1500,
  HasPendingActions = 2000,
  NoPendingActions = 2500,
  Deleted = 3000,
  NoDeleted = 3500
}

export enum ProcessState {
  /**
   * Initial State
   */
  Created,

  /**
   * Is scheduled to run
   */
  Scheduled,

  /**
   * In Progress
   */
  InProgress,

  /**
   * Processed
   */
  Processed,

  /**
   * Blocked
   */
  Blocked,

  /**
   * Ignored, the action is not executed.
   */
  Ignored,

  /**
   * Archiving, once it is processed, after a while, the process files are purged and the registry is archived in Mongo.
   */
  Archived,

  /**
   * There was an error in the scheduling of the process, and it cannot be resolved automatically.
   */
  ScheduleError = 1000,

  /**
   * There was an error in the execution of the process, and it cannot be resolved automatically.
   */
  ProcessError,

  /**
   * Canceled
   */
  Canceled,
}

export enum ProcessPriority {
  None = 10,
  VeryLow = 5,
  Low = 4,
  Normal = 3,
  High = 2,
  VeryHigh = 1,
  Critical = 0,
}

export enum ProcessOrchestratorType {
  /**
   * Represents an invalid or unrecognized process orchestrator type.
   */
  NotValidType = -1,

  /**
   * Purge Orchestration Engine Instances
   */
  PurgeEngineInstances = 1,

  /**
   * Represents a process orchestrator medic type.
   * This type is used to identify and handle specific orchestrator medic processes within the system.
   */
  ProcessOrchestratorMedic = 50,

  /**
   * Represents the metrics associated with a process orchestrator.
   */
  ProcessOrchestratorMetrics = 51,

  /**
   * Represents the process orchestrator type for updating customer data.
   */
  CustomerDataUpdate = 52,

  /**
   * Represents the type for updating set metrics in the process orchestrator.
   */
  UpdateSetMetrics = 8009,

  /**
   * Represents the type for automatically updating set metrics in the process orchestration.
   */
  AutomaticUpdateSetMetrics = 8012,

  /**
   * Represents the process orchestrator type for uploading documentation with automatic identification.
   */
  UploadingDocumentationAutomaticIdentification = 8004,

  /**
   * Represents the process orchestrator type for deleting documents by process ID.
   * This enumerator value is used to identify the specific process orchestrator responsible for
   * handling the deletion of documents associated with a given process ID.
   */
  DeleteDocumentsByProcessId = 8007,

  /**
   * Represents the process orchestrator type for reprocessing documents by process ID.
   */
  ReprocessDocumentsByProcessId = 100,

  /**
   * Represents the process orchestrator type for importing employee data.
   */
  EmployeeImport = 10,

  /**
   * Represents the process orchestrator type for importing candidate data.
   */
  CandidateImport = 11,
}

export interface ProcessOrchestratorResultDetailDto {
  id: string;
  created: string;
  createdByUserId?: string;
  createdByUserFirstName?: string;
  createdByUserLastName?: string;
  createdByUserFullname?: string;
  createdDate: string;
  updated?: string | null;
  updatedDate?: string | null;
  updatedBy?: string | null;
  processOrchestratorId: string;
  processOrchestratorType: ProcessOrchestratorType;
  processFileId: string;
  activityId: string;
  documentId: number;
  pages?: number[];
  employeeFound: boolean;
  identifier?: string;
  hasWarning:boolean;
  hasError:boolean;
  userId?: string;
  firstName?: string;
  lastName?: string;
  employeeFileId?: string;
}

export type PaginatedParams = {
  pageNumber?: number;
  pageSize?: number;
}
export type OngoingParams = PaginatedParams & {
  customergroupcode: number;
}

export type ProcessSearchParams = PaginatedParams & {
  customergroupcode?: number;
  groupedState?: string;
  type?: string;
  createdFrom?: string | null;
  createdTo?: string | null;
};

export type ProcessDetailParams = PaginatedParams &  {
  onlyError: boolean;
  queryFilter?: string;
  state?: string;
};

export interface HistoryProcessOrchestrationDto {
  id: string;
  created: string;
  createdDate?: string;
  createdByUserId?: string | null;
  createdByUserFirstName?: string;
  createdByUserLastName?: string;
  createdByUserFullname?: string;
  updated?: string | null;
  updatedDate?: string | null;
  updatedBy?: string | null;
  customer?: CustomerProcessDto | null;
  type: ProcessOrchestratorType;
  state: ProcessState;
  groupedState: ProcessGroupedState;
  groupedStateName: string;
  priority: ProcessPriority;
  currentStage?: ProcessOrchestratorStageDto;
  stageHistory?: ProcessOrchestratorStageDto[];
  totalActivities: number;
  totalActivitiesCompleted: number;
  totalActivitiesOngoing: number;
  totalActivitiesCompletedWithError: number;
  totalWarnings: number;
  totalErrors: number;
  totalProcessed: number;
  metadata?: ProcessOrchestratorMetadataDto[];
  documentationTypeId?: string;
}

export interface ProcessOrchestratorMetadataDto {
  key: string;
  label: string;
  value?: unknown;
}

export interface ProcessOrchestratorDto {
  id: string;
  created: string;
  createdByUserId?: string;
  createdByUserFirstName?: string;
  createdByUserLastName?: string;
  createdByUserFullname?: string;
  createdDate: string;
  updated: string;
  updatedDate: string;
  updatedBy?: string;
  customer?: CustomerProcessDto;
  type: ProcessOrchestratorType;
  environment: CustomerEnvironmentDto;
  state: ProcessState;
  priority: ProcessPriority;
  currentStage: ProcessOrchestratorStageDto;
  groupedState: ProcessGroupedState;
  groupedStateName: string;
  totalActivities: number;
  totalActivitiesOngoing: number;
  totalActivitiesCompleted: number;
  totalActivitiesCompletedWithError: number
  totalWarnings: number;
  totalErrors: number;
  totalProcessed: number;
  metadata?: ProcessOrchestratorMetadataDto[];
  stageHistory?: ProcessOrchestratorStageDto[];
}
