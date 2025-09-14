
# How to Create Custom Components for WeWeb

This guide explains how to create your own custom components for the WeWeb platform.

## Core Concepts

WeWeb components are built using Vue.js. There are two main types of components:

*   **Sections:** Large, standalone blocks that cannot be nested inside other components.
*   **Elements:** Smaller, reusable blocks that can be used within Sections or other Elements.

## Development Setup

1.  **Install Node.js and npm:** Make sure you have Node.js (version 16 or higher) and npm installed on your system.
2.  **WeWeb CLI:** Install the WeWeb command-line interface (CLI) globally:
    ```bash
    npm install -g @weweb/cli
    ```

## Creating a New Component

1.  **Initialize a new component:** Use the WeWeb CLI to create a new component project:
    ```bash
    weweb create my-component
    ```
    This will create a new directory called `my-component` with the basic file structure.

2.  **Component Structure:** The main files for your component are located in the `src` directory:
    *   `ww-config.js`: This file defines the component's properties and settings that will be displayed in the WeWeb editor.
    *   `src/wwElement.vue`: This is the Vue.js component file where you will write the template, script, and style for your component.

## Developing Your Component

1.  **Define Properties in `ww-config.js`:**
    The `ww-config.js` file is where you define the properties that users can edit in the WeWeb editor.

    ```javascript
    export default {
      editor: {
        label: 'My Component',
        icon: 'star',
      },
      properties: {
        title: {
          label: 'Title',
          type: 'Text',
          defaultValue: 'Hello World!',
        },
      },
    };
    ```

2.  **Write the Vue Component in `wwElement.vue`:**
    This is where you write the actual Vue.js code for your component. You can access the properties defined in `ww-config.js` through the `content` prop.

    ```vue
    <template>
      <div class="my-component">
        <h1>{{ content.title }}</h1>
      </div>
    </template>

    <script>
    export default {
      props: {
        content: {
          type: Object,
          required: true,
        },
      },
    };
    </script>

    <style scoped>
    .my-component {
      padding: 20px;
      border: 1px solid #ccc;
    }
    </style>
    ```

## Building and Deploying

1.  **Build the component:**
    ```bash
    cd my-component
    npm run build
    ```
    This will create a `dist` folder with the compiled component files.

2.  **Deploy to WeWeb:**
    You can either upload the `dist` folder to a web server or use a service like Netlify to host your component. Once hosted, you can add the component to your WeWeb project by providing the URL to the component's `ww-config.js` file.

For more detailed information, refer to the [official WeWeb developer documentation](https://developer.weweb.io/).
