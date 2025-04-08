# dash-vis

A monorepo containing React Three.js globe visualization components and their Dash wrappers.

## Project Structure

- `packages/three-globe-components`: React components built with Three.js
- `packages/dash_globe_wrapper`: Dash wrapper components for the Three.js globe visualizations

## Prerequisites

- Node.js (>=8.11.0)
- pnpm (for workspace management)
- Python (>=3.7)
- virtualenv (recommended)

## Installation

1. Install pnpm if you haven't already:
```bash
npm install -g pnpm
```

2. Install node dependencies:
```bash
pnpm install
```

3. For the Dash wrapper, create and activate a virtual environment:
```bash
cd packages/dash_globe_wrapper
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Development

### Three Globe Components

The `three-globe-components` package contains React components built with Three.js.

1. Run development server:
```bash
cd packages/three-globe-components
pnpm dev
```

2. Visit http://localhost:5173 to view the components

3. Build the library:
```bash
pnpm build
```

Available components:
- `TiledGlobe`
- `GlobeWithAirlineRoutes`
- `GlobeWithArcs`
- `GlobeWithSatellites`
- `MyGlobe`

### Dash Globe Wrapper

The `dash_globe_wrapper` package wraps the Three.js components for use in Dash applications.

1. Build the components:
```bash
cd packages/dash_globe_wrapper
pnpm build
```

2. Run the demo app:
```bash
python usage.py
```

3. Visit http://localhost:8050 to view the demo

## Creating New Dash Wrappers

To create a new wrapper for a Three.js globe component:

1. Create a new React component in `packages/dash_globe_wrapper/src/lib/components/`
2. Import the desired component from `three-globe-components`
3. Create the wrapper following this template:

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { YourThreeComponent } from 'three-globe-components';

const DashYourComponent = (props) => {
    return (
        <React.Suspense fallback={null}>
            <YourThreeComponent {...props}/>
        </React.Suspense>
    );
};

DashYourComponent.defaultProps = {
    // Define default props
};

DashYourComponent.propTypes = {
    // Define prop types
    id: PropTypes.string,
    // ... other props
};

export default DashYourComponent;
```

4. Add the component to the exports in `packages/dash_globe_wrapper/src/lib/index.js`
5. Add the component name to the `async_resources` array in `packages/dash_globe_wrapper/dash_globe_wrapper/__init__.py`:
```python
async_resources = [
    "DashGlobeWrapper",
    "DashBasicGlobe",
    # ... other components
    "YourNewComponent"  # Add your new component here
]
```
6. Rebuild the package using `pnpm build`

## Usage in Dash Applications

After installing the package, you can use the components in your Dash app:

```python
import dash
from dash import html
from dash_globe_wrapper import DashGlobeWrapper

app = dash.Dash(__name__)

app.layout = html.Div([
    DashGlobeWrapper(
        id='my-globe',
        # ... other props
    )
])

if __name__ == '__main__':
    app.run_server(debug=True)
```
