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

- **!/search/modifier = replacement**: Provide a regular expression to run your replacements.
- **!style(word, property) = replacement**: Change the css property of a node containing word
- **!hide(word, nthParent, cssFilter, hrefFilter, hashFilter)**: Hide a text field and its nth parent elements. You can apply multiple filters.
- **!replaceImage(src) = replacement**: Replace the src attribute of an img tag
- **!overwriteHTML(locationFilter, cssSelector) = replacement**: Overwrite the inner HTML of the first element matching the cssSelector. If no selector is provided the main html can be overwritten. You can filter the application by location (href, hash)

## Namespaces

Commands specific to a certain webapplication are provided via a namespace. Currently DemoMonkey only knows the **appdynamics** namespace with the following commands:

- **replaceFlowmapIcon(label) = replacement**: Replace the type of a tier or backend on the flowmap.
- **hideApplication(label)**: Hide the given application.
- **hideBusinessTransaction(label)**: Hide the given business transaction.
- **hideDatabase(label)**: Hide the given database
- **hideBrowserApplication(label)**: The the given browser application for EUM
- **replaceFlowmapConnection(label1, label2) = replacement**: Replace the color between two elements on the flowmap. Possible values for **replacement** are Warning, Critical, Unknown and Normal
