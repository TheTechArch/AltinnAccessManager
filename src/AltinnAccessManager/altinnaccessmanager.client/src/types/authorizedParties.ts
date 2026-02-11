// Authorized Parties types

export interface AuthorizedPartyExternal {
  partyUuid: string;
  name?: string;
  organizationNumber?: string;
  parentId?: string;
  personId?: string;
  dateOfBirth?: string;
  partyId: number;
  type?: 'None' | 'Person' | 'Organization' | 'SelfIdentified';
  unitType?: string;
  isDeleted: boolean;
  onlyHierarchyElementWithNoAccess: boolean;
  authorizedAccessPackages?: string[];
  authorizedResources?: string[];
  authorizedRoles?: string[];
  authorizedInstances?: AuthorizedResourceInstance[];
  subunits?: AuthorizedPartyExternal[];
}

export interface AuthorizedResourceInstance {
  resourceId?: string;
  instanceId?: string;
}
