# WeWeb Interactive Data Selection Element - User Guide

## Overview

This guide provides a complete blueprint for creating interactive data selection elements similar to the USDA Hardiness Zones component. Use this as a reference for building components with clickable data items, range selection, and real-time value exposure.

## Project Structure

```
your-element/
├── src/
│   └── wwElement.vue          # Main Vue component
├── package.json               # Dependencies and scripts
├── ww-config.js              # WeWeb configuration
├── README.md                 # Installation guide
├── .gitignore               # Standard ignores
└── ELEMENT_USER_GUIDE.md    # This guide
```

## Core Features to Implement

### 1. Interactive Data Selection
- ✅ Click individual items to select/deselect
- ✅ Multi-selection with visual feedback
- ✅ Range selection (continuous selections)
- ✅ Reset functionality

### 2. Visual Feedback
- ✅ Selected items highlighted
- ✅ Unselected items grayed out during selection
- ✅ Hover effects for interactivity
- ✅ Dual styling options (item-only vs full-row)

### 3. Value Exposure
- ✅ Single item selection: "item1"
- ✅ Range selection: "item1-item5"
- ✅ Data range calculations (min/max values)
- ✅ Real-time internal variable updates

## Implementation Guide

### Step 1: Vue Component Structure (`src/wwElement.vue`)

#### Template Structure
```vue
<template>
  <div class="data-selector" :style="componentStyle">
    <div class="items-container" :style="{ ...gridStyle, ...innerContainerStyle }">
      <!-- Header row -->
      <div class="item-header">
        <div class="header-info">
          <div class="header-col">Data 1</div>
          <div class="header-label">Item</div>
          <div class="header-col">Data 2</div>
        </div>
      </div>

      <!-- Data items -->
      <div class="items-grid">
        <div
          v-for="item in dataItems"
          :key="item.id"
          class="data-item"
          :class="{
            'selected': isItemInRange(item.id),
            'unselected': selectedItems.length > 0 && !isItemInRange(item.id)
          }"
          :style="getItemStyle(item)"
          @click="toggleItem(item.id)"
        >
          <div class="item-info" :style="getItemInfoStyle()">
            <div class="item-data" :style="getDataTextStyle(true)">{{ item.data1 }}</div>
            <div class="item-label" :style="getItemLabelStyle(item)">{{ item.id }}</div>
            <div class="item-data" :style="getDataTextStyle(false)">{{ item.data2 }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="content?.showOutput" class="selected-output" :style="getOutputStyle()" @click="resetSelection">
      <span v-if="selectedValue">Selected: {{ selectedValue }}</span>
      <span v-else>&nbsp;</span>
    </div>
  </div>
</template>
```

