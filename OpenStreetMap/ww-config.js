export default {
  editor: {
    label: {
      en: 'OpenStreetMap',
      fr: 'OpenStreetMap',
    },
    icon: 'map',
    defaultStyle: {
      width: '100%',
      height: '100%',
    },
  },
  properties: {
    latitude: {
      label: { en: 'Initial Latitude' },
      type: 'Number',
      defaultValue: 50.0,
      section: 'settings',
      bindable: true,
    },
    longitude: {
      label: { en: 'Initial Longitude' },
      type: 'Number',
      defaultValue: 10.0,
      section: 'settings',
      bindable: true,
    },
    zoom: {
      label: { en: 'Initial Zoom' },
      type: 'Number',
      defaultValue: 3,
      section: 'settings',
      bindable: true,
    },
    minZoom: {
      label: { en: 'Min Zoom Level' },
      type: 'Number',
      defaultValue: 1,
      section: 'advanced',
      bindable: true,
    },
    maxZoom: {
      label: { en: 'Max Zoom Level' },
      type: 'Number',
      defaultValue: 20,
      section: 'advanced',
      bindable: true,
    },
    markerColor: {
      label: { en: 'Marker Border Color' },
      type: 'Color',
      defaultValue: '#666666',
      section: 'styling',
      bindable: true,
    },
    markerFillColor: {
      label: { en: 'Marker Fill Color' },
      type: 'Color',
      defaultValue: '#999999',
      section: 'styling',
      bindable: true,
    },
    userStatus: {
      label: { en: 'User Status (for color)' },
      type: 'TextSelect',
      options: {
        options: [
          { value: 'online', label: { en: 'Online' } },
          { value: 'offline', label: { en: 'Offline' } },
        ],
      },
      defaultValue: 'online',
      section: 'geolocation',
      bindable: true,
    },
    collectionData: {
      label: { en: 'Marker Data' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
    },
    // User-specific properties for database integration
    userDataSource: {
      label: {
        en: "User Data Source",
      },
      type: "Select",
      defaultValue: "collection",
      bindable: true,
      options: {
        items: [
          { value: "collection", label: { en: "Collection Data" } },
          { value: "users", label: { en: "Database Users" } },
          { value: "custom", label: { en: "Custom API" } }
        ]
      }
    },
    userNameField: {
      label: {
        en: "User Name Field",
      },
      type: "Text",
      defaultValue: "name",
      bindable: true,
    },
    userEmailField: {
      label: {
        en: "User Email Field",
      },
      type: "Text",
      defaultValue: "email",
      bindable: true,
    },
    userStatusField: {
      label: {
        en: "User Status Field",
      },
      type: "Text",
      defaultValue: "status",
      bindable: true,
    },
    userRoleField: {
      label: {
        en: "User Role Field",
      },
      type: "Text",
      defaultValue: "role",
      bindable: true,
    },
    showUserEmail: {
      label: {
        en: "Show user email in popup",
      },
      type: "OnOff",
      defaultValue: true,
      bindable: true,
    },
    showUserStatus: {
      label: {
        en: "Show user status in popup",
      },
      type: "OnOff",
      defaultValue: true,
      bindable: true,
    },
    showUserRole: {
      label: {
        en: "Show user role in popup",
      },
      type: "OnOff",
      defaultValue: false,
      bindable: true,
    },
    accuracyRadius: {
      label: { en: 'Accuracy Radius' },
      type: 'Number',
      defaultValue: 1,
      section: 'geolocation',
      bindable: true,
    },
    useMiles: {
      label: { en: 'Use Miles for Radius' },
      type: 'OnOff',
      defaultValue: false,
      section: 'geolocation',
      bindable: true,
    },
    // Map Controls Section
    mapType: {
      label: { en: 'Map Type' },
      type: 'TextSelect',
      options: {
        options: [
          { value: 'osm', label: { en: 'Standard' } },
          { value: 'satellite', label: { en: 'Satellite' } },
          { value: 'terrain', label: { en: 'Terrain' } },
          { value: 'dark', label: { en: 'Dark Mode' } },
          { value: 'light', label: { en: 'Light Mode' } },
        ],
      },
      defaultValue: 'osm',
      section: 'settings',
      bindable: true,
    },
    enableLocateButton: {
      label: { en: 'Enable "Center on Me" Button' },
      type: 'OnOff',
      defaultValue: true,
      section: 'Map Controls',
      bindable: true,
    },
    // Marker Clustering Section
    enableClustering: {
      label: { en: 'Enable Clustering' },
      type: 'OnOff',
      defaultValue: false,
      section: 'settings',
      bindable: true,
    },
    // Popup Customization Section
    popupWidth: {
      label: { en: 'Popup Width (px)' },
      type: 'Number',
      defaultValue: 250,
      section: 'styling',
      bindable: true,
    },
    popupHeight: {
      label: { en: 'Popup Max Height (px)' },
      type: 'Number',
      defaultValue: 120,
      section: 'styling',
      bindable: true,
    },
    popupContentTemplate: {
      label: { en: 'Popup Template' },
      type: 'TextSelect',
      options: {
        options: [
          { value: 'default', label: { en: 'Default' } },
          { value: 'detailed', label: { en: 'Detailed' } },
          { value: 'minimal', label: { en: 'Minimal' } },
        ],
      },
      defaultValue: 'default',
      section: 'styling',
      bindable: true,
    },
    showCoordinatesInPopup: {
      label: { en: 'Show Coordinates in Popup' },
      type: 'OnOff',
      defaultValue: true,
      section: 'styling',
      bindable: true,
    },
    showMarkerNumber: {
      label: { en: 'Show Marker Number' },
      type: 'OnOff',
      defaultValue: false,
      section: 'styling',
      bindable: true,
    },
  },
  // This part maps the properties to the `content` object in your Vue component
  triggerEvents: [
    { name: 'update:content', label: { en: 'On Content Update' }, event: { content: '' } },
  ],
  mappings: {
    content: {
      latitude: 'latitude',
      longitude: 'longitude',
      zoom: 'zoom',
      mapType: 'mapType',
      collectionData: 'collectionData',
      enableLocateButton: 'enableLocateButton',
      enableClustering: 'enableClustering',
      markerColor: 'markerColor',
      markerFillColor: 'markerFillColor',
      popupWidth: 'popupWidth',
      popupHeight: 'popupHeight',
      popupContentTemplate: 'popupContentTemplate',
      showCoordinatesInPopup: 'showCoordinatesInPopup',
      showMarkerNumber: 'showMarkerNumber',
      userStatus: 'userStatus',
      accuracyRadius: 'accuracyRadius',
      useMiles: 'useMiles',
      minZoom: 'minZoom',
      maxZoom: 'maxZoom',
    },
  },
};
