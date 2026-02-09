// Types matching the Altinn Metadata API DTOs

export interface ProviderTypeDto {
  id: string;
  name: string | null;
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

export interface TypeDto {
  id: string;
  providerId: string;
  name: string | null;
  provider: ProviderDto | null;
}

export interface ResourceTypeDto {
  id: string;
  name: string | null;
}

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

export interface PackageDto {
  id: string;
  name: string | null;
  urn: string | null;
  description: string | null;
  isDelegable: boolean;
  isAssignable: boolean;
  isResourcePolicyAvailable: boolean;
  area: AreaDto | null;
  type: TypeDto | null;
  resources: ResourceDto[] | null;
}

export interface AreaDto {
  id: string;
  name: string | null;
  urn: string | null;
  description: string | null;
  iconUrl: string | null;
  packages: PackageDto[] | null;
  group: AreaGroupDto | null;
}

export interface AreaGroupDto {
  id: string;
  name: string | null;
  urn: string | null;
  description: string | null;
  type: string | null;
  areas: AreaDto[] | null;
}

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

export interface SubTypeDto {
  id: string;
  typeId: string;
  name: string | null;
  description: string | null;
  type: TypeDto | null;
}

export interface SearchWord {
  content: string | null;
  lowercaseContent: string | null;
  isMatch: boolean;
  score: number;
}

export interface SearchField {
  field: string | null;
  value: string | null;
  score: number;
  words: SearchWord[] | null;
}

export interface SearchObjectOfPackageDto {
  object: PackageDto | null;
  score: number;
  fields: SearchField[] | null;
}
