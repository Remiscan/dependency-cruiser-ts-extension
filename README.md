# dependency-cruiser-ts

This VS Code extension uses [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) and [viz-js](https://github.com/mdaines/viz-js) to generate a dependency graph from a JavaScript or TypeScript file.

## Features

- Right-click on a JS or TS file, choose "See dependency graph", and the graph will open in a new VS Code tab.

## Extension Settings

### Dependency cruiser analysis configuration

* `dependency-cruiser-ts.analysis.enableCustomConfiguration`: Looks for a `.dependency-cruiser.json` file at the root of your workspace folder. If one is found, it will overwrite the extension's configuration of `dependency-cruiser`, giving you full control of it. [Learn more abour its syntax in the `dependency-cruiser` documentation](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md).
* `dependency-cruiser-ts.analysis.collapsePattern`: Pattern used to collapse many graph nodes into a single one. [More info in the dependency-cruiser docs](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#summarising-collapsepattern-dot-and-archi-reporters).
* `dependency-cruiser-ts.analysis.tsConfigPattern`: Glob pattern for the file name of the tsconfig file. The extension will look for files matching this pattern in the workspace folder of the analyzed file. If multiple matching files are found, you will be prompted to pick one.

#### Preset rules

Some preset rules are available right in the extension. Enable them with these settings :

* `dependency-cruiser-ts.analysis.rules.noCircular`: Warns you about circular dependencies, by highlighting them on the graph.
* `dependency-cruiser-ts.analysis.rules.noDev`: Warns you about imported dev dependencies in your `src` folder, by highlighting them on the graph.

### Graph visual settings

* `dependency-cruiser-ts.graph.colorScheme`: Enables or disables dark mode.
* `dependency-cruiser-ts.graph.direction`: Direction of the graph (left to right, top to bottom, etc.).
* `dependency-cruiser-ts.graph.lineShapes`: Shape of the lines between nodes (whether straight or curved, whether they avoid other nodes or go though them).
* `dependency-cruiser-ts.graph.theme`: Theme used to draw the graph.