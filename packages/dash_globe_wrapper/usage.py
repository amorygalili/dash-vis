import dash_globe_wrapper
from dash import Dash, html, dcc
from dash.dependencies import Input, Output

app = Dash(__name__)

app.layout = html.Div([
    dcc.Dropdown(
        id='globe-selector',
        options=[
            {'label': 'Tiled Globe', 'value': 'tiled'},
            {'label': 'Globe with Arcs', 'value': 'arcs'},
            {'label': 'Basic Globe', 'value': 'basic'},
            {'label': 'Globe with Airline Routes', 'value': 'airlines'},
            {'label': 'Globe with Satellites', 'value': 'satellites'}
        ],
        value='tiled'
    ),
    html.Div(id='globe-container', style={'width': '100%', 'height': '800px'})
])

@app.callback(
    Output('globe-container', 'children'),
    Input('globe-selector', 'value')
)
def update_globe(selected_value):
    if selected_value == 'tiled':
        return dash_globe_wrapper.DashGlobeWrapper(
            id='tiled-globe',
            width=800,
            height=600
        )
    elif selected_value == 'arcs':
        return dash_globe_wrapper.DashGlobeWithArcs(
            id='arcs-globe',
            width=800,
            height=600
        )
    elif selected_value == 'basic':
        return dash_globe_wrapper.DashBasicGlobe(
            id='basic-globe',
            width=800,
            height=600
        )
    elif selected_value == 'airlines':
        return dash_globe_wrapper.DashGlobeWithAirlineRoutes(
            id='airlines-globe',
            width=800,
            height=600
        )
    elif selected_value == 'satellites':
        return dash_globe_wrapper.DashGlobeWithSatellites(
            id='satellites-globe',
            width=800,
            height=600
        )

if __name__ == '__main__':
    app.run(debug=True, port=8051)
