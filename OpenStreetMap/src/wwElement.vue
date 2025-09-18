<template>
  <div class="openstreetmap-element" role="application" aria-label="Interactive OpenStreetMap">
    <div 
      ref="mapContainer" 
      class="leaflet-map-container"
      tabindex="0"
      role="img"
      :aria-label="`Interactive map centered at ${content.latitude || 50}, ${content.longitude || 10} with ${markerCount} markers`"
      :style="mapStyle"
    ></div>
    
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
        <p><strong>Version: 0.0.2</strong> (Enhanced User Support)</p>
        <p>Zoom: {{ currentZoom }}</p>
        <p>Collection Markers: {{ collectionMarkers.length }}</p>
        <p>Dummy Markers: {{ dummyMarkers.length }}</p>
        <p>User Status: {{ userStatus }}</p>
        <p>Accuracy: {{ formatAccuracy(userPosition.accuracy) }}</p>
        <p>Radius: {{ formatDistance(accuracyRadius) }}</p>
        <p>Data Source: {{ userDataSource }}</p>
        <p>Name Field: {{ userNameField }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

export default {
  name: 'OpenStreetMap',
  props: {
    content: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value === 'object';
      }
    },
  },
  emits: ['update:content'],
  data() {
    return {
      isDestroyed: false,
      individualMarkersGroup: null,
      markerClusterGroup: null,
      // Core map data
      collectionMarkers: [],
      currentPositionMarker: null,
      accuracyCircle: null,
      zoomHandler: null,
      currentZoom: null,
      // User position data
      userPosition: {
        latitude: null,
        longitude: null,
        accuracy: null
      },
      // User data configuration
      userDataSource: 'collection',
      userNameField: 'name',
      userEmailField: 'email',
      userStatusField: 'status',
      userRoleField: 'role',
      showUserEmail: true,
      showUserStatus: true,
      showUserRole: false,
      // Enhanced geolocation features
      accuracyRadius: 1,
      useMiles: false,
      accuracySlider: 1,
      // Clustering properties
      enableClustering: false,
      clusterRadius: 10,
      clusterGroups: [],
      visibleMarkers: 0,
      // Map type properties
      currentMapType: 'osm',
      tileLayer: null,
      // Popup customization properties
      popupWidth: 250,
      popupHeight: 120,
      popupContentTemplate: 'default',
      showCoordinatesInPopup: true,
      showMarkerNumber: true,
      // Internal state
      resizeObserver: null,
      dummyMarkers: [],
      showDebug: false,
      initTimeout: null,
    };
  },
  created() {
    // Store non-reactive Leaflet instances here
    this.map = null;
    this.individualMarkersGroup = null;
    this.markerClusterGroup = null;
    this.tileLayer = null;
  },
  computed: {
    mapCenter() {
      return this.map ? this.map.getCenter() : { lat: this.content.latitude || 50, lng: this.content.longitude || 10 };
    },
    mapZoom() {
      return this.map ? this.map.getZoom() : (this.content.zoom || 13);
    },
    mapBounds() {
      return this.map ? this.map.getBounds() : null;
    },
    userLatitude() {
      return this.userPosition.latitude;
    },
    userLongitude() {
      return this.userPosition.longitude;
    },
    userAccuracy() {
      return this.userPosition.accuracy;
    },
    markerCount() {
      return this.collectionMarkers.length;
    },
    visibleMarkerCount() {
      return this.collectionMarkers.length;
    },
    // Map state properties
    isMapReady() {
      return !!this.map && !this.isDestroyed;
    },
    currentTileUrl() {
      const tileUrls = {
        osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      };
      return tileUrls[this.content.mapType || 'osm'];
    },
    unit() {
      return this.useMiles ? 'miles' : 'km';
    },
    maxSliderRange() {
      return this.useMiles ? 50 : 50;
    },
    mapStyle() {
      return {
        height: '100%',
        width: '100%',
      };
    },
  },
  mounted() {
    // Initialize user data configuration
    this.initializeUserConfig();
    
    // Simple initialization for WeWeb
    this.$nextTick(this.observeContainer);
    
    // DEBUG: Expose component globally for console debugging
    if (typeof window !== 'undefined') {
      window.mapComponent = this;
      console.log('🗺️ Map component exposed as window.mapComponent');
      console.log('🔧 Try: window.mapComponent.forceEnableDragging()');
      console.log('🛡️ Try: window.mapComponent.handleWeWebInterference()');
      
      // Auto-detect WeWeb environment
      if (window.parent !== window) {
        console.log('🎯 WeWeb iframe detected - applying interference fixes...');
        setTimeout(() => {
          if (this.map) {
            this.handleWeWebInterference();
          }
        }, 500);
      }
    }
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    observeContainer() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }

      const container = this.$refs.mapContainer;
      if (!container) return;

      // Check for ResizeObserver support
      if (typeof ResizeObserver === 'undefined') {
        console.warn('ResizeObserver not supported, falling back to manual initialization');
        // Fallback for older browsers
        setTimeout(() => {
          if (container.offsetWidth > 0 && container.offsetHeight > 0) {
            this.initializeMap();
          }
        }, 100);
        return;
      }

      this.resizeObserver = new ResizeObserver((entries) => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          this.initializeMap();
          // Once initialized, we don't need to observe anymore.
          // This prevents re-initialization loops.
          this.resizeObserver.disconnect();
        }
      });
      this.resizeObserver.observe(container);
    },
    
    // Rename to avoid potential conflicts with WeWeb's processing
    initializeMap() {
      // AGGRESSIVE cleanup first
      if (this.map) {
        try {
          this.map.remove();
          this.map = null;
        } catch (e) {
          console.warn('Error removing existing map:', e);
        }
      }

      // Add a guard to prevent re-initialization if the map is already valid.
      if (this.map && this.map.getContainer()) {
        console.log('🗺️ Map already initialized. Skipping re-initialization.');
        return;
      }
      
      // Clear container completely
      const container = this.$refs.mapContainer;
      if (container) {
        container.innerHTML = '';
        // Remove any Leaflet-specific properties
        delete container._leaflet_id;
        delete container._leaflet;
      }
      
      this.currentZoom = this.content.zoom || 13;

      // Simple initialization - no complex nesting
      if (this.$refs.mapContainer) {
        // Create single map with world copy jump for seamless panning
        try {
          this.createSingleMap();
          
          // Only setup tile layer if map was created successfully
          if (this.map) {
            this.setupTileLayer();
          } else {
            console.error('❌ Map creation failed - map is null');
          }
        } catch (error) {
          console.error('❌ Error during map creation:', error);
        }
      } else {
        console.error('❌ Map container not found in DOM');
      }
    },

    createSingleMap() {
      // Ensure DOM element exists and is properly sized
      if (!this.$refs.mapContainer) {
        console.error('❌ Map container not found in DOM');
        return; // Don't throw error, just return
      }
      
      // Check if container already has a Leaflet map
      const container = this.$refs.mapContainer;
      
      // CRITICAL: Clear any existing map instance first
      if (container._leaflet_id && this.map) {
        this.map.remove();
        this.map = null;
      } else if (container._leaflet_id) {
        // If map instance is gone but leaflet id remains
        delete container._leaflet_id;
      }
      
      // Ensure container has dimensions
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('Map container has zero dimensions. Initialization might fail.');
        return;
      }
      
      // Force container styles immediately
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.position = 'relative';
      container.style.outline = 'none';
      container.style.pointerEvents = 'auto';
      container.style.touchAction = 'pan-x pan-y';
      
      // Define the boundaries to prevent panning into the grey area
      const corner1 = L.latLng(-85.0511, -180);
      const corner2 = L.latLng(85.0511, 180);
      const maxBounds = L.latLngBounds(corner1, corner2);

      // Simplified map options - remove potential conflicting settings
      const mapOptions = {
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: true,
        attributionControl: true,
        worldCopyJump: true, // Prevents multiple worlds from showing at once.
        maxBounds: maxBounds, // Prevent panning into the grey area.
        maxBoundsViscosity: 1.0 // Make the bounds solid.
      };

      try {
        // Create the map with simplified options
        this.map = L.map(container, mapOptions).setView(
          [this.content.latitude || 50, this.content.longitude || 10],
          this.content.zoom || 3
        );
        
        // FORCE enable drag after creation with delay
        setTimeout(() => {
          if (this.map && this.map.dragging) {
            this.map.dragging.enable();
            
            // Force re-enable all handlers with explicit zoom focus
            if (this.map.touchZoom) this.map.touchZoom.enable();
            if (this.map.doubleClickZoom) this.map.doubleClickZoom.enable();
            if (this.map.scrollWheelZoom) this.map.scrollWheelZoom.enable();
            if (this.map.boxZoom) this.map.boxZoom.enable();
            if (this.map.keyboard) this.map.keyboard.enable();
            
            // Explicitly ensure zoom controls work
            const zoomControl = this.map.zoomControl;
            if (zoomControl) {
              // Re-add zoom control to ensure it's working
              this.map.removeControl(zoomControl);
              this.map.addControl(zoomControl);
            }
            
            console.log('🗺️ All map handlers force-enabled with zoom priority');
            console.log('Drag enabled:', this.map.dragging.enabled());
            console.log('Scroll zoom enabled:', this.map.scrollWheelZoom.enabled());
            console.log('Double click zoom enabled:', this.map.doubleClickZoom.enabled());
          }
        }, 100);
        
        this.setupZoomTracking();
        this.updateCollectionMarkers();
        this.getCurrentPosition();
      } catch (error) {
        console.error('❌ Error creating single map:', error);
        return;
      }
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

      const attributions = {
        osm: '© OpenStreetMap contributors',
        satellite: '© Esri, © OpenStreetMap contributors',
        terrain: '© OpenTopoMap, © OpenStreetMap contributors',
        dark: '© CARTO, © OpenStreetMap contributors',
        light: '© CARTO, © OpenStreetMap contributors',
      };

      const currentAttribution = attributions[this.content.mapType || 'osm'] || attributions.osm;

      try {
        this.tileLayer = L.tileLayer(this.currentTileUrl, {
          attribution: currentAttribution,
          maxZoom: 19,
          noWrap: false // Allow wrapping for seamless experience
        }).addTo(this.map);
      } catch (error) {
        console.error('❌ Error setting up tile layer, falling back to OSM:', error);
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          noWrap: false
        }).addTo(this.map);
      }
    },

    changeMapType() {
      console.log(`☢️ Changing map type to: ${this.currentMapType}`);
      this.setupTileLayer();
    },
    
    // Add back collection markers functionality
    updateCollectionMarkers() {
      console.log('☢️ Starting updateCollectionMarkers...');
      console.log('Map exists:', !!this.map);
      console.log('Is destroyed:', this.isDestroyed);
      console.log('Clustering enabled:', this.enableClustering);
      
      // Guard against race conditions
      if (!this.map || this.isDestroyed) {
        console.warn('Cannot update markers: map not ready or component destroyed');
        return;
      }

      this.clearCollectionMarkers();

      // Use the real data from the collection provided via props.
      const items = this.content.collectionData || this.dummyMarkers;

      if (!Array.isArray(items) || this.isDestroyed) {
        console.log('☢️ Skipping markers - no items array or destroyed');
        return;
      }

      if (items.length > 500) {
        console.warn('Large dataset detected; consider enabling clustering or reducing markers');
      }

      try {
        if (this.enableClustering) {
          this.createClusteredMarkers(items);
        } else {
          this.createIndividualMarkers(items);
        }
      } catch (error) {
        console.error('❌ Error creating collection markers:', error);
      }
    },

    createIndividualMarkers(items) {
      this.individualMarkersGroup = L.featureGroup().addTo(this.map);

      items.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
          return;
        }

        const lat = item.latitude || item.lat || item.y || item.latitud;
        const lng = item.longitude || item.lng || item.x || item.longitud;

        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {

          const markerStyle = this.getUserMarkerStyle(item);
          const marker = L.circleMarker([lat, lng], markerStyle);

          this.individualMarkersGroup.addLayer(marker);
          const popupContent = this.generatePopupContent(item, index + 1);
          const popup = this.createCustomPopup(popupContent);
          try {
            marker.bindPopup(popup);
          } catch (error) {
            console.warn('Error binding popup to individual marker:', error);
            marker.bindPopup(popupContent);
          }

          this.collectionMarkers.push(marker);
        } else {
          console.warn(`Skipping item at index ${index} due to invalid coordinates.`);
        }
      });
    },

    createClusteredMarkers(items) {
      // Use the efficient leaflet.markercluster plugin
      this.markerClusterGroup = L.markerClusterGroup({
        // Options to improve UX
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });

      items.forEach((item, index) => {
        if (!item || typeof item !== 'object') return;

        const lat = item.latitude || item.lat || item.y || item.latitud;
        const lng = item.longitude || item.lng || item.x || item.longitud;

        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          const markerStyle = this.getUserMarkerStyle(item);
          const marker = L.circleMarker([lat, lng], markerStyle);

          const popupContent = this.generatePopupContent(item, index + 1);
          const popup = this.createCustomPopup(popupContent);
          try {
            marker.bindPopup(popup);
          } catch (error) {
            console.warn('Error binding popup to clustered marker:', error);
            marker.bindPopup(popupContent);
          }

          this.markerClusterGroup.addLayer(marker);
          this.collectionMarkers.push(marker);
        } else {
          console.warn(`Skipping item at index ${index} due to invalid coordinates.`);
        }
      });

      this.map.addLayer(this.markerClusterGroup);
    },

    // Popup customization methods
    generatePopupContent(item, markerNumber) {
      let content = '';
      
      // Enhanced sanitization to prevent XSS
      const sanitize = (str) => {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&')
          .replace(/</g, '<')
          .replace(/>/g, '>')
          .replace(/"/g, '"')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      };
      
      // Dynamic field mapping based on configuration
      const userName = this.getUserFieldValue(item, this.userNameField) || item.name || item.title || item.label || `User ${markerNumber}`;
      const userEmail = this.showUserEmail ? (this.getUserFieldValue(item, this.userEmailField) || item.email || '') : '';
      const userStatus = this.showUserStatus ? (this.getUserFieldValue(item, this.userStatusField) || item.status || '') : '';
      const userRole = this.showUserRole ? (this.getUserFieldValue(item, this.userRoleField) || item.role || '') : '';
      
      const sanitizedName = sanitize(userName);
      
      // Validate and sanitize coordinates
      const lat = Number(item.latitude || item.lat || item.y || item.latitud);
      const lng = Number(item.longitude || item.lng || item.x || item.longitud);
      const latDisplay = !isNaN(lat) ? lat.toFixed(4) : 'N/A';
      const lngDisplay = !isNaN(lng) ? lng.toFixed(4) : 'N/A';
      
      const popupWidth = this.content.popupWidth || 250;
      const popupHeight = this.content.popupHeight || 120;
      const popupTemplate = this.content.popupContentTemplate || 'default';
      const showCoords = this.content.showCoordinatesInPopup !== false;
      const showNumber = this.content.showMarkerNumber !== false;
      
      switch (popupTemplate) {
        case 'detailed':
          content = `
            <div style="min-width: ${popupWidth}px; max-width: ${popupWidth}px;">
              <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${sanitizedName}</h3>
              ${userEmail ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">📧 ${sanitize(userEmail)}</p>` : ''}
              ${userRole ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">👤 ${sanitize(userRole)}</p>` : ''}
              ${userStatus ? `<p style="margin: 4px 0; font-size: 12px; color: ${userStatus.toLowerCase() === 'online' ? '#00ff00' : '#ff6666'};">🟢 ${sanitize(userStatus)}</p>` : ''}
              ${showCoords ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">Lat: ${latDisplay}</p>` : ''}
              ${showCoords ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">Lng: ${lngDisplay}</p>` : ''}
              ${showNumber ? `<p style="margin: 4px 0; font-size: 11px; color: #999;">Marker #${markerNumber}</p>` : ''}
              <div style="border-top: 1px solid #eee; margin-top: 8px; padding-top: 8px;">
                <small style="color: #888;">Click to close</small>
              </div>
            </div>
          `;
          break;
        case 'minimal':
          content = `
            <div style="min-width: 150px;">
              <p style="margin: 0; font-size: 13px; color: #333;">${sanitizedName}</p>
              ${userStatus ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: ${userStatus.toLowerCase() === 'online' ? '#00aa00' : '#aa0000'};">${sanitize(userStatus)}</p>` : ''}
            </div>
          `;
          break;
        default: // 'default'
          content = `
            <div style="min-width: ${popupWidth}px;">
              <h4 style="margin: 0 0 6px 0; color: #333; font-size: 13px;">${sanitizedName}</h4>
              ${userEmail ? `<p style="margin: 2px 0; font-size: 11px; color: #666;">${sanitize(userEmail)}</p>` : ''}
              ${userStatus ? `<p style="margin: 2px 0; font-size: 11px; color: ${userStatus.toLowerCase() === 'online' ? '#00aa00' : '#aa0000'};">${sanitize(userStatus)}</p>` : ''}
              ${showCoords ? `<p style="margin: 3px 0; font-size: 11px; color: #666;">📍 ${latDisplay}, ${lngDisplay}</p>` : ''}
            </div>
          `;
      }
      
      return content;
    },

    // Helper method to get user field value with fallback
    getUserFieldValue(item, fieldName) {
      if (!fieldName || !item) return '';
      
      // Support nested field access (e.g., "user.profile.name")
      if (fieldName.includes('.')) {
        const parts = fieldName.split('.');
        let value = item;
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined || value === null) return '';
        }
        return value;
      }
      
      return item[fieldName] || '';
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
        // Create popup with custom dimensions - enable autoPan for better UX
        const popupWidth = this.content.popupWidth || 250;
        const popupHeight = this.content.popupHeight || 120;
        return L.popup({
          maxWidth: popupWidth,
          maxHeight: popupHeight,
          className: 'custom-marker-popup',
          closeButton: true,
          autoPan: true, // Enable auto-pan to ensure popup is visible
          keepInView: true, // Keep popup in view
          offset: [0, -10] // Offset to position popup above marker
        }).setContent(content);
      } catch (error) {
        console.warn('Error creating custom popup, falling back to default:', error);
        // Fallback to basic popup if custom creation fails
        return L.popup().setContent(content);
      }
    },

    // Initialize user configuration from content
    initializeUserConfig() {
      this.userDataSource = this.content.userDataSource || 'collection';
      this.userNameField = this.content.userNameField || 'name';
      this.userEmailField = this.content.userEmailField || 'email';
      this.userStatusField = this.content.userStatusField || 'status';
      this.userRoleField = this.content.userRoleField || 'role';
      this.showUserEmail = this.content.showUserEmail !== undefined ? this.content.showUserEmail : true;
      this.showUserStatus = this.content.showUserStatus !== undefined ? this.content.showUserStatus : true;
      this.showUserRole = this.content.showUserRole !== undefined ? this.content.showUserRole : false;
      
      console.log('☢️ User configuration initialized:', {
        userDataSource: this.userDataSource,
        userNameField: this.userNameField,
        userEmailField: this.userEmailField,
        userStatusField: this.userStatusField,
        userRoleField: this.userRoleField,
        showUserEmail: this.showUserEmail,
        showUserStatus: this.showUserStatus,
        showUserRole: this.showUserRole
      });
    },
    
    // Get user-specific marker styling
    getUserMarkerStyle(item) {
      const userStatus = this.getUserFieldValue(item, this.userStatusField) || item.status || '';
      const isOnline = userStatus.toLowerCase() === 'online';
      const isUserData = this.userDataSource === 'users';
      
      if (isUserData) {
        // User-specific styling
        return {
          color: isOnline ? '#00ff00' : '#ff6666',
          fillColor: isOnline ? '#00ff00' : '#ff6666',
          fillOpacity: 0.8,
          radius: 8,
          weight: 2
        };
      } else {
        // Default styling for regular collection data
        return {
          color: this.content.markerColor || '#666666',
          fillColor: this.content.markerFillColor || '#999999',
          fillOpacity: 0.7,
          radius: 8,
          weight: 2
        };
      }
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
      if (this.markerClusterGroup && this.map) {
        this.map.removeLayer(this.markerClusterGroup);
        this.markerClusterGroup.clearLayers();
        this.markerClusterGroup = null;
      }
      if (this.individualMarkersGroup && this.map) {
        this.map.removeLayer(this.individualMarkersGroup);
        this.individualMarkersGroup.clearLayers();
        this.individualMarkersGroup = null;
      }
    },
    
    getCurrentPosition() {
      if (!this.map || this.isDestroyed) return;
      
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        return;
      }

      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'denied') {
          console.warn('Geolocation permission denied');
          return;
        }
        // Proceed with getCurrentPosition
        this.requestGeolocation();
      }).catch(err => {
        console.warn('Permission query failed:', err);
        // Fallback: try getCurrentPosition anyway with proper callbacks
        this.requestGeolocation();
      });
    },
    
    requestGeolocation() {
      navigator.geolocation.getCurrentPosition(
        this.handlePositionSuccess,
        (error) => console.warn('Geolocation error:', error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    },

    handlePositionSuccess(position) {
      if (this.isDestroyed || !this.map) return;

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      try {
        if (this.currentPositionMarker) this.map.removeLayer(this.currentPositionMarker);
        if (this.accuracyCircle) this.map.removeLayer(this.accuracyCircle);

        const isOnline = this.content.userStatus === 'online';
        const markerColor = isOnline ? (this.content.markerColor || '#00ff00') : (this.content.markerColor || '#ff0000');
        const markerFillColor = isOnline ? (this.content.markerFillColor || '#00ff00') : (this.content.markerFillColor || '#ff0000');
        const accuracyRadius = this.content.accuracyRadius || 1;

        this.accuracyCircle = L.circle([lat, lng], {
            radius: accuracyRadius * 1000, // User-defined accuracy in meters
            weight: 2,
            color: '#1d9bf0',
            fillColor: '#1d9bf0',
            fillOpacity: 0.1,
        }).addTo(this.map);

        this.currentPositionMarker = L.circleMarker([lat, lng], {
          color: markerColor,
          fillColor: markerFillColor,
          fillOpacity: 1,
          radius: 8,
          weight: 2,
          stroke: true,
        }).addTo(this.map).bindPopup('You are here!');

        this.userPosition = {
          latitude: lat,
          longitude: lng,
          accuracy: position.coords.accuracy || null
        };
      } catch (error) {
        console.warn('Error updating map with current position:', error);
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
      
      const accuracyRadius = this.content.accuracyRadius || 1;
      const useMiles = this.content.useMiles || false;
      let radiusInMeters = accuracyRadius * 1000; // Default to km
      if (useMiles) {
        radiusInMeters = accuracyRadius * 1609.34; // Convert miles to meters
      }
      
      this.accuracyCircle.setRadius(radiusInMeters);
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

    cleanup() {
      this.isDestroyed = true;

      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
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
        }
      };
      
      this.map.on('zoomend', this.zoomHandler);
    },

    // Add missing updateMap method
    updateMap() {
      if (this.map && !this.isDestroyed) {
        const lat = this.content.latitude || 50;
        const lng = this.content.longitude || 10;
        const zoom = this.content.zoom || 13;
        this.map.setView([lat, lng], zoom);
      }
    },

    // Generate dummy markers for testing
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
  },
  watch: {
    'content.latitude': 'updateMap',
    'content.longitude': 'updateMap',
    'content.zoom'(newZoom) {
      this.updateMap();
      this.currentZoom = newZoom || 13;
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
      if (this.map && !this.isDestroyed) {
        this.updateCollectionMarkers();
      }
    },
    'content.collectionData': {
      handler() {
        if (this.map && !this.isDestroyed) {
          this.updateCollectionMarkers();
        }
      },
      deep: true
    },
    'content.enableClustering'() {
      if (this.map && !this.isDestroyed) {
        this.updateCollectionMarkers();
      }
    },
    'content.clusterRadius'() {
      if (this.content.enableClustering && this.map && !this.isDestroyed) {
        this.updateCollectionMarkers();
      }
    },
    'content.mapType'() {
      this.setupTileLayer();
    },
    'content.accuracyRadius'() {
      if (this.currentPositionMarker && this.map) {
        this.updateUserMarkerSize();
      }
    },
    'content.useMiles'() {
      if (this.currentPositionMarker && this.map) {
        this.updateUserMarkerSize();
      }
    },
    'content.markerColor'() {
      if (this.content.enableClustering) {
        this.updateCollectionMarkers();
      } else if (this.individualMarkersGroup) {
        this.individualMarkersGroup.setStyle({ color: this.content.markerColor || '#666666' });
      }
    },
    'content.markerFillColor'() {
      if (this.content.enableClustering) {
        this.updateCollectionMarkers();
      } else if (this.individualMarkersGroup) {
        this.individualMarkersGroup.setStyle({ fillColor: this.content.markerFillColor || '#999999' });
      }
    },
    'content.popupWidth'() {
      // Popup width changed - markers will use new width on next popup open
    },
    'content.popupHeight'() {
      // Popup height changed - markers will use new height on next popup open
    },
    'content.popupContentTemplate'() {
      // Popup template changed - markers will use new template on next popup open
    },
    'content.showCoordinatesInPopup'() {
      // Show coordinates setting changed - markers will use new setting on next popup open
    },
    'content.showMarkerNumber'() {
      // Show marker number setting changed - markers will use new setting on next popup open
    },
    // New user data configuration watchers
    'content.userDataSource'() {
      this.userDataSource = this.content.userDataSource || 'collection';
      console.log(`☢️ User data source changed to: ${this.userDataSource}`);
    },
    'content.userNameField'() {
      this.userNameField = this.content.userNameField || 'name';
      this.updateCollectionMarkers();
    },
    'content.userEmailField'() {
      this.userEmailField = this.content.userEmailField || 'email';
      this.updateCollectionMarkers();
    },
    'content.userStatusField'() {
      this.userStatusField = this.content.userStatusField || 'status';
      this.updateCollectionMarkers();
    },
    'content.userRoleField'() {
      this.userRoleField = this.content.userRoleField || 'role';
      this.updateCollectionMarkers();
    },
    'content.showUserEmail'() {
      this.showUserEmail = this.content.showUserEmail !== undefined ? this.content.showUserEmail : true;
      this.updateCollectionMarkers();
    },
    'content.showUserStatus'() {
      this.showUserStatus = this.content.showUserStatus !== undefined ? this.content.showUserStatus : true;
      this.updateCollectionMarkers();
    },
    'content.showUserRole'() {
      this.showUserRole = this.content.showUserRole !== undefined ? this.content.showUserRole : false;
      this.updateCollectionMarkers();
    },
  },
};
</script>

<style lang="scss" scoped>
.openstreetmap-element {
  width: 100%;
  height: 100%;
  position: relative;
  /* Force maximum event priority */
  z-index: 9999 !important;
}

.leaflet-map-container {
  width: 100% !important;
  height: 100% !important;
  position: relative !important;
  
  /* CRITICAL: Maximum z-index to override WeWeb */
  z-index: 10000 !important;
  
  /* Remove ALL potentially blocking CSS */
  pointer-events: auto !important;
  touch-action: pan-x pan-y !important;
  user-select: none !important;
  
  /* Ensure cursor shows correctly */
  cursor: grab !important;
  
  /* Force focus capability */
  outline: 2px solid transparent !important;
  outline-offset: -2px !important;
}

/* Style for leaflet.markercluster */
.marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
	background-color: rgba(255, 107, 107, 0.6) !important;
}
.marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
	background-color: rgba(255, 107, 107, 1) !important;
}

/* Global overrides for Leaflet with maximum priority */
.leaflet-container {
  cursor: grab !important;
  pointer-events: auto !important;
  touch-action: pan-x pan-y !important;
  z-index: 10001 !important;
  position: relative !important;
}

/* CRITICAL FIX: Ensure the underlying panes that handle drag events are interactive */
.leaflet-pane,
.leaflet-tile-container {
  pointer-events: auto !important;
}


.leaflet-dragging .leaflet-container {
  cursor: grabbing !important;
}

/* Force enable all leaflet interaction elements with proper hierarchy */
.leaflet-control-zoom,
.leaflet-control-zoom-in,
.leaflet-control-zoom-out,
.leaflet-control-attribution,
.leaflet-popup,
.leaflet-marker-icon,
.leaflet-tile,
.leaflet-control-locate a {
  pointer-events: auto !important;
  z-index: 10002 !important;
  position: relative !important;
}

/* Ensure zoom buttons are always clickable */
.leaflet-control-zoom a {
  pointer-events: auto !important;
  cursor: pointer !important;
  text-decoration: none !important;
}

/* Override any WeWeb styles that might interfere - but preserve zoom functionality */
.openstreetmap-element .leaflet-control-zoom,
.leaflet-map-container .leaflet-control-zoom {
  pointer-events: auto !important;
  z-index: 10003 !important;
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
