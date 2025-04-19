# AUTO GENERATED FILE - DO NOT EDIT

export ''_dashglobewithorbitingr3fshuttle

"""
    ''_dashglobewithorbitingr3fshuttle(;kwargs...)

A DashGlobeWithOrbitingR3FShuttle component.

Keyword arguments:
- `id` (String; optional)
- `height` (Real; optional)
- `orbitPathPoints` (Array; optional)
- `shuttleLookAt` (Dict; optional)
- `shuttlePath` (String; optional)
- `shuttlePosition` (Dict; optional)
- `width` (Real; optional)
"""
function ''_dashglobewithorbitingr3fshuttle(; kwargs...)
        available_props = Symbol[:id, :height, :orbitPathPoints, :shuttleLookAt, :shuttlePath, :shuttlePosition, :width]
        wild_props = Symbol[]
        return Component("''_dashglobewithorbitingr3fshuttle", "DashGlobeWithOrbitingR3FShuttle", "dash_globe_wrapper", available_props, wild_props; kwargs...)
end

