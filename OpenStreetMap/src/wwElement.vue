<template>
  <div class="openstreetmap-element">
    <div ref="mapContainer" class="leaflet-map-container" :style="mapStyle"></div>
    
    <!-- Clustering controls -->
    <div class="clustering-controls" v-if="true">
      <div class="clustering-header">
        <label class="clustering-label">Marker Clustering</label>
        <label class="clustering-toggle">
          <input
            type="checkbox"
            v-model="enableClustering"
            @change="toggleClustering"
          >
          <span>{{ enableClustering ? 'ON' : 'OFF' }}</span>
        </label>
      </div>
      
      <div class="clustering-options" v-if="enableClustering">
        <div class="clustering-slider">
          <label>Cluster Radius: {{ clusterRadius }}km</label>
          <input
            type="range"
            v-model.number="clusterRadius"
            min="1"
            max="200"
            @input="updateClustering"
          >
        </div>
        
        <div class="clustering-stats">
          <span>Visible: {{ visibleMarkers }}</span>
          <span>Clusters: {{ clusterGroups.length }}</span>
        </div>
      </div>
      
      <!-- Map type selector -->
      <div class="map-type-selector">
        <div class="map-type-header">
          <label class="map-type-label">Map Type:</label>
        </div>
        <select v-model="currentMapType" @change="changeMapType">
          <option value="osm">OpenStreetMap</option>
          <option value="satellite">Satellite</option>
          <option value="terrain">Terrain</option>
          <option value="dark">Dark Mode</option>
          <option value="light">Light Mode</option>
        </select>
      </div>
    </div>

    <!-- Unified geolocation panel -->
    <div class="geolocation-panel" v-if="userPosition.latitude !== null">
      <div class="geo-coordinates">
        <div class="geo-row">
          <span class="geo-label">Latitude:</span>
          <span class="geo-value">{{ userPosition.latitude.toFixed(2) }}</span>
        </div>
        <div class="geo-row">
          <span class="geo-label">Longitude:</span>
          <span class="geo-value">{{ userPosition.longitude.toFixed(2) }}</span>
        </div>
        <div class="geo-row">
          <span class="geo-label">Accuracy:</span>
          <span class="geo-value">{{ formatDistance(accuracyRadius) }}</span>
        </div>
        <div class="geo-row">
          <span class="geo-label">Zoom:</span>
          <span class="geo-value">{{ currentZoom }}</span>
        </div>
      </div>

      <div class="accuracy-controls">
        <div class="accuracy-header">
          <span class="accuracy-label">Accuracy ({{ unit }}):</span>
        </div>

        <div class="slider-container">
          <input
            type="range"
            v-model.number="accuracySlider"
            min="1"
            :max="maxSliderRange"
            class="accuracy-slider"
            @input="updateAccuracyFromSlider"
          >
          <div class="slider-labels">
            <span>1 {{ unit }}</span>
            <span>{{ maxSliderRange }} {{ unit }}</span>
          </div>
        </div>

        <div class="accuracy-input">
          <input
            type="number"
            v-model.number="accuracySlider"
            min="1"
            :max="maxSliderRange"
            class="accuracy-number"
            @input="updateAccuracyFromInput"
          >
          <span class="unit-label">{{ unit }}</span>
        </div>

        <div class="unit-toggle">
          <label class="unit-checkbox">
            <input
              type="checkbox"
              v-model="useMiles"
              @change="toggleUnits"
            >
            <span>Use miles</span>
          </label>
        </div>
      </div>
    </div>
    
    
    <!-- Collection markers toggle -->
    <div class="collection-toggle" v-if="true">
      <span>📍 Collection Markers: {{ collectionMarkers.length }}</span>
      <span v-if="dummyMarkers.length > 0"> | Dummy: {{ dummyMarkers.length }}</span>
    </div>
    
    <div class="debug-panel" v-if="showDebug">
      <div class="debug-info">
        <h3>🗺️ OpenStreetMap Debug Info</h3>
        <p>Zoom: {{ currentZoom }}</p>
        <p>Collection Markers: {{ collectionMarkers.length }}</p>
        <p>Dummy Markers: {{ dummyMarkers.length }}</p>
        <p>User Status: {{ userStatus }}</p>
        <p>Accuracy: {{ formatAccuracy(userPosition.accuracy) }}</p>
        <p>Radius: {{ formatDistance(accuracyRadius) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  props: {
    content: { type: Object, required: true },
  },
  data() {
    return {
      map: null,
      isDestroyed: false,
      showDebug: false, // Use config property instead of hardcoded true
      // Add back collection markers functionality
      collectionMarkers: [],
      dummyMarkers: [],
      showDummyMarkers: true, // Force show dummy markers
      currentPositionMarker: null,
      accuracyCircle: null,
      zoomHandler: null,
      initTimeout: null,
      currentZoom: null,
      // Enhanced geolocation features
      userPosition: {
        latitude: 52.19,
        longitude: 21.00,
        accuracy: null
      },
      accuracyRadius: 1, // Default accuracy radius in km
      useMiles: false, // Default to km
      accuracySlider: 1, // Default slider value (1-50 km)
      // Clustering properties
      enableClustering: false,
      clusterRadius: 10, // kilometers
      clusterGroups: [],
      visibleMarkers: 0,
      // Map type properties
      currentMapType: 'osm',
      tileLayer: null,
      // Popup customization properties
      popupWidth: 250, // pixels
      popupHeight: 120, // pixels
      popupContentTemplate: 'default', // 'default', 'detailed', 'minimal'
      showCoordinatesInPopup: true,
      showMarkerNumber: true,
    };
  },
  computed: {
    mapStyle() {
      return {
        height: '100%',
        width: '100%',
      };
    },
    unit() {
        return this.useMiles ? 'miles' : 'km';
    },
    maxSliderRange() {
        return this.useMiles ? 50 : 50;
    },
  },
  mounted() {
    console.log('☢️ Initializing OpenStreetMap with dual map seamless panning');
    this.initMap();
    this.currentZoom = this.content.zoom || 13;
    
    // Add back collection markers and user position functionality
    this.$nextTick(() => {
      this.initTimeout = setTimeout(() => {
        if (this.map && !this.isDestroyed) {
          this.$nextTick(() => {
            this.initTimeout = setTimeout(() => {
              if (this.map && !this.isDestroyed) {
                this.generateDummyMarkers(); // Generate dummy markers first
                this.setupZoomTracking();
                this.generateDummyMarkers(); // Ensure markers are generated
                this.updateCollectionMarkers(); // Then display them
                this.getCurrentPosition();
              }
            }, 100);
          });
        }
      }, 100);
    });
  },
  beforeDestroy() {
    this.cleanup();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    initMap() {
      console.log('☢️ Creating OpenStreetMap with seamless panning');
      
      // Check if map already exists and clean it up first
      if (this.map) {
        console.log('☢️ Cleaning up existing map before creating new one');
        this.cleanup();
      }
      
      // Ensure the DOM element exists before proceeding
      this.$nextTick(() => {
        if (this.$refs.mapContainer) {
          // Clear any existing content but don't interfere with Leaflet's cleanup
          if (this.$refs.mapContainer._leaflet_id) {
            console.log('☢️ Map container already has Leaflet instance, cleaning up');
            try {
              // Try to remove existing Leaflet instance properly
              const existingMap = this.$refs.mapContainer._leaflet_map;
              if (existingMap && existingMap.remove) {
                existingMap.remove();
              }
            } catch (e) {
              console.warn('⚠️ Could not clean up existing Leaflet instance:', e);
            }
          }
          
          // Create single map with world copy jump for seamless panning
          try {
            this.createSingleMap();
            
            // Only setup tile layer if map was created successfully
            if (this.map) {
              this.setupTileLayer();
              console.log('☢️ Map created successfully with Leaflet native controls');
            } else {
              console.error('❌ Map creation failed - map is null');
              // Don't retry immediately to avoid infinite loops
              setTimeout(() => {
                if (!this.map) this.initMap();
              }, 500);
            }
          } catch (error) {
            console.error('❌ Error during map creation:', error);
            // Don't retry immediately to avoid infinite loops
            setTimeout(() => {
              if (!this.map) this.initMap();
            }, 500);
          }
        } else {
          console.error('❌ Map container not found in DOM');
          // Don't retry immediately to avoid infinite loops
          setTimeout(() => {
            if (!this.map) this.initMap();
          }, 500);
        }
      });
    },

    createDualMaps() {
      console.log('☢️ Creating dual maps for seamless panning');
      
      // Ensure DOM elements exist before creating maps
      if (!this.$refs.mapContainer1 || !this.$refs.mapContainer2) {
        console.error('❌ Map container references not found');
        // Fallback to single map
        this.createSingleMap();
        return;
      }

      // Create primary map (center)
      this.maps = [];
      
      const mapOptions = {
        dragging: true, // Enable Leaflet's native dragging
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        zoomControl: true,
        attributionControl: true,
        zoomAnimation: true, // Enable animations for better UX
        fadeAnimation: true,
        markerZoomAnimation: true,
        boxZoom: true,
        keyboard: true,
        tap: true,
        trackResize: true,
        closePopupOnClick: true,
        bounceAtZoomLimits: true,
        worldCopyJump: true, // Enable world copy jump for seamless panning
        maxBoundsViscosity: 0.0,
        crs: L.CRS.EPSG3857,
        maxBounds: [[-90, -180], [90, 180]],
        noWrap: false // Allow wrapping for dual map effect
      };

      try {
        // Create center map
        const centerMap = L.map(this.$refs.mapContainer1, mapOptions).setView(
          [this.content.latitude || 50, this.content.longitude || 10],
          this.content.zoom || 3
        );
        this.maps.push(centerMap);

        // Create left and right duplicate maps
        const leftMap = L.map(this.$refs.mapContainer2, mapOptions).setView(
          [this.content.latitude || 50, this.content.longitude || 10 - 360], // Shifted left by 360 degrees
          this.content.zoom || 3
        );
        this.maps.push(leftMap);

        // Set up tile layers for all maps
        this.maps.forEach((map, index) => {
          this.setupTileLayerForMap(map, index);
        });

        // Set the primary map (center one)
        this.map = this.maps[0];
        
        console.log(`☢️ Created ${this.maps.length} maps for seamless panning`);
        
        // Set up synchronization between maps
        this.setupMapSynchronization();
        
        // Let Leaflet handle dragging naturally - no manual override needed
        console.log('☢️ Dual maps created - Leaflet will handle dragging naturally');
        
      } catch (error) {
        console.error('❌ Error creating dual maps:', error);
        // Fallback to single map
        this.createSingleMap();
      }
    },

    createSingleMap() {
      console.log('☢️ Creating single map with seamless panning');
      
      // Ensure DOM element exists and is properly sized
      if (!this.$refs.mapContainer) {
        throw new Error('Map container not found in DOM');
      }
      
      // Check if container already has a Leaflet map
      const container = this.$refs.mapContainer;
      if (container._leaflet_id) {
        console.warn('⚠️ Map container already has Leaflet instance, cleaning up first');
        try {
          // Try to get the existing map and remove it properly
          const existingMap = container._leaflet_map || window[container._leaflet_id];
          if (existingMap && existingMap.remove) {
            existingMap.remove();
            console.log('☢️ Removed existing Leaflet map');
          }
        } catch (e) {
          console.warn('⚠️ Could not remove existing Leaflet map:', e);
        }
        
        // Clear the container completely
        container.innerHTML = '';
        delete container._leaflet_id;
        delete container._leaflet_map;
      }
      
      // Ensure container has dimensions
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('⚠️ Map container has zero dimensions, waiting...');
        setTimeout(() => this.createSingleMap(), 100);
        return;
      }
      
      // Create single map with world copy jump enabled
      const mapOptions = {
        dragging: true, // Enable Leaflet's native dragging
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        zoomControl: true,
        attributionControl: true,
        zoomAnimation: true, // Enable animations for better UX
        fadeAnimation: true,
        markerZoomAnimation: true,
        boxZoom: true,
        keyboard: true,
        tap: true,
        trackResize: true,
        closePopupOnClick: true,
        bounceAtZoomLimits: true,
        worldCopyJump: true, // Enable world copy jump for seamless panning
        maxBoundsViscosity: 0.0,
        crs: L.CRS.EPSG3857,
        maxBounds: [[-90, -180], [90, 180]],
        noWrap: false // Allow wrapping for seamless experience
      };

      try {
        // Force container to have proper dimensions
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';
        
        // Create a fresh container element to avoid Leaflet conflicts
        const freshContainer = container.cloneNode(true);
        container.parentNode.replaceChild(freshContainer, container);
        
        this.map = L.map(freshContainer, mapOptions).setView(
          [this.content.latitude || 50, this.content.longitude || 10],
          this.content.zoom || 3
        );
        
        // Set up tile layer
        this.setupTileLayer();
        
        console.log('☢️ Map created successfully with dimensions:', {
          width: freshContainer.offsetWidth,
          height: freshContainer.offsetHeight
        });
        
        // Ensure dragging is properly enabled
        if (this.map.dragging) {
          this.map.dragging.enable();
          console.log('☢️ Map dragging enabled');
        }
        
        // Let Leaflet handle dragging naturally - no manual override needed
        console.log('☢️ Map created - Leaflet will handle dragging naturally');
        
      } catch (error) {
        console.error('❌ Error creating single map:', error);
        throw error;
      }
    },

    setupTileLayerForMap(map, index) {
      const tileUrls = {
        osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      };

      const attributions = {
        osm: '© OpenStreetMap contributors',
        satellite: '© Esri, © OpenStreetMap contributors',
        terrain: '© OpenTopoMap, © OpenStreetMap contributors',
        dark: '© CARTO, © OpenStreetMap contributors',
        light: '© CARTO, © OpenStreetMap contributors'
      };

      const currentUrl = tileUrls[this.currentMapType] || tileUrls.osm;
      const currentAttribution = attributions[this.currentMapType] || attributions.osm;

      const tileLayer = L.tileLayer(currentUrl, {
        attribution: currentAttribution,
        maxZoom: 19,
        noWrap: false, // Allow wrapping for seamless experience
        bounds: [[-90, -180], [90, 180]]
      }).addTo(map);

      console.log(`☢️ Tile layer set for map ${index}: ${this.currentMapType}`);
      
      return tileLayer;
    },

    setupMapSynchronization() {
      // Synchronize view and interactions between maps
      if (!this.maps || this.maps.length < 2) return;
      
      this.maps.forEach((map, index) => {
        if (index === 0) return; // Skip primary map
        
        // Sync zoom changes with error handling
        map.on('zoomend', () => {
          try {
            const zoom = map.getZoom();
            this.maps.forEach((otherMap, otherIndex) => {
              if (otherIndex !== index && otherMap.getZoom() !== zoom) {
                otherMap.setZoom(zoom, { animate: false });
              }
            });
          } catch (error) {
            console.warn('Error synchronizing zoom:', error);
          }
        });
        
        // Sync move events with error handling
        map.on('moveend', () => {
          try {
            const center = map.getCenter();
            this.maps.forEach((otherMap, otherIndex) => {
              if (otherIndex !== index) {
                const offset = (otherIndex - index) * 360; // Calculate longitude offset
                otherMap.setView([center.lat, center.lng + offset], center.zoom, { animate: false });
              }
            });
          } catch (error) {
            console.warn('Error synchronizing map position:', error);
          }
        });
      });
    },

    setupTileLayer() {
      // Check if map exists before trying to add tile layer
      if (!this.map) {
        console.error('❌ Cannot setup tile layer - map is null');
        return;
      }

      // Remove existing tile layer if any
      if (this.tileLayer) {
        try {
          this.map.removeLayer(this.tileLayer);
        } catch (error) {
          console.warn('⚠️ Could not remove existing tile layer:', error);
        }
      }

      const tileUrls = {
        osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      };

      const attributions = {
        osm: '© OpenStreetMap contributors',
        satellite: '© Esri, © OpenStreetMap contributors',
        terrain: '© OpenTopoMap, © OpenStreetMap contributors',
        dark: '© CARTO, © OpenStreetMap contributors',
        light: '© CARTO, © OpenStreetMap contributors'
      };

      const currentUrl = tileUrls[this.currentMapType] || tileUrls.osm;
      const currentAttribution = attributions[this.currentMapType] || attributions.osm;

      try {
        this.tileLayer = L.tileLayer(currentUrl, {
          attribution: currentAttribution,
          maxZoom: 19,
          noWrap: true, // Prevent tile wrapping
          bounds: [[-90, -180], [90, 180]] // Limit tiles to single world
        }).addTo(this.map);

        console.log(`☢️ Tile layer set to: ${this.currentMapType}`);
      } catch (error) {
        console.error('❌ Error setting up tile layer:', error);
        throw error;
      }
    },

    changeMapType() {
      console.log(`☢️ Changing map type to: ${this.currentMapType}`);
      this.setupTileLayer();
    },
    
    
    // Add back collection markers functionality
    updateCollectionMarkers() {
      console.log('☢️ Starting updateCollectionMarkers...');
      console.log('Dummy markers count:', this.dummyMarkers.length);
      console.log('Map exists:', !!this.map);
      console.log('Is destroyed:', this.isDestroyed);
      console.log('Clustering enabled:', this.enableClustering);
      
      this.clearCollectionMarkers();

      // Always show dummy markers for testing
      let items = this.dummyMarkers;
      console.log('☢️ Items to display:', items.length);

      if (!Array.isArray(items) || this.isDestroyed) {
        console.log('☢️ Skipping markers - no items array or destroyed');
        return;
      }

      try {
        if (this.enableClustering) {
          this.createClusteredMarkers(items);
        } else {
          this.createIndividualMarkers(items);
        }
      } catch (error) {
        console.warn('❌ Error creating collection markers:', error);
        console.error('☢️ Full error details:', error);
      }
    },

    createIndividualMarkers(items) {
      console.log('☢️ Creating individual markers for', items.length, 'items');
      items.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
          console.log('☢️ Skipping invalid item at index', index);
          return;
        }

        const lat = item.latitude || item.lat || item.y || item.latitud;
        const lng = item.longitude || item.lng || item.x || item.longitud;

        console.log(`☢️ Processing item ${index + 1}: lat=${lat}, lng=${lng}`);

        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          console.log(`☢️ Creating marker ${index + 1} at [${lat}, ${lng}]`);
          
          const marker = L.circleMarker([lat, lng], {
            color: '#666666',
            fillColor: '#999999',
            fillOpacity: 0.7,
            radius: 8,
            weight: 2
          });

          // Add marker to map
          try {
            marker.addTo(this.map);
            console.log(`✅ Added marker ${index + 1} to map`);
          } catch (error) {
            console.error(`❌ Failed to add marker ${index + 1} to map:`, error);
            return;
          }

          const popupContent = this.generatePopupContent(item, index + 1);
          const popup = this.createCustomPopup(popupContent);
          try {
            marker.bindPopup(popup);
            console.log(`✅ Bound popup to marker ${index + 1}`);
          } catch (error) {
            console.warn('Error binding popup to individual marker:', error);
            // Fallback to simple text popup
            marker.bindPopup(item.name || item.title || item.label || `Location ${index + 1}`);
          }

          this.collectionMarkers.push(marker);
          console.log(`✅ Added individual marker ${index + 1} at [${lat}, ${lng}]`);
        } else {
          console.log(`⚠️ Skipping item ${index + 1} - invalid coordinates: lat=${lat}, lng=${lng}`);
        }
      });

      this.visibleMarkers = this.collectionMarkers.length;
      console.log(`✅ Total individual markers added: ${this.collectionMarkers.length}`);
    },

    createClusteredMarkers(items) {
      // Simple distance-based clustering
      const clusters = [];
      const processed = new Set();
      
      items.forEach((item, index) => {
        if (processed.has(index)) return;
        
        const lat = item.latitude || item.lat || item.y || item.latitud;
        const lng = item.longitude || item.lng || item.x || item.longitud;
        
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

        // Find nearby markers within cluster radius
        const cluster = {
          center: [lat, lng],
          items: [item],
          indices: [index],
          bounds: this.getClusterBounds(lat, lng)
        };

        // Check for nearby markers
        items.forEach((otherItem, otherIndex) => {
          if (index === otherIndex || processed.has(otherIndex)) return;
          
          const otherLat = otherItem.latitude || otherItem.lat || otherItem.y || otherItem.latitud;
          const otherLng = otherItem.longitude || otherItem.lng || otherItem.x || otherItem.longitud;
          
          if (!otherLat || !otherLng || isNaN(otherLat) || isNaN(otherLng)) return;

          const distance = this.getDistanceInKm(lat, lng, otherLat, otherLng);
          
          if (distance <= this.clusterRadius) {
            cluster.items.push(otherItem);
            cluster.indices.push(otherIndex);
            processed.add(otherIndex);
          }
        });

        clusters.push(cluster);
        processed.add(index);
      });

      // Create cluster markers
      clusters.forEach((cluster, clusterIndex) => {
        if (cluster.items.length === 1) {
          // Single marker - show as individual
          const item = cluster.items[0];
          const marker = L.circleMarker(cluster.center, {
            color: '#666666',
            fillColor: '#999999',
            fillOpacity: 0.7,
            radius: 8,
            weight: 2
          }).addTo(this.map);

          const popupContent = this.generatePopupContent(item, cluster.indices[0] + 1);
          const popup = this.createCustomPopup(popupContent);
          try {
            marker.bindPopup(popup);
          } catch (error) {
            console.warn('Error binding popup to marker:', error);
            // Fallback to simple text popup
            marker.bindPopup(item.name || item.title || item.label || `Location ${cluster.indices[0] + 1}`);
          }
          this.collectionMarkers.push(marker);
        } else {
          // Cluster - show as grouped marker with number inside
          const clusterCount = cluster.items.length;
          
          // Create custom icon with number
          const icon = L.divIcon({
            className: 'cluster-icon',
            html: `<div style="background: #ff6b6b; color: white; border-radius: 50%; width: ${20 + clusterCount * 2}px; height: ${20 + clusterCount * 2}px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: ${Math.max(10, 12 - clusterCount * 0.5)}px; border: 2px solid #ff8787;">${clusterCount}</div>`,
            iconSize: [20 + clusterCount * 2, 20 + clusterCount * 2],
            iconAnchor: [10 + clusterCount, 10 + clusterCount]
          });

          const markerWithNumber = L.marker(cluster.center, {
            icon: icon
          }).addTo(this.map);

          const popupContent = this.generateClusterPopupContent(clusterCount);
          const popup = this.createCustomPopup(popupContent);
          try {
            markerWithNumber.bindPopup(popup);
          } catch (error) {
            console.warn('Error binding popup to cluster marker:', error);
            // Fallback to simple text popup
            markerWithNumber.bindPopup(`📍 Cluster: ${clusterCount} markers`);
          }
          
          // Add click handler to zoom in
          markerWithNumber.on('click', () => {
            this.map.fitBounds(cluster.bounds);
          });

          this.collectionMarkers.push(markerWithNumber);
          this.clusterGroups.push({
            center: cluster.center,
            count: clusterCount,
            bounds: cluster.bounds,
            marker: markerWithNumber
          });
        }
      });

      this.visibleMarkers = this.collectionMarkers.length;
      console.log(`✅ Total clustered markers added: ${this.collectionMarkers.length} (${clusters.length} clusters)`);
    },

    getDistanceInKm(lat1, lng1, lat2, lng2) {
      // Haversine formula to calculate distance between two points in kilometers
      const R = 6371; // Radius of Earth in kilometers
      const dLat = this.toRad(lat2 - lat1);
      const dLng = this.toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },

    toRad(value) {
      return value * Math.PI / 180;
    },

    getClusterBounds(centerLat, centerLng) {
      // Create a small bounds around the cluster center
      const offset = 0.05; // Approximately 5km
      return [
        [centerLat - offset, centerLng - offset],
        [centerLat + offset, centerLng + offset]
      ];
    },

    toggleClustering() {
      console.log(`Clustering ${this.enableClustering ? 'enabled' : 'disabled'}`);
      this.clusterGroups = [];
      this.updateCollectionMarkers();
    },

    updateClustering() {
      if (this.enableClustering) {
        console.log(`Cluster radius updated: ${this.clusterRadius}km`);
        this.clusterGroups = [];
        this.updateCollectionMarkers();
      }
    },

    // Popup customization methods
    generatePopupContent(item, markerNumber) {
      let content = '';
      
      switch (this.popupContentTemplate) {
        case 'detailed':
          content = `
            <div style="min-width: ${this.popupWidth}px; max-width: ${this.popupWidth}px;">
              <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${item.name || item.title || item.label || `Location ${markerNumber}`}</h3>
              ${this.showCoordinatesInPopup ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">Lat: ${item.latitude?.toFixed(4) || item.lat?.toFixed(4) || 'N/A'}</p>` : ''}
              ${this.showCoordinatesInPopup ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">Lng: ${item.longitude?.toFixed(4) || item.lng?.toFixed(4) || 'N/A'}</p>` : ''}
              ${this.showMarkerNumber ? `<p style="margin: 4px 0; font-size: 11px; color: #999;">Marker #${markerNumber}</p>` : ''}
              <div style="border-top: 1px solid #eee; margin-top: 8px; padding-top: 8px;">
                <small style="color: #888;">Click to close</small>
              </div>
            </div>
          `;
          break;
        case 'minimal':
          content = `
            <div style="min-width: 150px;">
              <p style="margin: 0; font-size: 13px; color: #333;">${item.name || item.title || item.label || `Location ${markerNumber}`}</p>
            </div>
          `;
          break;
        default: // 'default'
          content = `
            <div style="min-width: ${this.popupWidth}px;">
              <h4 style="margin: 0 0 6px 0; color: #333; font-size: 13px;">${item.name || item.title || item.label || `Location ${markerNumber}`}</h4>
              ${this.showCoordinatesInPopup ? `<p style="margin: 3px 0; font-size: 11px; color: #666;">📍 ${item.latitude?.toFixed(3) || item.lat?.toFixed(3) || 'N/A'}, ${item.longitude?.toFixed(3) || item.lng?.toFixed(3) || 'N/A'}</p>` : ''}
            </div>
          `;
      }
      
      return content;
    },

    generateClusterPopupContent(clusterCount) {
      return `
        <div style="min-width: ${this.popupWidth}px; text-align: center;">
          <h3 style="margin: 0 0 8px 0; color: #ff6b6b; font-size: 16px;">📍 Cluster</h3>
          <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>${clusterCount}</strong> markers</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">Click to zoom in</p>
          <div style="border-top: 1px solid #eee; margin-top: 8px; padding-top: 8px;">
            <small style="color: #888;">Cluster radius: ${this.clusterRadius}km</small>
          </div>
        </div>
      `;
    },

    createCustomPopup(content) {
      try {
        // Create popup with custom dimensions - disable autoPan to prevent animation errors
        return L.popup({
          maxWidth: this.popupWidth,
          maxHeight: this.popupHeight,
          className: 'custom-marker-popup',
          closeButton: true,
          autoPan: false, // Disable auto-pan to prevent _panAnim errors
          keepInView: false, // Disable to prevent animation conflicts
          offset: [0, -10] // Offset to position popup above marker
        }).setContent(content);
      } catch (error) {
        console.warn('Error creating custom popup, falling back to default:', error);
        // Fallback to basic popup if custom creation fails
        return L.popup().setContent(content);
      }
    },

    // Generate 100 dummy markers across Europe (focused on landmass)
    generateDummyMarkers() {
      console.log('☢️ Generating 100 dummy markers...');
      this.dummyMarkers = Array.from({ length: 100 }, (_, i) => ({
        // Focus on European landmass: 36°N to 71°N, but weighted toward populated areas
        latitude: 40 + Math.random() * 20, // 40°N to 60°N (core Europe)
        // Focus on European longitude: -10°W to 30°E (Atlantic to Eastern Europe)
        longitude: -10 + Math.random() * 40, // -10°E to 30°E
        name: `Pin ${i + 1}`
      }));
      
      // Add some specific major European cities for better distribution
      const majorCities = [
        { latitude: 48.8566, longitude: 2.3522, name: "Paris" },
        { latitude: 51.5074, longitude: -0.1278, name: "London" },
        { latitude: 52.5200, longitude: 13.4050, name: "Berlin" },
        { latitude: 41.9028, longitude: 12.4964, name: "Rome" },
        { latitude: 40.4168, longitude: -3.7038, name: "Madrid" },
        { latitude: 59.3293, longitude: 18.0686, name: "Stockholm" },
        { latitude: 60.1699, longitude: 24.9384, name: "Helsinki" },
        { latitude: 55.7558, longitude: 37.6173, name: "Moscow" },
        { latitude: 50.0755, longitude: 14.4378, name: "Prague" },
        { latitude: 48.1486, longitude: 17.1077, name: "Bratislava" }
      ];
      
      // Replace first 10 markers with major cities
      majorCities.forEach((city, index) => {
        if (index < this.dummyMarkers.length) {
          this.dummyMarkers[index] = city;
        }
      });
      
      console.log('☢️ Generated 100 dummy markers (focused on European landmass):', this.dummyMarkers.slice(0, 5));
      console.log('☢️ Total dummy markers generated:', this.dummyMarkers.length);
      console.log('☢️ Dummy markers ready for display');
    },

    clearCollectionMarkers() {
      this.collectionMarkers.forEach(marker => {
        if (this.map && marker) {
          try {
            this.map.removeLayer(marker);
          } catch (e) {
            // Ignore removal errors
          }
        }
      });
      this.collectionMarkers = [];
    },
    
    // Add back user position functionality
    getCurrentPosition() {
      if (!this.map || this.isDestroyed) return;
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (this.isDestroyed) return;
            
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if (this.map && !this.isDestroyed) {
              try {
                // this.map.setView([lat, lng], 15); // Commented out to keep zoom for markers

                if (this.currentPositionMarker) {
                  this.map.removeLayer(this.currentPositionMarker);
                }
                
                // Add user status color coding
                const isOnline = this.content.userStatus === 'online';
                const markerColor = isOnline ? (this.content.markerColor || '#00ff00') : (this.content.markerColor || '#ff0000');
                const markerFillColor = isOnline ? (this.content.markerFillColor || '#00ff00') : (this.content.markerFillColor || '#ff0000');
                
                // CORE FIX: Use L.circle for real-world accuracy radius
                this.accuracyCircle = L.circle([lat, lng], {
                    radius: this.accuracyRadius * 1000, // User-defined accuracy in meters
                    weight: 2,
                    color: '#1d9bf0',
                    fillColor: '#1d9bf0',
                    fillOpacity: 0.1,
                }).addTo(this.map);

                // Add a small marker for the center point
                this.currentPositionMarker = L.circleMarker([lat, lng], {
                  color: markerColor,
                  fillColor: markerFillColor,
                  fillOpacity: 1,
                  radius: 8, // Small fixed radius for the center point
                  weight: 2,
                  stroke: true,
                }).addTo(this.map).bindPopup('You are here!');
                
                // Enhanced geolocation data storage
                this.userPosition = {
                  latitude: lat,
                  longitude: lng,
                  accuracy: position.coords.accuracy || null // GPS accuracy in meters
                };
                
                console.log('☢️ Enhanced geolocation:', this.userPosition);
                
              } catch (error) {
                console.warn('Error updating map with current position:', error);
              }
            }
          },
          (error) => {
            console.warn('Geolocation error:', error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          }
        );
      } else {
        console.warn('Geolocation is not supported by this browser');
      }
    },
    
    // Enhanced geolocation formatting methods
    formatAccuracy(accuracy) {
      if (accuracy === null || accuracy === undefined) return 'Unknown';
      return `${Math.round(accuracy)} m`;
    },
    
    formatDistance(distance) {
      const unit = this.useMiles ? 'miles' : 'km';
      return `${distance.toFixed(1)} ${unit}`;
    },
    
    updateAccuracyFromSlider() {
      this.accuracyRadius = this.accuracySlider;
      this.updateUserMarkerSize();
      console.log(`☢️ Accuracy updated from slider: ${this.accuracyRadius}${this.unit}`);
    },
    
    updateAccuracyFromInput() {
      this.accuracySlider = Math.max(1, Math.min(this.maxSliderRange, this.accuracySlider));
      this.accuracyRadius = this.accuracySlider;
      this.updateUserMarkerSize();
      console.log(`☢️ Accuracy updated from input: ${this.accuracyRadius}${this.unit}`);
    },
    
    toggleUnits() {
        if (this.useMiles) {
            // from km to miles
            this.accuracySlider = parseFloat((this.accuracySlider * 0.621371).toFixed(1));
        } else {
            // from miles to km
            this.accuracySlider = parseFloat((this.accuracySlider / 0.621371).toFixed(1));
        }
        this.accuracySlider = Math.max(1, Math.min(this.maxSliderRange, this.accuracySlider));
        this.accuracyRadius = this.accuracySlider;
        this.updateUserMarkerSize();
        console.log(`☢️ Unit changed to: ${this.useMiles ? 'miles' : 'kilometers'}`);
    },
    
    updateUserMarkerSize() {
      if (!this.accuracyCircle || !this.map) return;
      
      let radiusInMeters = this.accuracyRadius * 1000; // Default to km
      if (this.useMiles) {
        radiusInMeters = this.accuracyRadius * 1609.34; // Convert miles to meters
      }
      
      this.accuracyCircle.setRadius(radiusInMeters);
      console.log(`☢️ User accuracy circle radius updated: ${this.accuracyRadius} ${this.useMiles ? 'miles' : 'km'} (${radiusInMeters}m)`);
    },
    
    cleanup() {
      this.isDestroyed = true;
      
      if (this.initTimeout) {
        clearTimeout(this.initTimeout);
        this.initTimeout = null;
      }
      
      if (this.zoomHandler && this.map) {
        this.map.off('zoomend', this.zoomHandler);
        this.zoomHandler = null;
      }
      
      this.clearCollectionMarkers();
      
      if (this.currentPositionMarker && this.map) {
        this.map.removeLayer(this.currentPositionMarker);
        this.currentPositionMarker = null;
      }
      if (this.accuracyCircle && this.map) {
          this.map.removeLayer(this.accuracyCircle);
          this.accuracyCircle = null;
      }
      
      if (this.map) {
        try {
          this.map.remove();
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        } finally {
          this.map = null;
        }
      }
      
      if (this.$refs.mapContainer) {
        this.$refs.mapContainer.innerHTML = '';
      }
    },
    
    // Add zoom tracking functionality
    setupZoomTracking() {
      if (!this.map) return;
      
      this.currentZoom = this.map.getZoom();
      
      if (this.zoomHandler) {
        this.map.off('zoomend', this.zoomHandler);
      }
      
      this.zoomHandler = () => {
        if (!this.isDestroyed) {
          this.currentZoom = this.map.getZoom();
          console.log(`☢️ ZOOM CHANGED: ${this.currentZoom}`);
        }
      };
      
      this.map.on('zoomend', this.zoomHandler);
    },
  },
  watch: {
    'content.latitude'() {
      this.updateMap();
    },
    'content.longitude'() {
      this.updateMap();
    },
    'content.zoom'() {
      this.updateMap();
      this.currentZoom = this.content.zoom || 13;
    },
    'content.minZoom'() {
      if (this.map && !this.isDestroyed) {
        this.map.setMinZoom(this.content.minZoom || 1);
      }
    },
    'content.maxZoom'() {
      if (this.map && !this.isDestroyed) {
        this.map.setMaxZoom(this.content.maxZoom || 20);
      }
    },
    'content.showCollectionMarkers'() {
      this.$nextTick(() => {
        this.updateCollectionMarkers();
      });
    },
    'content.collectionData'() {
      this.$nextTick(() => {
        this.updateCollectionMarkers();
      });
    },
    'content.showDebug'() {
      this.showDebug = this.content.showDebug || false;
    },
    'content.accuracyRadius'() {
      this.accuracyRadius = this.content.accuracyRadius || 1;
      this.accuracySlider = this.accuracyRadius;
      if (this.currentPositionMarker && this.map) {
        this.updateUserMarkerSize();
      }
    },
    'content.useMiles'() {
      this.useMiles = this.content.useMiles !== undefined ? this.content.useMiles : false;
      console.log(`☢️ Unit system changed to: ${this.useMiles ? 'miles' : 'kilometers'}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.openstreetmap-element {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden; // Prevent any overflow issues
}

// Ensure the map container has proper styling for Leaflet
.leaflet-map-container {
  width: 100%;
  height: 100%;
  position: relative;
  outline: none; // Remove focus outline that might interfere
  -webkit-user-select: none; // Prevent text selection interference
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: grab; // Show grab cursor for dragging
}

.leaflet-map-container:active {
  cursor: grabbing; // Show grabbing cursor during drag
}

// Ensure Leaflet controls work properly
.leaflet-container {
  cursor: grab;
}

.leaflet-dragging .leaflet-container {
  cursor: grabbing;
}

// Fix for WeWeb event interference
.leaflet-map-container * {
  pointer-events: auto !important; // Ensure all Leaflet elements can receive events
}

// Prevent WeWeb from interfering with map interactions
.leaflet-map-container {
  touch-action: none; // Prevent touch scrolling interference
}

// Map type selector (moved under clustering controls)
.map-type-selector {
  position: absolute;
  top: 180px; // Positioned under clustering controls
  left: 10px; // Aligned with clustering controls
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 15px; // Same padding as clustering controls
  border-radius: 8px;
  font-size: 12px;
  z-index: 1002;
  backdrop-filter: blur(10px);
  min-width: 200px; // Same width as clustering controls
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  .map-type-header {
    margin-bottom: 8px; // Same as clustering header spacing
    
    .map-type-label {
      display: block;
      margin: 0; // Remove all margins to match clustering label
      padding: 0; // Remove all padding to match clustering label
      font-weight: 600;
      color: #ccc;
      font-size: 12px; // Same size as clustering labels
      text-align: left; // Ensure left alignment
      line-height: 1.2; // Match clustering label line height
    }
  }
  
  select {
    width: 100%;
    padding: 8px 10px; // Slightly more padding for better alignment
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #ccc;
      box-shadow: 0 0 0 2px rgba(204, 204, 204, 0.2);
    }
    
    option {
      background: #333;
      color: #fff;
    }
  }
}

// Clustering controls
.clustering-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 1001;
  backdrop-filter: blur(10px);
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.clustering-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .clustering-label {
    font-weight: 600;
    color: #fff;
    font-size: 12px;
    margin: 0; // Remove default label margins
    padding: 0; // Remove default label padding
  }
  
  .clustering-toggle {
    display: flex;
    align-items: center;
    cursor: pointer;
    
    input[type="checkbox"] {
      margin-right: 6px;
    }
    
    span {
      color: #ccc;
      font-weight: 500;
    }
  }
}

