# Graph Layer Components

This project provides a set of frontend components for rendering content from Microsoft Graph pulled in via `graph-layer`.

## Building

To build the project, run the `build` script:

~~~
$ npm run build
~~~

The build process places build products in the `dist` directory.

## Testing

Before using the testing framework, you must build it using the following command:

~~~
$ npm run build-test
~~~

The testing framework is designed to be loaded as a testing module in the `graph-layer` test program. Just pass the path to the `test` directory to the test program.

## Usage

To use the library, install it in your project:

~~~
$ npm install --save @tccl/graph-layer-components
~~~

This library is designed to work in two significant ways:

- In a Vue.js application as a component library
- Or dynamically loading components on certain HTML elements (i.e. scanning)

> Note: you are not limited to using the library in exclusively one of the aforementioned methods. You may use both at once if needed.

In general, each component is designed to work as a child of a column-oriented flexbox element. For convenience, the library provides the global CSS class `graph-layer` to use for parent elements. It is up to you as the library user to ensure this parent element is correctly sized (especially vertically) according to your needs. A component will always set its `flex-grow` property to `1` and its `flex-shrink` property to `0`. (This behavior makes it flow into the remaining space assuming all sibling elements have `flex-grow` set to the default of `0`.)

Graph Layer components are designed to render well at any size (within reason). A component will overflow with scroll if its content extends past the parent element.

### Using the library in a Vue.js application

To use the library in your Vue.js application, import the library and register the components. This allows you to access the components globally.

~~~javascript
import Vue from "vue";
import GraphLayer from "@tccl/graph-layer-components";

Vue.use(GraphLayer);
~~~

Now you can access components:

~~~vuejs
<template>
  <div class="my-view graph-layer">
    <graph-layer-user :user-principle-name="user" />
  </div>
</template>

<script>
  export default {
    name: "MyView",
	
	data: (() => {
	  user: "myuser@myorg.org"
	})
  };
</script>

<style>
  .my-view {
    min-height: 100%;
  }
</style>
~~~

### Using the library in scan mode

The library is also designed to be used outside the context of a Vue.js application using scan mode. This mode involves scanning the HTML document for elements containing attributes that indicate how to load a Graph Layer component.

Examples:

~~~html
<div class="graph-layer">
  <div data-graph-layer="user" data-graph-layer--me="1"></div>
</div>

<div class="graph-layer">
  <div data-graph-layer="drive" data-graph-layer--me="1" data-graph-layer--top="20"></div>
</div>
~~~

The following code executed at page load will create Graph Layer components from the above HTML:

~~~javascript
import GraphLayer from "@tccl/graph-layer-components";

graphLayer.scanAll();
~~~

> Note: if you are not using a build system such as rollup or webpack, you can still access the `GraphLayer` export via the `GraphLayer` global variable provided by the UMD bundle.

Explanation of attributes:

| Attribute Name | Description |
| -- | -- |
| `data-graph-layer` | Indicates the element will load a Vue.js Graph Layer component; the value indicates which component is loaded. |
| `data-graph-layer--PROP` | Passes a property value to the Vue.js component; substitute `PROP` for the name of the property |

## Components

The following components are provided by this library:

| Vue.js Component Name | Data Attribute Value | Description |
| -- | -- | -- |
| `graph-layer-user` |  `user` | Renders basic user profile information |
| `graph-layer-drive` | `drive` | Renders a read-only drive view |
| `graph-layer-drive-picker`| `drivePicker` | Widget for selecting a drive object |
