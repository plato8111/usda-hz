export default {
  editor: {
    label: {
      en: "USDA Hardiness Zones",
    },
    icon: 'wwi wwi-grid'
  },
  properties: {
    initialValue: {
      label: {
        en: "Initial Selection",
      },
      type: "Text",
      section: "settings",
      bindable: true,
      defaultValue: "",
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Zone ID (e.g., "6a") or range (e.g., "6a-7a")'
      },
      propertyHelp: 'Set initial zone selection. Use single zone like "6a" or range like "6a-7a"'
      /* wwEditor:end */
    },
    selectionEnabled: {
      label: {
        en: "Enable Selection",
      },
      type: "OnOff",
      section: "settings",
      defaultValue: true,
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Enable/disable zone selection functionality'
      },
      propertyHelp: 'When disabled, component becomes read-only for zone lookup. Initial value will be highlighted with a subtle frame.'
      /* wwEditor:end */
    },
    showOutput: {
      label: {
        en: "Show Selected Output",
      },
      type: "OnOff",
      section: "settings",
      defaultValue: true,
      bindable: true,
      hidden: content => !content?.selectionEnabled,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show/hide the selected zones output display'
      },
      propertyHelp: 'Display the selected zones value below the map'
      /* wwEditor:end */
    },
    colorStyle: {
      label: {
        en: "Color Style",
      },
      type: "TextSelect",
      section: "settings",
      options: {
        options: [
          { value: 'zone-only', label: 'Zone Only (like USDA chart)' },
          { value: 'full-row', label: 'Full Row Background' }
        ]
      },
      defaultValue: 'zone-only',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Choose how colors are applied: zone-only | full-row'
      },
      propertyHelp: 'Zone Only colors just the zone ID (like original USDA chart), Full Row colors the entire background'
      /* wwEditor:end */
    },
    maxWidth: {
      label: {
        en: "Width",
      },
      type: "Length",
      section: "style",
      defaultValue: "250px",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Width of the component'
      },
      propertyHelp: 'Width of the component'
      /* wwEditor:end */
    },
    borderRadius: {
      label: {
        en: "Border Radius",
      },
      type: "Length",
      section: "style",
      defaultValue: "8px",
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Border radius for the container and zones'
      },
      propertyHelp: 'Rounded corners for the zones container'
      /* wwEditor:end */
    },
    outputBackgroundColor: {
      label: {
        en: "Output Background",
      },
      type: "Color",
      section: "style",
      defaultValue: "#f5f5f5",
      bindable: true,
      hidden: content => !content?.showOutput,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color for the output display area'
      },
      propertyHelp: 'Background color of the selected zones output'
      /* wwEditor:end */
    },
    outputTextColor: {
      label: {
        en: "Output Text Color",
      },
      type: "Color",
      section: "style",
      defaultValue: "#333333",
      bindable: true,
      hidden: content => !content?.showOutput,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Text color for the output display'
      },
      propertyHelp: 'Text color of the selected zones output'
      /* wwEditor:end */
    }
  },
  triggerEvents: [
    {
      name: 'zone-selected',
      label: { en: 'Zone Selected' },
      event: {
        selectedZones: '',
        selectedValue: ''
      },
      default: true
    },
    {
      name: 'selection-reset',
      label: { en: 'Selection Reset' },
      event: {
        selectedZones: '',
        selectedValue: ''
      }
    }
  ]
};
