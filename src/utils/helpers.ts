import { LatLngBounds, Polygon } from "leaflet";
import * as turf from "@turf/turf";
import * as turfHelpers from "@turf/helpers";
import {squareGrid} from "@turf/square-grid";
import type { Geometry } from "geojson";

export function bboxToLatLngBounds(bbox: ReturnType<typeof turf.bbox>): LatLngBounds {
  return new LatLngBounds([
    [bbox[1], bbox[0]],
    [bbox[3], bbox[2]],
  ]);
}

export function getNeighbors (nodes: Geometry[], node: Geometry): Geometry[] {
  const neighbors: Geometry[] = [];
  for (const n of nodes) {
    if (n !== node) {
      if (turf.booleanWithin(n, node)) {
        neighbors.push(n);
      }
    }
  }
  return neighbors;
}

export class SpatialGrid {
  cells: Map<string, Geometry[]>;
  cellSize: number;

  constructor(cellSize = 100) {
    this.cells = new Map();
    this.cellSize = cellSize;
  }

  getCellKey (point: Geometry): string {
    return ""
  }

  addNode (node: Geometry): void {

  }

  getNeighbors (node: Geometry): Geometry[] {
    return [];
  }
}

export function renderGrid ({center, radius, gridSize, units}: {
  center: number[];
  radius: number;
  gridSize: number;
  units: turfHelpers.Units;
}) {
  const circle = turf.circle(center, radius, {
    units: units,
  });
  const bbox = turf.bbox(circle);
  const grid = squareGrid(bbox, gridSize, {
    units: units,
  });
  return grid;
} 