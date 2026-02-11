// Types for Connections API - managing direct rights (access packages) given to persons and organizations

import type { PaginatedResult, CompactEntityDto, CompactRoleDto, CompactPackageDto, AssignmentDto, PersonInput } from './clientAdmin';

export type { PaginatedResult, CompactEntityDto, CompactRoleDto, CompactPackageDto, AssignmentDto, PersonInput };

// Compact Resource DTO
export interface CompactResourceDto {
  id: string;
  value: string | null;
}

// Access Package DTO
export interface AccessPackageDto {
  id: string;
  urn: string;
  areaId: string;
}

// Resource DTO
export interface ResourceDto {
  id: string;
  providerId: string;
  typeId: string;
  name: string | null;
  description: string | null;
  refId: string | null;
  provider: ProviderDto | null;
  type: ResourceTypeDto | null;
}

export interface ProviderDto {
  id: string;
  name: string | null;
  refId: string | null;
  logoUrl: string | null;
  code: string | null;
  typeId: string;
  type: ProviderTypeDto | null;
}

export interface ProviderTypeDto {
  id: string;
  name: string | null;
}

export interface ResourceTypeDto {
  id: string;
  name: string | null;
}

// Role DTO
export interface RoleDto {
  id: string;
  name: string | null;
  code: string | null;
  description: string | null;
  isKeyRole: boolean;
  urn: string | null;
  legacyRoleCode: string | null;
  legacyUrn: string | null;
  isResourcePolicyAvailable: boolean;
  provider: ProviderDto | null;
}

// Connection DTO - represents a party that has been given rights
export interface ConnectionDto {
  party: CompactEntityDto;
  roles: CompactRoleDto[];
  packages: AccessPackageDto[];
  resources: ResourceDto[];
  connections: ConnectionDto[];
}

// Permission DTO
export interface PermissionDto {
  from: CompactEntityDto | null;
  to: CompactEntityDto | null;
  via: CompactEntityDto | null;
  role: CompactRoleDto | null;
  viaRole: CompactRoleDto | null;
}

// Package Permission DTO
export interface PackagePermissionDto {
  package: CompactPackageDto;
  permissions: PermissionDto[];
}

// Role Permission DTO
export interface RolePermissionDto {
  role: RoleDto;
  permissions: PermissionDto[];
}

// Resource Permission DTO
export interface ResourcePermissionDto {
  resource: CompactResourceDto;
  permissions: PermissionDto[];
}

// Assignment Package DTO
export interface AssignmentPackageDto {
  id: string;
  assignmentId: string;
  packageId: string;
}

// Assignment Resource DTO
export interface AssignmentResourceDto {
  id: string;
  assignmentId: string;
  resourceId: string;
}

// Action DTO for resource check
export interface ActionDto {
  actionKey: string;
  actionName: string;
  result: boolean;
  reasons: ActionReason[];
}

export interface ActionReason {
  description: string;
  reasonKey: string;
  roleId: string | null;
  roleUrn: string | null;
  packageId: string | null;
  packageUrn: string | null;
  fromId: string | null;
  fromName: string | null;
  toId: string | null;
  toName: string | null;
  viaId: string | null;
  viaName: string | null;
  viaRoleId: string | null;
  viaRoleUrn: string | null;
}

// Resource Check DTO
export interface ResourceCheckDto {
  resource: ResourceDto;
  actions: ActionDto[];
}

// Access Package Delegation Check
export interface AccessPackageDtoCheck {
  package: AccessPackageDto;
  result: boolean;
  reasons: AccessPackageCheckReason[];
}

export interface AccessPackageCheckReason {
  description: string;
  roleId: string | null;
  roleUrn: string | null;
  fromId: string | null;
  fromName: string | null;
  toId: string | null;
  toName: string | null;
  viaId: string | null;
  viaName: string | null;
  viaRoleId: string | null;
  viaRoleUrn: string | null;
}
