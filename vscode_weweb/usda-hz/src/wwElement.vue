<template>
  <div class="usda-hardiness-zones" :style="componentStyle">
    <div class="zones-container" :style="{ ...gridStyle, ...innerContainerStyle }">
      <!-- Header row -->
      <div class="zone-header">
        <div class="header-info">
          <div class="header-temp">Temp (F)</div>
          <div class="header-label">Zone</div>
          <div class="header-temp">Temp (C)</div>
        </div>
      </div>

      <!-- Zone items -->
      <div class="zones-grid">
        <div
          v-for="zone in zones"
          :key="zone.id"
          class="zone-item"
          :class="{
            'selected': isZoneInRange(zone.id),
            'unselected': selectedZones.length > 0 && !isZoneInRange(zone.id)
          }"
          :style="getZoneStyle(zone)"
          @click="toggleZone(zone.id)"
        >
          <div class="zone-info" :style="getZoneInfoStyle()">
            <div class="zone-temp" :style="getTempTextStyle()">{{ zone.tempF }}</div>
            <div class="zone-label" :style="getZoneLabelStyle(zone)">{{ zone.id }}</div>
            <div class="zone-temp" :style="getTempTextStyle()">{{ zone.tempC }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="content?.showOutput && selectedValue" class="selected-output" :style="outputStyle" @click="resetSelection">
      Selected: {{ selectedValue }}
    </div>
  </div>
</template>

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
    const selectedZones = ref([])

    const zones = [
      { id: '1a', tempF: '-60 to -55', tempC: '-51.1 to -48.3', color: '#d6d6ff' },
      { id: '1b', tempF: '-55 to -50', tempC: '-48.3 to -45.6', color: '#c4c4f2' },
      { id: '2a', tempF: '-50 to -45', tempC: '-45.6 to -42.8', color: '#ababd9' },
      { id: '2b', tempF: '-45 to -40', tempC: '-42.8 to -40', color: '#ebb0eb' },
      { id: '3a', tempF: '-40 to -35', tempC: '-40 to -37.2', color: '#dd8fe8' },
      { id: '3b', tempF: '-35 to -30', tempC: '-37.2 to -34.4', color: '#cf7ddb' },
      { id: '4a', tempF: '-30 to -25', tempC: '-34.4 to -31.7', color: '#a66bff' },
      { id: '4b', tempF: '-25 to -20', tempC: '-31.7 to -28.9', color: '#5a75ed' },
      { id: '5a', tempF: '-20 to -15', tempC: '-28.9 to -26.1', color: '#73a1ff' },
      { id: '5b', tempF: '-15 to -10', tempC: '-26.1 to -23.3', color: '#5ec9e0' },
      { id: '6a', tempF: '-10 to -5', tempC: '-23.3 to -20.6', color: '#47ba47' },
      { id: '6b', tempF: '-5 to 0', tempC: '-20.6 to -17.8', color: '#78c756' },
      { id: '7a', tempF: '0 to 5', tempC: '-17.8 to -15', color: '#abd669' },
      { id: '7b', tempF: '5 to 10', tempC: '-15 to -12.2', color: '#cddb70' },
      { id: '8a', tempF: '10 to 15', tempC: '-12.2 to -9.4', color: '#edda85' },
      { id: '8b', tempF: '15 to 20', tempC: '-9.4 to -6.7', color: '#ebcb57' },
      { id: '9a', tempF: '20 to 25', tempC: '-6.7 to -3.9', color: '#dbb64f' },
      { id: '9b', tempF: '25 to 30', tempC: '-3.9 to -1.1', color: '#f5b678' },
      { id: '10a', tempF: '30 to 35', tempC: '-1.1 to 1.7', color: '#da9132' },
      { id: '10b', tempF: '35 to 40', tempC: '1.7 to 4.4', color: '#e6781e' },
      { id: '11a', tempF: '40 to 45', tempC: '4.4 to 7.2', color: '#e6561e' },
      { id: '11b', tempF: '45 to 50', tempC: '7.2 to 10', color: '#e88564' },
      { id: '12a', tempF: '50 to 55', tempC: '10 to 12.8', color: '#d4594e' },
      { id: '12b', tempF: '55 to 60', tempC: '12.8 to 15.6', color: '#b51228' },
      { id: '13a', tempF: '60 to 65', tempC: '15.6 to 18.3', color: '#962f1d' },
      { id: '13b', tempF: '65 to 70', tempC: '18.3 to 21.1', color: '#751a00' }
    ]

    const selectedValue = computed(() => {
      if (selectedZones.value.length === 0) return ''
      if (selectedZones.value.length === 1) return selectedZones.value[0]

      const sortedZones = [...selectedZones.value].sort((a, b) => {
        const aNum = parseFloat(a.replace(/[ab]/, ''))
        const bNum = parseFloat(b.replace(/[ab]/, ''))
        if (aNum !== bNum) return aNum - bNum
        return a.localeCompare(b)
      })

      // Check if zones are contiguous
      let isContiguous = true
      for (let i = 0; i < sortedZones.length - 1; i++) {
        const currentIndex = zones.findIndex(z => z.id === sortedZones[i])
        const nextIndex = zones.findIndex(z => z.id === sortedZones[i + 1])
        if (nextIndex !== currentIndex + 1) {
          isContiguous = false
          break
        }
      }

      // If contiguous, return range format, otherwise return first-last
      if (isContiguous) {
        return `${sortedZones[0]}-${sortedZones[sortedZones.length - 1]}`
      } else {
        return `${sortedZones[0]}-${sortedZones[sortedZones.length - 1]}`
      }
    })

    const handleValueChange = (newValue) => {
      if (internalValue.value !== newValue) {
        setInternalValue(newValue || '')
        emit('trigger-event', {
          name: 'zone-selected',
          event: {
            selectedZones: [...selectedZones.value],
            selectedValue: newValue || ''
          }
        })
      }
    }

    const toggleZone = (zoneId) => {
      const index = selectedZones.value.indexOf(zoneId)
      if (index > -1) {
        selectedZones.value.splice(index, 1)
      } else {
        selectedZones.value.push(zoneId)
      }

      // Trigger the value change handler
      handleValueChange(selectedValue.value)
    }

    const resetSelection = () => {
      selectedZones.value = []

      // Trigger the value change handler
      handleValueChange('')

      emit('trigger-event', {
        name: 'selection-reset',
        event: {
          selectedZones: [],
          selectedValue: ''
        }
      })
    }

    const isZoneInRange = (zoneId) => {
      const hasSelections = selectedZones.value.length > 0

      if (!hasSelections) return false

      if (selectedZones.value.length === 1) {
        return selectedZones.value.includes(zoneId)
      }

      // Multiple selections - check if zone is in range
      const sortedZones = [...selectedZones.value].sort((a, b) => {
        const aNum = parseFloat(a.replace(/[ab]/, ''))
        const bNum = parseFloat(b.replace(/[ab]/, ''))
        if (aNum !== bNum) return aNum - bNum
        return a.localeCompare(b)
      })

      const firstZone = sortedZones[0]
      const lastZone = sortedZones[sortedZones.length - 1]
      const firstIndex = zones.findIndex(z => z.id === firstZone)
      const lastIndex = zones.findIndex(z => z.id === lastZone)
      const currentIndex = zones.findIndex(z => z.id === zoneId)

      return currentIndex >= firstIndex && currentIndex <= lastIndex
    }

    const getZoneStyle = (zone) => {
      const hasSelections = selectedZones.value.length > 0
      const isInRange = isZoneInRange(zone.id)
      const colorStyle = props.content?.colorStyle || 'zone-only'

      if (colorStyle === 'full-row') {
        return {
          backgroundColor: zone.color,
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

    const getZoneLabelStyle = (zone) => {
      const hasSelections = selectedZones.value.length > 0
      const isInRange = isZoneInRange(zone.id)
      const colorStyle = props.content?.colorStyle || 'zone-only'

      if (colorStyle === 'zone-only') {
        return {
          backgroundColor: zone.color,
          opacity: !hasSelections || isInRange ? 1 : 0.3,
          color: '#000000',
          fontWeight: '500',
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
          fontWeight: '500',
          minHeight: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          minWidth: '40px'
        }
      }
    }

    const getZoneInfoStyle = () => {
      const colorStyle = props.content?.colorStyle || 'zone-only'

      if (colorStyle === 'zone-only') {
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

    const getTempTextStyle = () => {
      return {
        color: '#000000',
        minHeight: '22px',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '400',
        fontSize: '12px'
      }
    }


    // MANDATORY: Define internal variables for NoCode users
    const { value: internalValue, setValue: setInternalValue } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid, // Always use props.uid for unique instances
      name: 'selectedValue',
      type: 'string',
      defaultValue: '',
    })

    // MANDATORY: Watch for initialValue changes and reset internal variable
    watch(() => props.content?.initialValue, (newValue) => {
      if (newValue !== undefined && newValue !== selectedValue.value) {
        selectedZones.value = []
        if (newValue.includes('-')) {
          const [start, end] = newValue.split('-')
          const startIndex = zones.findIndex(z => z.id === start)
          const endIndex = zones.findIndex(z => z.id === end)
          if (startIndex !== -1 && endIndex !== -1) {
            for (let i = startIndex; i <= endIndex; i++) {
              selectedZones.value.push(zones[i].id)
            }
          }
        } else if (newValue) {
          selectedZones.value = [newValue]
        }
        setInternalValue(newValue)
      }
    }, { immediate: true })

    // MANDATORY: Emit trigger events when value changes
    watch(selectedValue, (newValue) => {
      if (internalValue.value !== newValue) {
        setInternalValue(newValue || '')
      }
    }, { immediate: true })

    // MANDATORY: Watch ALL properties that affect component rendering
    watch(() => [
      props.content?.colorStyle,
      props.content?.showOutput,
      props.content?.maxWidth,
      props.content?.borderRadius,
      props.content?.outputBackgroundColor,
      props.content?.outputTextColor,
      props.content?.initialValue
    ], () => {
      // Properties handled by computed styles - no action needed
      // This ensures WeWeb editor shows real-time updates
    }, { deep: true })

    // Computed styles using configuration properties
    const componentStyle = computed(() => ({
      // Root element must fluidly adapt - no hardcoded dimensions
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

    const outputStyle = computed(() => ({
      backgroundColor: props.content?.outputBackgroundColor || '#f5f5f5',
      color: props.content?.outputTextColor || '#333333',
      borderRadius: props.content?.borderRadius || '6px',
    }))

    return {
      zones,
      selectedZones,
      selectedValue,
      internalValue,
      toggleZone,
      resetSelection,
      getZoneStyle,
      getZoneLabelStyle,
      getZoneInfoStyle,
      getTempTextStyle,
      isZoneInRange,
      componentStyle,
      gridStyle,
      innerContainerStyle,
      outputStyle,
      content: props.content
    }
  }
}
</script>

<style lang="scss" scoped>
.usda-hardiness-zones {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

.zones-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.zone-header {
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

.header-temp {
  font-size: 12px;
  font-weight: bold;
  color: #666;

  &:first-child {
    text-align: left;
  }

  &:last-child {
    text-align: right;
  }
}

.header-label {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  color: #333;
  min-width: 30px;
}

.zones-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: #f0f0f0;
}

.zone-item {
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

.zone-info {
  padding: 4px 12px;
  min-height: 20px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}

.zone-temp {
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;

  &:first-child {
    text-align: left;
  }

  &:last-child {
    text-align: right;
  }
}

.zone-label {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  min-width: 30px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
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

@media (max-width: 480px) {
  .zones-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .zone-info {
    min-height: 50px;
    padding: 6px 4px;
  }

  .zone-temp {
    font-size: 9px;
  }

  .zone-label {
    font-size: 12px;
  }
}
</style>
