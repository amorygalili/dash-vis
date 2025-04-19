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
        # Create sample orbit path points
        orbit_points = []
        for i in range(100):
            angle = (i / 100) * 2 * np.pi
            lat = 30 * np.sin(angle * 3)  # Vertical oscillation
            lng = (180 * angle / np.pi) % 360
            alt = 0.2  # Altitude above the globe surface
            orbit_points.append({"lat": float(lat), "lng": float(lng), "alt": float(alt)})

        # Initial shuttle position and lookAt vectors
        # These will be updated by the interval callback
        shuttle_position = {"x": 0, "y": 0, "z": 130}
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

    # Parameters for the orbit (same as in the original React component)
    globe_radius = 100
    orbit_radius = globe_radius * 1.5
    orbit_height = globe_radius * 0.5
    vertical_oscillations = 3

    # Calculate position using spherical coordinates with custom orbit
    x = orbit_radius * np.cos(angle)
    z = orbit_radius * np.sin(angle)
    y = orbit_height * np.sin(angle * vertical_oscillations)  # Controlled vertical oscillation

    # Update the position
    shuttle_position = {"x": float(x), "y": float(y), "z": float(z)}

    # Always look at the center of the globe
    shuttle_look_at = {"x": 0, "y": 0, "z": 0}

    return shuttle_position, shuttle_look_at

if __name__ == '__main__':
    app.run(debug=True, port=8051)
