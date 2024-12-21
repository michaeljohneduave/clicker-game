import { LatLngBounds } from "leaflet";
import * as turf from "@turf/turf";

export function bboxToLatLngBounds(bbox: ReturnType<typeof turf.bbox>): LatLngBounds {
  return new LatLngBounds([
    [bbox[1], bbox[0]],
    [bbox[3], bbox[2]],
  ]);
}