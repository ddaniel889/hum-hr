import { Country } from "./country.model";

export class OrganizationalUnit {
  childs: OrganizationalUnit[];
  id: number;
  name: string;
  description: string;
  isRoot: boolean;
  enabled?: boolean;
  roles: string[];
  country: Country;
  isProductive: boolean;
  selected: boolean;
  parentOrganizationalUnitId: number;
  humanageTheme: string;
  darkMode: boolean;
  allowMultipleSign: boolean;
  canViewHumanageCustomSettings: boolean;
  canViewHumanageSettings: boolean;
  useSaml: boolean;
  enableEnhancedSearch: boolean;
  enableHumanageHrEmailChange: boolean;
  useMonitorUsage: boolean;
  useCandidatePromoteIncomplete: boolean;
  useRenewCertificate: boolean;
  useFormExportation: boolean;
  useMassivePendingNotification: boolean;
  useAdjetivationRolSignatory: boolean;
  useProcessWithMicroservices: boolean;
  usedisabledProcessMasiveSign?: boolean;
  useDashboard?: boolean;
  useConnect?: boolean;
  useDocComments?: boolean;
  entityId: string;
}