#### Script Structure
```vue
<script>
import { ref, computed, watch } from 'vue'

export default {
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },

  setup(props, { emit }) {
    // State management
    const selectedItems = ref([])

    // Data array - customize for your use case
    const dataItems = [
      { id: 'item1', data1: 'value1', data2: 'value2', color: '#color1' },
      { id: 'item2', data1: 'value3', data2: 'value4', color: '#color2' },
      // ... add your data items
    ]

    // Selection logic
    const selectedValue = computed(() => {
      if (selectedItems.value.length === 0) return ''
      if (selectedItems.value.length === 1) return selectedItems.value[0]

      const sortedItems = [...selectedItems.value].sort((a, b) => {
        const aIndex = dataItems.findIndex(item => item.id === a)
        const bIndex = dataItems.findIndex(item => item.id === b)
        return aIndex - bIndex
      })

      return `${sortedItems[0]}-${sortedItems[sortedItems.length - 1]}`
    })

    // Internal variables - MANDATORY for WeWeb
    const { value: internalValue, setValue: setInternalValue } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedValue',
      type: 'string',
      defaultValue: '',
    })

    const { value: dataRange1, setValue: setDataRange1 } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'dataRange1',
      type: 'string',
      defaultValue: '',
    })

    const { value: dataRange2, setValue: setDataRange2 } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'dataRange2',
      type: 'string',
      defaultValue: '',
    })

    // Range calculation logic
    const calculateDataRanges = () => {
      if (selectedItems.value.length === 0) {
        setDataRange1('')
        setDataRange2('')
        return
      }

      const selectedItemData = selectedItems.value.map(itemId =>
        dataItems.find(item => item.id === itemId)
      ).filter(Boolean)

      if (selectedItemData.length === 0) return

      // Extract numeric values from your data
      const dataRanges = selectedItemData.map(item => {
        // Parse your data format - adjust based on your data structure
        const data1Value = parseFloat(item.data1) || 0
        const data2Value = parseFloat(item.data2) || 0
        return { data1: data1Value, data2: data2Value }
      })

      // Calculate min/max ranges
      const data1Min = Math.min(...dataRanges.map(r => r.data1))
      const data1Max = Math.max(...dataRanges.map(r => r.data1))
      const data2Min = Math.min(...dataRanges.map(r => r.data2))
      const data2Max = Math.max(...dataRanges.map(r => r.data2))

      setDataRange1(`${data1Min} to ${data1Max}`)
      setDataRange2(`${data2Min} to ${data2Max}`)
    }

    // Event handlers
    const handleValueChange = (newValue) => {
      if (internalValue.value !== newValue) {
        setInternalValue(newValue || '')
        calculateDataRanges()
        emit('trigger-event', {
          name: 'item-selected',
          event: {
            selectedItems: [...selectedItems.value],
            selectedValue: newValue || '',
            dataRange1: dataRange1.value,
            dataRange2: dataRange2.value
          }
        })
      }
    }

    const toggleItem = (itemId) => {
      const index = selectedItems.value.indexOf(itemId)
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      } else {
        selectedItems.value.push(itemId)
      }
      handleValueChange(selectedValue.value)
    }

    const resetSelection = () => {
      selectedItems.value = []
      setDataRange1('')
      setDataRange2('')
      handleValueChange('')
      emit('trigger-event', {
        name: 'selection-reset',
        event: {
          selectedItems: [],
          selectedValue: '',
          dataRange1: '',
          dataRange2: ''
        }
      })
    }

    const isItemInRange = (itemId) => {
      const hasSelections = selectedItems.value.length > 0
      if (!hasSelections) return false
      if (selectedItems.value.length === 1) {
        return selectedItems.value.includes(itemId)
      }

      // Range logic for multiple selections
      const sortedItems = [...selectedItems.value].sort((a, b) => {
        const aIndex = dataItems.findIndex(item => item.id === a)
        const bIndex = dataItems.findIndex(item => item.id === b)
        return aIndex - bIndex
      })

      const firstItem = sortedItems[0]
      const lastItem = sortedItems[sortedItems.length - 1]
      const firstIndex = dataItems.findIndex(item => item.id === firstItem)
      const lastIndex = dataItems.findIndex(item => item.id === lastItem)
      const currentIndex = dataItems.findIndex(item => item.id === itemId)

      return currentIndex >= firstIndex && currentIndex <= lastIndex
    }

    // Styling functions
    const getItemStyle = (item) => {
      const hasSelections = selectedItems.value.length > 0
      const isInRange = isItemInRange(item.id)
      const colorStyle = props.content?.colorStyle || 'item-only'

      if (colorStyle === 'full-row') {
        return {
          backgroundColor: item.color,
          opacity: !hasSelections || isInRange ? 1 : 0.3,
          cursor: 'pointer'
        }
      } else {
        return {
          backgroundColor: 'transparent',
          cursor: 'pointer'
        }
      }
    }

    const getItemLabelStyle = (item) => {
      const hasSelections = selectedItems.value.length > 0
      const isInRange = isItemInRange(item.id)
      const colorStyle = props.content?.colorStyle || 'item-only'

      if (colorStyle === 'item-only') {
        return {
          backgroundColor: item.color,
          opacity: !hasSelections || isInRange ? 1 : 0.3,
          color: '#000000',
          fontWeight: '300',
          minHeight: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          minWidth: '40px',
          padding: '2px 8px',
          borderRadius: '2px',
          border: '1px solid rgba(0,0,0,0.1)'
        }
      } else {
        return {
          backgroundColor: 'transparent',
          color: '#000000',
          fontWeight: '300',
          minHeight: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          minWidth: '40px'
        }
      }
    }

    const getItemInfoStyle = () => {
      const colorStyle = props.content?.colorStyle || 'item-only'
      if (colorStyle === 'item-only') {
        return {
          background: '#ffffff',
          minHeight: '22px'
        }
      } else {
        return {
          background: 'transparent',
          minHeight: '22px'
        }
      }
    }

    const getDataTextStyle = (isFirst = false) => {
      const baseStyle = {
        color: '#000000',
        minHeight: '22px',
        fontWeight: '400',
        fontSize: '12px',
        width: '100%',
        padding: '0 4px',
        display: 'flex',
        alignItems: 'center'
      }

      if (isFirst) {
        return {
          ...baseStyle,
          justifyContent: 'flex-end',
          paddingRight: '8px'
        }
      } else {
        return {
          ...baseStyle,
          justifyContent: 'flex-start',
          paddingLeft: '4px',
          paddingRight: '0px'
        }
      }
    }

    // Computed styles
    const componentStyle = computed(() => ({
      width: '100%',
    }))

    const gridStyle = computed(() => ({
      borderRadius: props.content?.borderRadius || '8px',
    }))

    const innerContainerStyle = computed(() => ({
      width: props.content?.maxWidth || '250px',
      maxWidth: '100%',
      margin: '0 auto',
    }))

    const getOutputStyle = () => {
      const baseStyle = {
        backgroundColor: props.content?.outputBackgroundColor || '#f5f5f5',
        color: props.content?.outputTextColor || '#333333',
        borderRadius: props.content?.borderRadius || '6px',
      }
      return {
        ...baseStyle,
        opacity: selectedValue.value ? 1 : 0,
        cursor: selectedValue.value ? 'pointer' : 'default',
        minHeight: '44px',
        width: props.content?.maxWidth || '250px',
        maxWidth: '100%',
        margin: '16px auto 0 auto',
        boxSizing: 'border-box'
      }
    }

    // Property watching for real-time updates
    watch(() => [
      props.content?.colorStyle,
      props.content?.showOutput,
      props.content?.maxWidth,
      props.content?.borderRadius,
      props.content?.outputBackgroundColor,
      props.content?.outputTextColor,
      props.content?.initialValue
    ], () => {
      // Properties handled by computed styles - ensures real-time updates
    }, { deep: true })

    // Initial value handling
    watch(() => props.content?.initialValue, (newValue) => {
      if (newValue !== undefined && newValue !== selectedValue.value) {
        selectedItems.value = []
        if (newValue.includes('-')) {
          const [start, end] = newValue.split('-')
          const startIndex = dataItems.findIndex(item => item.id === start)
          const endIndex = dataItems.findIndex(item => item.id === end)
          if (startIndex !== -1 && endIndex !== -1) {
            for (let i = startIndex; i <= endIndex; i++) {
              selectedItems.value.push(dataItems[i].id)
            }
          }
        } else if (newValue) {
          selectedItems.value = [newValue]
        }
        setInternalValue(newValue)
      }
    }, { immediate: true })

    // Value change watching
    watch(selectedValue, (newValue) => {
      if (internalValue.value !== newValue) {
        setInternalValue(newValue || '')
      }
    }, { immediate: true })

    return {
      dataItems,
      selectedItems,
      selectedValue,
      internalValue,
      dataRange1,
      dataRange2,
      toggleItem,
      resetSelection,
      getItemStyle,
      getItemLabelStyle,
      getItemInfoStyle,
      getDataTextStyle,
      getOutputStyle,
      isItemInRange,
      componentStyle,
      gridStyle,
      innerContainerStyle,
      content: props.content
    }
  }
}
</script>
```

