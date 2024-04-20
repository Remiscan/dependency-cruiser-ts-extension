# dependency-cruiser-ts

This VS Code extension uses [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) and [viz-js](https://github.com/mdaines/viz-js) to generate a dependency graph from a JavaScript or TypeScript file.

## Features

- Right-click on a JS or TS file, choose "See dependency graph", and the graph will open in a new VS Code tab.

## Extension Settings

* `dependency-cruiser-ts.analysis.collapsePattern`: Pattern used to collapse many graph nodes into a single one. [More info in the dependency-cruiser docs](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#summarising-collapsepattern-dot-and-archi-reporters).
* `dependency-cruiser-ts.analysis.tsConfigPattern`: Pattern used to auto detect your `tsconfig` or `jsconfig` file.
* `dependency-cruiser-ts.graph.colorScheme`: Enables or disables dark mode.
* `dependency-cruiser-ts.graph.direction`: Direction of the graph (left to right, top to bottom, etc.).
* `dependency-cruiser-ts.graph.lineShapes`: Shape of the lines between nodes (whether straight or curved, whether they avoid other nodes or go though them).
* `dependency-cruiser-ts.graph.theme`: Theme used to draw the graph.