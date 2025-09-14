<template>
  <div class="openstreetmap-element">
    <div ref="mapContainer" :style="mapStyle"></div>
    <div class="debug-panel" v-if="showDebug">
      <div class="debug-info">
        <h3>☢️ NUCLEAR OPTION: MANUAL DRAG DETECTION</h3>
        <p>Manual Drag: {{ manualDragStatus }}</p>
        <p>Leaflet Drag: {{ leafletDragStatus }}</p>
        <p>Mouse Down: {{ mouseDownStatus }}</p>
        <p>Mouse Move: {{ mouseMoveStatus }}</p>
        <p>Status: {{ nuclearStatus }}</p>
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
      showDebug: true,
      manualDragStatus: 'IDLE',
      leafletDragStatus: 'NOT DETECTED',
      mouseDownStatus: 'UP',
      mouseMoveStatus: 'STILL',
      nuclearStatus: 'IMPLEMENTING NUCLEAR OPTION',
      isMouseDown: false,
      dragStartPos: null,
      manualDragActive: false,
    };
  },
  computed: {
    mapStyle() {
      return {
        height: '100%',
        width: '100%',
      };
    },
  },
  mounted() {
    console.log('=== ☢️ NUCLEAR OPTION: COMPLETE MANUAL OVERRIDE ===');
    console.log('Since Leaflet won\'t detect dragging, we implement manual drag detection');
    this.initMap();
    this.implementNuclearOption();
  },
  beforeDestroy() {
    this.cleanup();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    initMap() {
      console.log('☢️ NUCLEAR: Creating map with COMPLETE MANUAL CONTROL');
      
      if (this.$refs.mapContainer) {
        this.$refs.mapContainer.innerHTML = '';
      }

      // NUCLEAR OPTION: Strip everything down to absolute minimum
      // Then implement manual drag detection since Leaflet refuses to work
      this.map = L.map(this.$refs.mapContainer, {
        // ABSOLUTE MINIMUM - Let nothing interfere
        dragging: false, // We'll implement manual dragging
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        zoomControl: true,
        attributionControl: true,
        
        // NUCLEAR: Disable EVERYTHING that could possibly interfere
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        trackResize: true,
        closePopupOnClick: false,
        bounceAtZoomLimits: false,
        worldCopyJump: false,
        maxBoundsViscosity: 0.0
      }).setView(
        [this.content.latitude || 51.505, this.content.longitude || -0.09],
        this.content.zoom || 13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      console.log('☢️ Nuclear map created - implementing manual drag detection');
      
      this.setupManualDragDetection();
    },
    
    implementNuclearOption() {
      this.nuclearStatus = 'IMPLEMENTING MANUAL DRAG DETECTION';
      
      // Since Leaflet won't detect dragging, we implement it manually
      console.log('☢️ NUCLEAR OPTION: Manual drag detection since Leaflet refuses');
      console.log('- Monitoring all mouse events manually');
      console.log('- Implementing custom drag logic');
      console.log('- Bypassing Leaflet broken drag detection');
      
      this.setupManualDragDetection();
    },
    
    setupManualDragDetection() {
      const mapContainer = this.map.getContainer();
      
      // Manual mousedown detection
      mapContainer.addEventListener('mousedown', (e) => {
        this.isMouseDown = true;
        this.mouseDownStatus = 'DOWN';
        this.dragStartPos = { x: e.clientX, y: e.clientY };
        this.manualDragStatus = 'POTENTIAL DRAG START';
        console.log('☢️ MANUAL MOUSEDOWN:', { x: e.clientX, y: e.clientY });
        
        // Try to force Leaflet to recognize this as a drag start
        this.forceLeafletDragStart(e);
      }, true);
      
      // Manual mousemove detection during drag
      mapContainer.addEventListener('mousemove', (e) => {
        if (this.isMouseDown) {
          this.mouseMoveStatus = 'MOVING';
          this.manualDragStatus = 'MANUAL DRAG IN PROGRESS';
          
          const currentPos = { x: e.clientX, y: e.clientY };
          const distance = Math.sqrt(
            Math.pow(currentPos.x - this.dragStartPos.x, 2) + 
            Math.pow(currentPos.y - this.dragStartPos.y, 2)
          );
          
          if (distance > 5) { // Minimum drag distance
            this.manualDragActive = true;
            console.log('☢️ MANUAL DRAG DETECTED - distance:', distance);
            this.implementManualDragLogic(e);
          }
        }
      }, true);
      
      // Manual mouseup detection
      mapContainer.addEventListener('mouseup', (e) => {
        this.isMouseDown = false;
        this.mouseDownStatus = 'UP';
        this.mouseMoveStatus = 'STILL';
        
        if (this.manualDragActive) {
          this.manualDragStatus = 'MANUAL DRAG COMPLETED';
          console.log('☢️ MANUAL DRAG COMPLETED');
          this.completeManualDrag(e);
        } else {
          this.manualDragStatus = 'IDLE';
          console.log('☢️ MANUAL DRAG CANCELLED - insufficient movement');
        }
        
        this.manualDragActive = false;
        this.dragStartPos = null;
      }, true);
      
      this.nuclearStatus = 'MANUAL DRAG DETECTION ACTIVE';
    },
    
    forceLeafletDragStart(e) {
      // Try various methods to make Leaflet recognize the drag
      console.log('☢️ TRYING TO FORCE LEAFLET DRAG START');
      
      // Method 1: Directly trigger drag start on the map
      try {
        this.map.dragging.enable();
        console.log('☢️ Enabled dragging on map');
      } catch (error) {
        console.log('☢️ Could not enable dragging:', error);
      }
      
      // Method 2: Simulate the conditions that should trigger drag start
      const fakeEvent = {
        type: 'mousedown',
        button: 0,
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target
      };
      
      // Try to trigger Leaflet's internal drag detection
      try {
        if (this.map.dragging && this.map.dragging._onDown) {
          this.map.dragging._onDown(fakeEvent);
          console.log('☢️ Called _onDown on dragging handler');
        }
      } catch (error) {
        console.log('☢️ _onDown failed:', error);
      }
    },
    
    implementManualDragLogic(e) {
      console.log('☢️ IMPLEMENTING MANUAL DRAG LOGIC');
      
      // Try to make the map pan manually
      try {
        if (this.map.dragging && this.map.dragging._onMove) {
          this.map.dragging._onMove(e);
          console.log('☢️ Called _onMove on dragging handler');
        }
      } catch (error) {
        console.log('☢️ _onMove failed:', error);
      }
      
      // If that doesn't work, try direct panning
      try {
        const containerPoint = this.map.mouseEventToContainerPoint(e);
        const layerPoint = this.map.containerPointToLayerPoint(containerPoint);
        const latlng = this.map.layerPointToLatLng(layerPoint);
        
        console.log('☢️ Manual drag logic:', { containerPoint, layerPoint, latlng });
        
        // Try to pan the map manually
        if (this.dragStartPos) {
          const deltaX = e.clientX - this.dragStartPos.x;
          const deltaY = e.clientY - this.dragStartPos.y;
          
          // Pan the map by the delta
          this.map.panBy([-deltaX, -deltaY], { animate: false });
          this.dragStartPos = { x: e.clientX, y: e.clientY };
          
          console.log('☢️ MANUAL PAN APPLIED:', { deltaX, deltaY });
        }
      } catch (error) {
        console.log('☢️ Manual pan failed:', error);
      }
    },
    
    completeManualDrag(e) {
      console.log('☢️ COMPLETING MANUAL DRAG');
      
      // Try to trigger drag end
      try {
        if (this.map.dragging && this.map.dragging._onUp) {
          this.map.dragging._onUp(e);
          console.log('☢️ Called _onUp on dragging handler');
        }
      } catch (error) {
        console.log('☢️ _onUp failed:', error);
      }
      
      // Force drag end event
      try {
        this.map.fire('dragend', { target: this.map });
        this.leafletDragStatus = 'DRAGEND FORCED';
        console.log('☢️ FORCED DRAGEND EVENT FIRED');
      } catch (error) {
        console.log('☢️ Force dragend failed:', error);
      }
    },
    
    cleanup() {
      this.isDestroyed = true;
      
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
  },
};
</script>

<style lang="scss" scoped>
.openstreetmap-element {
  width: 100%;
  height: 100%;
  position: relative;
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
</style>