.clustering-options {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 12px;
}

.clustering-slider {
  margin-bottom: 12px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #ccc;
    font-size: 12px;
  }
  
  input[type="range"] {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #ccc;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #ccc;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
}

.clustering-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #ccc;
  margin-bottom: 15px; // Add spacing before map type selector
  
  span {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
  }
}

// Unified geolocation panel
.geolocation-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  font-size: 11px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.geo-coordinates {
  margin-bottom: 15px;

  .geo-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;

    .geo-label {
      font-weight: 600;
      color: #ccc;
      min-width: 70px;
    }

    .geo-value {
      color: #fff;
      font-weight: 500;
    }
  }
}

.accuracy-controls {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 12px;
  
  .accuracy-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .accuracy-label {
      font-weight: 600;
      color: #ccc;
    }
    
    .accuracy-value {
      color: #eee;
      font-weight: 500;
    }
  }
}

.slider-container {
  margin-bottom: 10px;
  
  .accuracy-slider {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #ccc;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #ccc;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
  
  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 10px;
    color: #ccc;
  }
}

.accuracy-input {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  
  .accuracy-number {
    width: 60px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    text-align: center;
    
    &:focus {
      outline: none;
      border-color: #ccc;
      box-shadow: 0 0 0 2px rgba(204, 204, 204, 0.2);
    }
  }
  
  .unit-label {
    margin-left: 6px;
    color: #ccc;
    font-size: 11px;
  }
}

