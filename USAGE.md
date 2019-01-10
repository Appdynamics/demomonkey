# DemoMonkey - Usage

Read on to learn how you can use DemoMonkey, to tamper your web application to demo almost anything.

## Configurations

DemoMonkey is driven by configuration files you write in the integrated editor. You provide lists of search and replace patterns, that will be applied once DemoMonkey is running. The structure of the file is similar to an **ini** file:

```
search = replace
```

Like ini files the format provides sections and comments to structure your document:

```
; Replace all the cities and countries in our webapp
[Cities]
San Francisco = Berlin
Paris = Rome
[Countries]
USA = Germany
France = Italy
```

Additionally you can use options, commands, imports and variables to achieve even more:

```
; The configuration only works if the url matches the following regex:
@include[] = /^https?://.*demo.*\.myapp\.com(:[0-9]+)?/.*$/
// You can use $customer in replacements as variable
$customer = My Customer//Set The customer className
// Import another configuration called "Cities"
+Cities
// Replace Order with Flight case insensitive
!/Order/i = Flight
```

Note, that **include** or **exclude** is an option that is required for every configuration you create.

Below you will find a list of available options and commands.

## Options

You can use the following options:

- **@include = regex**: The configuration is only available if the url matches the given regex.
- **@exclude** = regex: The configuration doesn't work if the url matches the given regex.
- **@blacklist = tag**: The configuration ignores the given tag.
- **@namespace = ns**: Load commands from a given namespace. Read below to learn more about namespaces
- **@template**: The configuration is only used as template, so no include/exclude is required.
- **@deprecated**: The configuration is deprecated and will not be available.
- **@author = name <email>**: A reserved keyword, you can use to add your name as author to a given configuration.

If you want to use a option multiple time you need to provide it in array notation:

```
@blacklist[] = input
@blacklist[] = textarea
```

## Commands

Outside of namespaces you can always use the following commands:

- **!replace(word, locationFilter)** = replacement: Replace the given word with the replacement if the locationFilter matches
- **!/search/modifier = replacement**: Provide a regular expression to run your replacements.
- **!style(word, property) = replacement**: Change the css property of a node containing word
- **!hide(word, nthParent, cssFilter, hrefFilter, hashFilter)**: Hide a text field and its nth parent elements. You can apply multiple filters.
- **!replaceImage(src) = replacement**: Replace the src attribute of an img tag
- **!overwriteHTML(locationFilter, cssSelector) = replacement**: Overwrite the inner HTML of the first element matching the cssSelector. If no selector is provided the main html can be overwritten. You can filter the application by location (href, hash)
- **!overwritePage(locationFilter, pageTitle) = url**: Overwrite the whole page with a fullscreen iframe that shows url.
- **!replaceLink(url) = newUrl**: Replace the target of a hyperlink with newUrl
- **!replaceNeighbor(word, replacement, nthParent, cssSelector, locationFilter)**: Search for word, walk up the DOM tree to the nth parent and apply a css selector to find a child where the replacement is applied. This is especially useful to replace labels "close by" a text

## Namespaces

Commands specific to a certain web application are provided via a namespace. Currently DemoMonkey only knows the **appdynamics** namespace with the following commands:

- **!replaceFlowmapIcon(label) = replacement**: Replace the type of a tier or backend on the flowmap.
- **!hideApplication(label)**: Hide the given application.
- **!hideBusinessTransaction(label)**: Hide the given business transaction.
- **!hideDatabase(label)**: Hide the given database
- **!hideBrowserApplication(label)**: Hide the given browser application for EUM
- **!hideMobileApplication(label)**: Hide the given mobile application for EUM
- **!hideBusinessJourney(label)**: Hide the given business journey
- **!hideAnalyticsSearch(label)**: Hide the given analytics search
- **!hideRemoteService(label)**: Hide the given remote service in the list view
- **!replaceFlowmapConnection(label1, label2, force) = replacement**: Replace the color between two elements on the flowmap. Possible values for **replacement** are Warning, Critical, Unknown and Normal. Set the force option to replace the label even if no baseline is shown.
- **!replaceMobileScreenshot(view) = replacement**: Replace a screenshot taken during a mobile session for the given view.
- **!replaceNodeCount(nodeName) = replacement**: Replace the node count on the flowmap for the node with name nodeName
- **!recolorDashboard(oldColor, dashboardId) = newColor**: Replace the oldColor with newColor on a dashboard. If provided, only if dashboardId matches.
- **!setDashboardBackground(dasboardID) = background**: Change the background of a dasbhoard. You can provide an image url or a color. If provided, the background is only replaced if the dasbhoardId matches.
- **!delayLink(url) = seconds**: Delay a link by the given number of seconds

## Variables

To make a configuration much more reusable you can introduce variables with a default value and a description:

```
$variable = default//description
```

This is especially useful if you want to have an interchangeable company or domain name.

Variables are also helpful if you'd like use HTML in your replacements, especially for **!overwriteHTML**.
