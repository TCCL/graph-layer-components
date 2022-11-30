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

See the sections below for in-depth discussion of various usage topics.

### Sizing of components

In general, each component is designed to work within any size parent container. By default, the component will grow/shrink in height depending on how much content it renders.

#### Fixed-height components

Each component is designed to also work within a fixed-height parent container. In the case of a fixed-height component, subdivisions of the component content will overflow logically. For example, a Drive component will overflow the subdivision that renders the file listing entries while the header subdivision remains fixed in place. In this way, a component functions as a widget within a fixed area of the page.

To implement fixed-height components, you must create a column-oriented flexbox parent element. This element will have a fixed height of your choosing. As a convenience, the library provides the global CSS class `graph-layer` for this purpose.

> It is a good idea to assign the `graph-layer` class to a parent element in all cases. It works for both fixed-height and dynamic-height parent containers. If the height styling of the parent container changes from dynamic to fixed, the presence of the `graph-layer` class will automatically ensure the component works as expected in the fixed case.

### Anonymous Requests

The Graph Layer server allows clients to issue so-called "anonymous" requests. Such requests indicate that the server use a preconfigured user identity instead of requiring the user to authenticate with Microsoft Graph to obtain an access token. This feature allows the library to access resources on behalf on an anonymous client.

> If you are to use anonymous requests, you should understand any and all implications of allowing such access to resources in your tenant. This feature was designed for web applications running on secure, private networks.

Anonymous requests are not enabled by default. You must configure the Graph Layer server and the library to enable anonymous requests. See the section on _Global Configuration_ below for more on how to configure anonymous requests in the library client.

Each library component has an `anonymous` property that determines when anonymous requests are used. If this property is set to `fallback`, then the component will enable anonymous requests based on the `anonymousFallback` library option. (Note that `fallback` is the default value.) Otherwise the property either enables or disables anonymous requests explicitly via a truthy value (e.g. "off" or "enable").

### Using as a Vue.js component library

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

const graphLayer = new GraphLayer();
graphLayer.scanAll();
~~~

> Note: if you are not using a build system such as rollup or webpack, you can still access the `GraphLayer` export via the `GraphLayer` global variable provided by the UMD bundle.

Explanation of attributes:

| Attribute Name | Description |
| -- | -- |
| `data-graph-layer` | Indicates the element will load a Vue.js Graph Layer component; the value indicates which component is loaded. |
| `data-graph-layer--PROP` | Passes a property value to the Vue.js component; substitute `PROP` for the name of the property |

> When substituting `PROP` for a property name, make sure to convert a camel case property name to a hyphenated property name. Example: `propertyName` becomes `property-name`.

### Library Options

The library has a few configuration options that are globally configured. You set these on the `GraphLayer` instance via the `setOption` method.

Explanation of available configuration properties:

| Name | Description | Default |
| -- | -- | -- |
| `baseUrl` | The base URL for Graph Layer requests | `/graph/layer` |
| `cookieId` | The name of the cookie that stores the Graph Layer session ID | `GRAPH_LAYER_SESSID` |
| `theme` | The theme class to apply to themeable components | `default` |
| `anonymousAppId` | Configures the Graph layer application ID to use in anonymous requests; these also enables anonymous requests | - |
| `anonymousHeader` | Configures the HTTP header name used to indicate an anonymous request to the server. | `X-Graph-Layer-Anonymous` |
| `anonymousFallback` | Determines whether components enable anonymous requests by default when no `anonymous` property is provided and the user has no session.  | `false` |
| `hideContentAccessDenied` | Determines whether components hide content when access to content is denied | `false` |

## Components

The following components are provided by this library:

| Vue.js Component Name | Data Attribute Value | Description |
| -- | -- | -- |
| `graph-layer-user` |  `user` | Renders basic user profile information |
| `graph-layer-drive` | `drive` | Renders a read-only drive (i.e. document library) |
| `graph-layer-drive-browser` | `driveBrowser` | Widget for selecting a drive object (browser style) |
| `graph-layer-drive-picker`| `drivePicker` | Widget for selecting a drive object (tree style) |
| `graph-layer-list` | `list` | Renders a Sharepoint site list |
| `graph-layer-list-browser` | `listBrowser` | Widget for selecting a site list |

### User

The _User_ component renders a user profile summary.

**Properties**

| Property Name | Description |
| -- | -- |
| `id` | The ID of the user to render |
| `userPrincipleName` | The principle name of the user to render |
| `me` | Flag indicating that the widget should render the current user |

### Drive

The _Drive_ component renders a folder/file listing from a Microsoft drive object (i.e. document library). The listing is read-only and opens files in a new window under Microsoft 365.

**Properties**

| Property Name | Description |
| -- | -- |
| `value` | Serialized drive value (i.e. generated from `DriveBrowser` or `DrivePicker`) |
| `overrideLabel` | Title label (overrides drive name) |
| `id` | Loads a drive by its drive ID (Deprecated; use `value`) |
| `groupId` | Loads a drive by its parent group ID |
| `siteId` | Loads a drive by its parent site ID |
| `userIdOrPrincipleName` | Loads a drive by its parent user ID or user principle name |
| `me` | Loads the drive belonging to the current user |
| `top` | The maximum number of items to show per page |

### Drive Browser

The _DriveBrowser_ component is used to browse and select a drive (i.e. document library) within an organization. This includes document libraries under users, groups and sites.

**Properties**:

| Property Name | Description |
| -- | -- |
| `domainLabel` | The label of the top-level domain category. |
| `title` | The heading title for the component. Defaults to _Select a document library_. |
| `formElement` | Allows the component to function as a `<form>` element; the property value is assigned as the form element `name`. |
| `browseMe` | Enables browsing of current user's drives |
| `browseUsers` | Enables browsing of users (filtered for Members) |
| `browseGuests` | Enables browsing of guest users |
| `browseGroups` | Enables browsing of groups |
| `browseSites` | Enables browsing of sites |
| `browseFollowedSites` | Enables the component to browse a user's followed sites. |

### List

**Properties**

| Property Name | Description |
| -- | -- |
| `value` | The serialized list value. (This value can be obtained via a ListBrowser.) |
| `id` | The ID of the list to query and render. |
| `siteId` | The ID of the list's parent site. |
| `columns` | List of columns to load by ID or Name. (This overrides any columns specified via `value`.) |
| `overrideLabel` | Title label to render in place of list name. |
| `listType` | The type of list to render. (e.g. "generic" or "events") |
| `top` | Determines the number of items shown per page |

### List Browser

The _ListBrowser_ component is used to browse and select a Sharepoint site list within an organization. Site lists only exist under sites.

**Properties**

| Property Name | Description |
| -- | -- |
| `domainLabel` | The label of the top-level domain category. |
| `title` | The heading title for the component. Defaults to _Select a document library_. |
| `formElement` | Allows the component to function as a `<form>` element; the property value is assigned as the form element `name`. |
| `browseSites` | Flag enabling browsing of sites |
| `browseFollowedSites` | Flag enabling browsing of followed sites |
