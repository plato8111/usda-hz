# USDA Hardiness Zones WeWeb Component

Interactive USDA Plant Hardiness Zone selector component for WeWeb.

## Features

- 26 accurate USDA hardiness zones (1a-13b) with exact colors and temperatures
- Dual styling: "Zone only" (colored labels) vs "Full row" (full background)
- Interactive zone selection with range output (e.g., "6a" or "6a-7a")
- Click to select/deselect zones, selected ranges show colors
- Reset selection by clicking output label
- Responsive design that fits any page size

## Installation

Import this component into WeWeb using the GitHub URL:
```
https://github.com/plato8111/usda-hz.git
```

## Usage

1. Add the component to your WeWeb page
2. Configure styling options in the component settings
3. Use the `selectedValue` internal variable in your workflows
4. Listen to `zone-selected` and `selection-reset` trigger events

## Internal Variables

- `selectedValue` (string): Currently selected zone or range (e.g., "6a" or "6a-7a")

## Trigger Events

- `zone-selected`: Fired when zones are selected/deselected
- `selection-reset`: Fired when selection is cleared