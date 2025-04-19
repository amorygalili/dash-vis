import dash_globe_wrapper
from dash import Dash, html, dcc
from dash.dependencies import Input, Output, State
import numpy as np
import time
from datetime import datetime
import json

app = Dash(__name__)

app.layout = html.Div([
    dcc.Dropdown(
        id='globe-selector',
        options=[
            {'label': 'Tiled Globe', 'value': 'tiled'},
            {'label': 'Globe with Arcs', 'value': 'arcs'},
            {'label': 'Basic Globe', 'value': 'basic'},
            {'label': 'Globe with Airline Routes', 'value': 'airlines'},
            {'label': 'Globe with Satellites', 'value': 'satellites'},
            {'label': 'Globe with Orbiting R3F Shuttle', 'value': 'shuttle'}
        ],
        value='tiled'
    ),
    html.Div(id='globe-container', style={'width': '100%', 'height': '800px'}),

    # Hidden div to store the current angle for the shuttle animation
    html.Div(id='shuttle-angle-store', style={'display': 'none'}, children='0'),

    # Interval component for updating the shuttle position
    dcc.Interval(
        id='shuttle-update-interval',
        interval=50,  # in milliseconds (20 fps)
        n_intervals=0,
        disabled=True
    )
])

@app.callback(
    [Output('globe-container', 'children'),
     Output('shuttle-update-interval', 'disabled')],
    Input('globe-selector', 'value')
)
def update_globe(selected_value):
    if selected_value == 'tiled':
        return dash_globe_wrapper.DashGlobeWrapper(
            id='tiled-globe',
            width=800,
            height=600
        ), True  # Disable interval
    elif selected_value == 'arcs':
        return dash_globe_wrapper.DashGlobeWithArcs(
            id='arcs-globe',
            width=800,
            height=600
        ), True  # Disable interval
    elif selected_value == 'basic':
        return dash_globe_wrapper.DashBasicGlobe(
            id='basic-globe',
            width=800,
            height=600
        ), True  # Disable interval
    elif selected_value == 'airlines':
        return dash_globe_wrapper.DashGlobeWithAirlineRoutes(
            id='airlines-globe',
            width=800,
            height=600
        ), True  # Disable interval
    elif selected_value == 'satellites':
        return dash_globe_wrapper.DashGlobeWithSatellites(
            id='satellites-globe',
            width=800,
            height=600
        ), True  # Disable interval
    elif selected_value == 'shuttle':
        # For the shuttle component, we can customize various properties
        # Create orbit path points using the same calculation as the original React component
        globe_radius = 100
        orbit_radius = globe_radius * 1.5  # Larger orbit than default
        orbit_height = globe_radius * 0.5  # Higher orbit than default
        vertical_oscillations = 3  # Number of vertical oscillations per orbit

        orbit_points = []
        num_points = 100

        for i in range(num_points):
            a = (i / num_points) * 2 * np.pi

            # Calculate position using spherical coordinates with custom orbit
            x = orbit_radius * np.cos(a)
            z = orbit_radius * np.sin(a)
            y = orbit_height * np.sin(a * vertical_oscillations)  # Controlled vertical oscillation

            # Convert cartesian to spherical coordinates
            r = np.sqrt(x*x + y*y + z*z)
            lat = np.arcsin(y / r) * 180 / np.pi
            lng = np.arctan2(z, x) * 180 / np.pi

            orbit_points.append({
                "lat": float(lat),
                "lng": float(lng),
                "alt": float((r - globe_radius) / globe_radius)
            })

        # Initial shuttle position and lookAt vectors
        # These will be updated by the interval callback
        # Start at the first point of the orbit path
        initial_x = orbit_radius * np.cos(0)
        initial_z = orbit_radius * np.sin(0)
        initial_y = orbit_height * np.sin(0)  # At angle 0, this will be 0

        shuttle_position = {"x": float(initial_x), "y": float(initial_y), "z": float(initial_z)}
        shuttle_look_at = {"x": 0, "y": 0, "z": 0}

        return dash_globe_wrapper.DashGlobeWithOrbitingR3FShuttle(
            id='shuttle-globe',
            width=800,
            height=600,
            shuttlePath="assets/Shuttle Model.glb",
            shuttlePosition=shuttle_position,
            shuttleLookAt=shuttle_look_at,
            orbitPathPoints=orbit_points
        ), False  # Enable the interval for shuttle updates

# Callback to update the shuttle angle
@app.callback(
    Output('shuttle-angle-store', 'children'),
    Input('shuttle-update-interval', 'n_intervals'),
    State('shuttle-angle-store', 'children')
)
def update_shuttle_angle(n_intervals, current_angle):
    if n_intervals is None:
        return '0'

    # Convert current angle to float and increment it
    angle = float(current_angle)
    angle = (angle + 0.005) % (2 * np.pi)  # Same increment as in the React component

    return str(angle)

# Callback to update the shuttle position and lookAt
@app.callback(
    [Output('shuttle-globe', 'shuttlePosition'),
     Output('shuttle-globe', 'shuttleLookAt')],
    Input('shuttle-angle-store', 'children'),
    prevent_initial_call=True
)
def update_shuttle_position(angle_str):
    angle = float(angle_str)

    # Parameters for the orbit (same as in the original React component and orbit path calculation)
    globe_radius = 100
    orbit_radius = globe_radius * 1.5  # Larger orbit than default
    orbit_height = globe_radius * 0.5  # Higher orbit than default
    vertical_oscillations = 3  # Number of vertical oscillations per orbit

    # Calculate position using spherical coordinates with custom orbit
    # This must match exactly the calculation used for the orbit path points
    x = orbit_radius * np.cos(angle)
    z = orbit_radius * np.sin(angle)
    y = orbit_height * np.sin(angle * vertical_oscillations)  # Controlled vertical oscillation

    # Update the position - using the exact same coordinate system as the orbit path
    shuttle_position = {"x": float(x), "y": float(y), "z": float(z)}

    # Always look at the center of the globe
    shuttle_look_at = {"x": 0, "y": 0, "z": 0}

    return shuttle_position, shuttle_look_at

if __name__ == '__main__':
    app.run(debug=True, port=8051)
