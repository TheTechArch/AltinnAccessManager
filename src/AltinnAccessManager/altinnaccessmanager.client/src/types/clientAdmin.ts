// Types for Client Admin API

export interface PaginatedResultLinks {
  next: string | null;
}

export interface PaginatedResult<T> {
  links: PaginatedResultLinks;
  data: T[];
}

export interface CompactEntityDto {
  id: string;
  name: string | null;
  type: string | null;
  variant: string | null;
  keyValues: Record<string, string> | null;
  parent: CompactEntityDto | null;
  children: CompactEntityDto[] | null;
  partyid: number | null;
  userId: number | null;
  username: string | null;
  organizationIdentifier: string | null;
  personIdentifier: string | null;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface CompactRoleDto {
  id: string;
  code: string | null;
  urn: string | null;
  'legacyurn ': string | null;
  children: CompactRoleDto[] | null;
}

export interface CompactPackageDto {
  id: string;
  urn: string | null;
  areaId: string;
}

export interface RoleAccessPackages {
  role: CompactRoleDto | null;
  packages: CompactPackageDto[] | null;
}

export interface ClientDto {
  client: CompactEntityDto | null;
  access: RoleAccessPackages[] | null;
}

export interface AgentRoleAccessPackages {
  role: CompactRoleDto | null;
  packages: CompactPackageDto[] | null;
}

export interface AgentDto {
  agent: CompactEntityDto | null;
  access: AgentRoleAccessPackages[] | null;
}

export interface AssignmentDto {
  id: string;
  roleId: string;
  fromId: string;
  toId: string;
}

export interface DelegationDto {
  roleId: string;
  packageId: string;
  viaId: string;
  fromId: string;
  toId: string;
  changed: boolean;
}

export interface Permission {
  role: string | null;
  packages: string[] | null;
}

export interface DelegationBatchInputDto {
  values: Permission[] | null;
}

export interface PersonInput {
  personIdentifier: string | null;
  lastName: string | null;
}