### Step 2: WeWeb Configuration (`ww-config.js`)

```javascript
export default {
  editor: {
    label: {
      en: "Your Data Selector",
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
        tooltip: 'Item ID (e.g., "item1") or range (e.g., "item1-item5")'
      },
      propertyHelp: 'Set initial item selection. Use single item like "item1" or range like "item1-item5"'
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
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Show/hide the selected items output display'
      },
      propertyHelp: 'Display the selected items value below the selector'
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
          { value: 'item-only', label: 'Item Only (colored labels)' },
          { value: 'full-row', label: 'Full Row Background' }
        ]
      },
      defaultValue: 'item-only',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Choose how colors are applied: item-only | full-row'
      },
      propertyHelp: 'Item Only colors just the item labels, Full Row colors the entire background'
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
        tooltip: 'Border radius for the container and items'
      },
      propertyHelp: 'Rounded corners for the items container'
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
      propertyHelp: 'Background color of the selected items output'
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
      propertyHelp: 'Text color of the selected items output'
      /* wwEditor:end */
    }
  },
  triggerEvents: [
    {
      name: 'item-selected',
      label: { en: 'Item Selected' },
      event: {
        selectedItems: '',
        selectedValue: '',
        dataRange1: '',
        dataRange2: ''
      },
      default: true
    },
    {
      name: 'selection-reset',
      label: { en: 'Selection Reset' },
      event: {
        selectedItems: '',
        selectedValue: '',
        dataRange1: '',
        dataRange2: ''
      }
    }
  ]
};
```

