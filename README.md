> ⚠️ This is a WORK IN PROGRESS

# dependency-cruiser-ts

This VS Code extension uses [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) and [viz-js](https://github.com/mdaines/viz-js) to generate a dependency graph from a JavaScript or TypeScript file.

## Features

- Right-click on a JS or TS file, choose "See dependency graph", and the graph will open in a new VS Code tab.

## Extension Settings

* `dependency-cruiser-ts.tsConfigNames`: Set the names of your tsconfig or jsconfig files.
* `dependency-cruiser-ts.graph.reporter`: Set to reporter (dot, ddot, archi)
* `dependency-cruiser-ts.graph.theme`: Set the graph theme (only one available for now)
* `dependency-cruiser-ts.graph.direction`: Set the graph direction (left to right, top to bottom, right to left, bottom to top)
* `dependency-cruiser-ts.graph.collapsePattern`: Set the pattern used to collapse parts of the graph