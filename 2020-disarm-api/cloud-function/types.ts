import GeometryObject = GeoJSON.GeometryObject;
import { GenericGeoJSONFeatureCollection, GenericGeoJSONFeature } from '@yaga/generic-geojson';


export enum PointDataField {
  n_trials = 'n_trials',
  n_positive = 'n_positive',
  prevalence_prediction = 'prevalence_prediction',
}

export type PointDataProperties = {
  [key in PointDataField]: number;
}

export interface PointDataFeature {
  geometry: GeometryObject;
  properties: PointDataProperties & OrgUnitsProperties;
}

export type InterimProperties = Partial<PointDataProperties & OrgUnitsProperties>;

export type InterimFeature = GenericGeoJSONFeature<GeometryObject, InterimProperties>;

export type PointDataFeatureCollection =
  GenericGeoJSONFeatureCollection<GeometryObject, PointDataProperties>;

export interface FnRequest {
  point_data: PointDataFeatureCollection;
}

export interface DataValue {
  dataElement: string;
  period: string;
  orgUnit: string;
  categoryOptionCombo: string;
  attributeOptionCombo: string;
  value: string;
  storedBy: string;
  created: string;
  lastUpdated: string;
  followup: boolean;
}

export interface DataValueSets {
  dataValues: DataValue[];
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
  },
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
}

export interface OrgUnitsFeature {
  type: string;
  properties: OrgUnitsProperties;
  geometry: GeometryObject;
}

export interface DataElementLookup {
  [name: string]: string;
}