<script lang="ts">
	import * as turf from '@turf/turf';
	import { onMount } from 'svelte';
	import osmtogeojson from 'osmtogeojson';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { bboxToLatLngBounds } from '../utils/helpers';

	function getBounds(map: L.Map) {
		const bounds = map.getBounds();
		const ne = bounds.getNorthEast();
		const sw = bounds.getSouthWest();
		return { ne, sw };
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
		console.log(body);
		const response = await fetch('https://overpass-api.de/api/interpreter', {
			method: 'POST',
			body
		});

		const data = await response.json();
		console.log(data.elements);

		return osmtogeojson(data);
	}

	onMount(async () => {
		const map = L.map('map').setZoom(19).setView([49.2827, -123.1207]);
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		const center = map.getCenter();

		const circle = turf.circle([center.lng, center.lat], 0.5, { units: 'kilometers' });
		const bounds = bboxToLatLngBounds(turf.bbox(circle));
		const elements = await fetchElements(bounds.getNorthWest(), bounds.getSouthEast());
		L.geoJSON(elements).addTo(map);
	});
</script>

<div id="map">LOL</div>

<style>
	#map {
		height: 100vh;
	}
</style>