.unit-toggle {
  .unit-checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 11px;
    
    input[type="checkbox"] {
      margin-right: 6px;
    }
    
    span {
      color: #ccc;
    }
  }
}


// Collection markers toggle
.collection-toggle {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  z-index: 1000;
  pointer-events: none;
  backdrop-filter: blur(2px);
}

// NUCLEAR CSS: Ensure the container is properly configured
.debug-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 0, 0, 0.9);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10000;
  max-width: 300px;
  
  .debug-info {
    p {
      margin: 2px 0;
      font-family: monospace;
    }
  }
}

// Custom popup styling
.custom-marker-popup {
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .leaflet-popup-content {
    margin: 12px;
    line-height: 1.4;
  }
  
  .leaflet-popup-tip {
    background: #fff;
  }
}

// Popup content specific styling
.popup-detailed {
  h3 {
    color: #333;
    font-size: 14px;
    margin: 0 0 8px 0;
  }
  
  p {
    margin: 4px 0;
    font-size: 12px;
    color: #666;
  }
  
  .popup-footer {
    border-top: 1px solid #eee;
    margin-top: 8px;
    padding-top: 8px;
    
    small {
      color: #888;
    }
  }
}

.popup-minimal {
  p {
    margin: 0;
    font-size: 13px;
    color: #333;
  }
}

.popup-cluster {
  text-align: center;
  
  h3 {
    color: #ff6b6b;
    font-size: 16px;
    margin: 0 0 8px 0;
  }
  
  p {
    margin: 4px 0;
    font-size: 14px;
    color: #333;
  }
  
  .cluster-footer {
    border-top: 1px solid #eee;
    margin-top: 8px;
    padding-top: 8px;
    
    small {
      color: #888;
      font-size: 11px;
    }
  }
}
</style>
