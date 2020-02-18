import GeometryObject = GeoJSON.GeometryObject;
import { GenericGeoJSONFeatureCollection, GenericGeoJSONFeature } from '@yaga/generic-geojson';

export enum DebugTypes {
  log = 'log',
  file = 'file',
}

export interface RawOrgUnit {
  code: string;
  level: number;
  created: string;
  lastUpdated: string;
  name: string;
  id: string;
  shortName: string;
  path: string;
  openingDate: string;
  user: {
    id: string;
  };
  geometry: {
    type: string;
    coordinates: number[];
  };
  parent: {
    id: string;
  };
}

export enum OrgUnitFields {
  id = 'id',
  orgUnit_id = 'orgUnit_id',
  orgUnit_name = 'orgUnit_name',
}

export type OrgUnitsProperties = {
  [key in OrgUnitFields]: string;
};

export interface OrgUnitsFeature {
  type: string;
  properties: OrgUnitsProperties;
  geometry: GeometryObject;
}

export interface DataValue {
  dataElement: string;
  value: string;
  period: string;
  orgUnit: string;
  lastUpdated: string;
  categoryOptionCombo?: string;
  attributeOptionCombo?: string;
  storedBy?: string;
  created?: string;
  followup?: boolean;
}

export interface DataValueSets {
  dataValues: DataValue[];
}

export interface RawDataElement {
  code: string;
  lastUpdated: string;
  id: string;
  created: string;
  name: string;
  shortName: string;
  aggregationType: string;
  domainType: string;
  publicAccess: string;
  valueType: string;
  zeroIsSignificant: boolean;
  categoryCombo: any;
  lastUpdatedBy: any;
  user: any;
  translations: any[];
  userGroupAccesses: any[];
  attributeValues: any[];
  userAccesses: any[];
  legendSets: any[];
  aggregationLevels: number[];
}

export interface DataElementLookup {
  [name: string]: string;
}

export enum PointDataFields {
  n_trials = 'n_trials',
  n_positive = 'n_positive',
  prevalence_prediction = 'prevalence_prediction',
}

export type PointDataProperties = {
  [key in PointDataFields]: number;
};

export interface PointDataFeature {
  geometry: GeometryObject;
  properties: PointDataProperties & OrgUnitsProperties;
}

export type CombinedProperties = Partial<PointDataProperties & OrgUnitsProperties>;

export type CombinedFeature = GenericGeoJSONFeature<GeometryObject, CombinedProperties>;

export type CombinedFeatureCollection =
  GenericGeoJSONFeatureCollection<GeometryObject, CombinedProperties>;

export interface FnRequest {
  point_data: CombinedFeatureCollection;
}

export type RunResult = GenericGeoJSONFeatureCollection<GeometryObject, any>;

export interface FnResponse {
  function_status: 'success' | 'error';
  result: RunResult;
}