### Step 3: Styling (`src/wwElement.vue` - Style Section)

```scss
<style lang="scss" scoped>
.data-selector {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

.items-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.item-header {
  background: #f8f9fa;
  border-bottom: 2px solid #ddd;
}

.header-info {
  padding: 8px 12px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  min-height: 32px;
}

.header-col {
  font-size: 12px;
  font-weight: bold;
  color: #666;

  &:first-child {
    text-align: right;
  }

  &:last-child {
    text-align: left;
  }
}

.header-label {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  color: #333;
  min-width: 30px;
}

.items-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: #f0f0f0;
}

.data-item {
  transition: all 0.2s ease;
  border: none;
  border-bottom: 1px solid #ddd;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    transform: none;
    box-shadow: inset 0 0 0 2px rgba(0, 122, 255, 0.3);
  }

  &.unselected {
    filter: grayscale(100%) brightness(0.7);
  }
}

.item-info {
  padding: 4px 12px;
  min-height: 22px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}

.item-data {
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
}

.item-label {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  min-width: 30px;
}

.selected-output {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e5e5;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

// Responsive design
@media (max-width: 480px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .item-info {
    min-height: 50px;
    padding: 6px 4px;
  }

  .item-data {
    font-size: 9px;
  }

  .item-label {
    font-size: 12px;
  }
}
</style>
```

### Step 4: Package Configuration (`package.json`)

```json
{
  "name": "your-element-name",
  "version": "0.0.1",
  "scripts": {
    "build": "weweb build --name your-element-name",
    "serve": "weweb serve"
  },
  "devDependencies": {
    "@weweb/cli": "latest"
  }
}
```

## Key WeWeb Integration Points

### 1. Internal Variables (MANDATORY)
```javascript
// Always expose these for NoCode workflows
const { value: selectedValue, setValue: setSelectedValue } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid, // Always use props.uid
  name: 'selectedValue',
  type: 'string',
  defaultValue: '',
})

// Add data-specific variables
const { value: dataRange1, setValue: setDataRange1 } = wwLib.wwVariable.useComponentVariable({
  uid: props.uid,
  name: 'dataRange1',
  type: 'string',
  defaultValue: '',
})
```

### 2. Trigger Events (MANDATORY)
```javascript
// Always emit comprehensive event data
emit('trigger-event', {
  name: 'item-selected',
  event: {
    selectedItems: [...selectedItems.value],
    selectedValue: newValue || '',
    dataRange1: dataRange1.value,
    dataRange2: dataRange2.value
  }
})
```

### 3. Property Watching (CRITICAL)
```javascript
// Watch ALL properties for real-time editor updates
watch(() => [
  props.content?.colorStyle,
  props.content?.showOutput,
  props.content?.maxWidth,
  // Add ALL your properties here
], () => {
  // Ensures WeWeb editor shows real-time updates
}, { deep: true })
```

## Customization Guidelines

### 1. Data Structure
Replace the `dataItems` array with your specific data:
```javascript
const dataItems = [
  {
    id: 'unique-id',
    data1: 'your-data-field-1',
    data2: 'your-data-field-2',
    color: '#hex-color',
    // Add any additional fields
  }
]
```

