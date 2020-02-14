import GeometryObject = GeoJSON.GeometryObject;
import { GenericGeoJSONFeatureCollection } from '@yaga/generic-geojson';

export interface PointDataProperties {
  n_trials: number;
  n_positive: number;
  prevalence_prediction: number;
}

export interface FnRequest {
  point_data: GenericGeoJSONFeatureCollection<GeometryObject, PointDataProperties>;
}