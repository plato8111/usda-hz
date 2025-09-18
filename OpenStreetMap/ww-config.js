export default {
  editor: {
    label: {
      en: "OpenStreetMap",
    },
  },
  properties: {
    latitude: {
      label: {
        en: "Latitude",
      },
      type: "Number",
      defaultValue: 51.505,
    },
    longitude: {
      label: {
        en: "Longitude",
      },
      type: "Number",
      defaultValue: -0.09,
    },
    zoom: {
      label: {
        en: "Zoom Level",
      },
      type: "Number",
      defaultValue: 13,
      min: 1,
      max: 20,
    },
    minZoom: {
      label: {
        en: "Minimum Zoom Level",
      },
      type: "Number",
      defaultValue: 1,
      min: 1,
      max: 20,
    },
    maxZoom: {
      label: {
        en: "Maximum Zoom Level",
      },
      type: "Number",
      defaultValue: 20,
      min: 1,
      max: 20,
    },
    markerColor: {
      label: {
        en: "Marker Border Color",
      },
      type: "Color",
      defaultValue: "#3388ff",
    },
    markerFillColor: {
      label: {
        en: "Marker Fill Color",
      },
      type: "Color",
      defaultValue: "#3388ff",
    },
    userStatus: {
      label: {
        en: "User Status",
      },
      type: "Select",
      defaultValue: "online",
      bindable: true,
      options: {
        items: [
          { value: "online", label: { en: "Online" } },
          { value: "offline", label: { en: "Offline" } }
        ]
      }
    },
    showCollectionMarkers: {
      label: {
        en: "Show Collection Markers",
      },
      type: "OnOff",
      defaultValue: false,
      bindable: true,
    },
    collectionData: {
      label: {
        en: "Collection Data (Geolocations)",
      },
      type: "Collection",
      bindable: true,
    },
    showZoomLevel: {
      label: {
        en: "Show zoom level",
      },
      type: "OnOff",
      defaultValue: true,
    },
    showDebug: {
      label: {
        en: "Show debug panel",
      },
      type: "OnOff",
      defaultValue: false,
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
      label: {
        en: "User accuracy radius (km)",
      },
      type: "Number",
      defaultValue: 20,
      min: 1,
      max: 80,
      bindable: true,
    },
    useMiles: {
      label: {
        en: "Use miles for distance",
      },
      type: "OnOff",
      defaultValue: false,
      bindable: true,
    },
  },
};
