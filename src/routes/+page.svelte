<script lang="ts">
  import * as turf from '@turf/turf';
  import { onMount } from 'svelte';
  import osmtogeojson from 'osmtogeojson';
  import L, { Polygon, type LatLngExpression } from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { bboxToLatLngBounds, renderGrid } from '../utils/helpers';
  import { NEUTRAL_BLDG_COST, VANCOUVER } from '../utils/constants';
  import { TinyColor } from '@ctrl/tinycolor';
  const colors = ['#00A5B5', '#FF6B6B', '#845EC2', '#59B24C', '#FF9671'];
  const clickMap = new Map<string, number>();
  const buildingColor = new TinyColor('grey').lighten(10);
  const playerColor = colors[Math.floor(Math.random() * colors.length)];
  const hoverColor = new TinyColor('black').lighten(50);
  console.log(buildingColor.toHexString());
  let nodeCount = $state(0);

  function getBounds(map: L.Map) {
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    return { ne, sw };
  }

  // Gradient color based on count of clicks
  function getCountColor(count: number) {
    console.log(count);
    if (count <= 0) {
      return buildingColor.toHexString();
    }

    const opacity = Math.ceil(Math.min((count / NEUTRAL_BLDG_COST) * 255, 255)).toString(16);
    console.log(opacity);
    return new TinyColor(playerColor).setAlpha(opacity).toHexString();
  }

  // min lat, min lon, max lat, max lon
  async function fetchElements(nw: L.LatLng, se: L.LatLng) {
    const coordString = `${se.lat},${nw.lng},${nw.lat},${se.lng}`;
    const body = `
      [out:json][timeout:10];
      (
        way["building"](${coordString}); // Downtown Vancouver bounding box
        relation["building"](${coordString});
      );
      out geom;
    `;
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body
    });

    const data = await response.json();

    return osmtogeojson(data);
  }

  async function startup(location: LatLngExpression) {
    const map = L.map('map', {
      touchZoom: false,
      // scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
      // zoomControl: false,
      doubleClickZoom: false
    })
      .setZoom(15)
      .setView(location);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
      // 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }
    ).addTo(map);

    const center = map.getCenter();
    const radius = 0.5;
    const circle = turf.circle([center.lng, center.lat], radius, { units: 'kilometers' });
    const bounds = bboxToLatLngBounds(turf.bbox(circle));
    const elements = await fetchElements(bounds.getNorthWest(), bounds.getSouthEast());

    nodeCount = elements.features.length;

    const buildingsLayer = L.geoJSON(elements, {
      style: {
        fillColor: buildingColor.toHexString(),
        color: ''
      },
      onEachFeature: (feature, layer) => {
        const id = `${feature.id!}`;

        const pathLayer = layer as L.Path;

        layer.on({
          mouseover: (e) => {
            pathLayer.setStyle({ color: hoverColor.toHexString(), weight: 1.5 });
          },
          mouseout: (e) => {
            pathLayer.setStyle({ color: '' });
          },
          click: (e) => {
            console.log(e);
            const ctr = clickMap.get(id) ?? NEUTRAL_BLDG_COST * -1;
            clickMap.set(id, ctr + 1);

            pathLayer.setStyle({ fillColor: getCountColor(ctr + 1) });
          }
        });
      }
    });

    buildingsLayer.addTo(map);
  }

  onMount(async () => {
    // Change to your location
    startup(VANCOUVER);
  });
</script>

<div class="main">
  <div id="map"></div>
  <div id="overlay">
    <span>Elements: {nodeCount}</span>
  </div>
</div>

<style>
  .main {
    position: relative;
  }

  #map {
    height: 99vh;
  }

  #overlay {
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
</style>