### 2. Range Calculation
Modify the `calculateDataRanges()` function for your data type:
```javascript
// For numeric ranges
const min = Math.min(...values)
const max = Math.max(...values)

// For date ranges
const earliest = new Date(Math.min(...dates))
const latest = new Date(Math.max(...dates))

// For text concatenation
const concatenated = values.join(', ')
```

### 3. Visual Styling
Customize colors, fonts, and layout in the SCSS section:
```scss
.data-item {
  // Your styling
}

.item-label {
  // Your label styling
}
```

### 4. Responsive Behavior
Adjust responsive breakpoints and grid layouts:
```scss
@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
```

## Testing Checklist

### Development Testing
- [ ] `npm run serve` works without errors
- [ ] Component renders correctly
- [ ] Click interactions work
- [ ] Selection logic functions properly
- [ ] Visual feedback appears correctly
- [ ] Reset functionality works

### WeWeb Integration Testing
- [ ] Component imports successfully into WeWeb
- [ ] All internal variables appear in editor
- [ ] Trigger events fire correctly
- [ ] Property changes update in real-time
- [ ] Component respects WeWeb styling options

### Production Testing
- [ ] `npm run build` completes successfully
- [ ] Component works in WeWeb preview mode
- [ ] No console errors in browser
- [ ] Responsive design functions properly
- [ ] Performance is acceptable

## Common Patterns

### Single vs Multiple Selection
```javascript
// Single selection mode
const toggleItem = (itemId) => {
  selectedItems.value = selectedItems.value.includes(itemId) ? [] : [itemId]
  handleValueChange(selectedValue.value)
}

// Multiple selection mode (current implementation)
const toggleItem = (itemId) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
  handleValueChange(selectedValue.value)
}
```

### Data Transformation
```javascript
// For complex data structures
const processedData = computed(() => {
  return rawData.map(item => ({
    id: item.uniqueField,
    displayName: item.label || item.name,
    value1: item.numericField,
    value2: item.categoryField,
    color: item.colorField || '#defaultcolor'
  }))
})
```

### Conditional Features
```javascript
// Optional features based on configuration
const showAdvancedFeatures = computed(() => props.content?.enableAdvanced)

// Conditional styling
const getItemStyle = (item) => {
  if (props.content?.customStyling) {
    return customStyleLogic(item)
  }
  return defaultStyleLogic(item)
}
```

## Best Practices

### Performance
- Use `computed()` for reactive data transformations
- Implement proper key attributes in v-for loops
- Avoid deep object mutations in reactive data
- Use `shallowRef()` for large, immutable data sets

### Accessibility
- Add proper ARIA labels and roles
- Ensure keyboard navigation support
- Provide sufficient color contrast
- Include screen reader friendly text

### Error Handling
- Validate data structure before processing
- Provide fallback values for missing properties
- Handle edge cases (empty data, invalid selections)
- Use optional chaining for all prop accesses

### WeWeb Compliance
- Always use `props.uid` for component variables
- Include comprehensive trigger event data
- Follow WeWeb naming conventions
- Provide helpful property descriptions

## Deployment

### Repository Setup
1. Create new GitHub repository
2. Use this structure exactly
3. Ensure main branch has clean component files
4. Test import into WeWeb before sharing

### Version Management
```json
{
  "version": "1.0.0", // Increment for major changes
  "version": "1.1.0", // Increment for new features
  "version": "1.1.1"  // Increment for bug fixes
}
```

### Documentation
- Always include comprehensive README.md
- Document all internal variables and trigger events
- Provide usage examples
- Include troubleshooting guide

## Support and Maintenance

### Common Issues
1. **Component not importing**: Check repository structure and main branch
2. **Variables not appearing**: Verify `wwLib.wwVariable.useComponentVariable` usage
3. **Styling conflicts**: Ensure scoped styles and unique class names
4. **Performance issues**: Review computed properties and watchers

### Updates and Improvements
- Monitor WeWeb API changes
- Collect user feedback for improvements
- Maintain backward compatibility
- Document breaking changes clearly

---

This guide provides a complete blueprint for creating professional WeWeb interactive data selection elements. Follow this structure and adapt the data and styling to your specific use case for consistent, high-quality components.