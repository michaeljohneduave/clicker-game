<script>
	import { onMount } from 'svelte';
	import osmtogeojson from 'osmtogeojson';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	async function fetchElements(lat, lon) {
		const response = await fetch('https://overpass-api.de/api/interpreter', {
			method: 'POST',
			body: `
      [out:json][timeout:10];
      (
        way["building"](49.2754,-123.1322,49.2904,-123.1147); // Downtown Vancouver bounding box
        relation["building"](49.2754,-123.1322,49.2904,-123.1147);
      );
      out geom;
      `
		});

		const data = await response.json();
		console.log(data.elements);

		return osmtogeojson(data);
	}

	onMount(async () => {
		const map = L.map('map').setView([49.24966, -123.11934], 13);
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		const elements = await fetchElements(49.24966, -123.11934);
		L.geoJSON(elements).addTo(map);
	});
</script>

<div id="map">LOL</div>

<style>
	#map {
		height: 100vh;
	}
</style>
