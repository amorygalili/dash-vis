
module DashGlobeWrapper
using Dash

const resources_path = realpath(joinpath( @__DIR__, "..", "deps"))
const version = "0.0.1"

include("jl/''_dashbasicglobe.jl")
include("jl/''_dashglobewithairlineroutes.jl")
include("jl/''_dashglobewitharcs.jl")
include("jl/''_dashglobewithsatellites.jl")
include("jl/''_dashglobewrapper.jl")

function __init__()
    DashBase.register_package(
        DashBase.ResourcePkg(
            "dash_globe_wrapper",
            resources_path,
            version = version,
            [
                DashBase.Resource(
    relative_package_path = "async-DashGlobeWrapper.js",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashGlobeWrapper.js",
    dynamic = nothing,
    async = :true,
    type = :js
),
DashBase.Resource(
    relative_package_path = "async-DashBasicGlobe.js",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashBasicGlobe.js",
    dynamic = nothing,
    async = :true,
    type = :js
),
DashBase.Resource(
    relative_package_path = "async-DashGlobeWithArcs.js",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashGlobeWithArcs.js",
    dynamic = nothing,
    async = :true,
    type = :js
),
DashBase.Resource(
    relative_package_path = "async-DashGlobeWithAirlineRoutes.js",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashGlobeWithAirlineRoutes.js",
    dynamic = nothing,
    async = :true,
    type = :js
),
DashBase.Resource(
    relative_package_path = "async-DashGlobeWithSatellites.js",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashGlobeWithSatellites.js",
    dynamic = nothing,
    async = :true,
    type = :js
),
DashBase.Resource(
    relative_package_path = "async-DashGlobeWrapper.js.map",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashGlobeWrapper.js.map",
    dynamic = true,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "async-DashBasicGlobe.js.map",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashBasicGlobe.js.map",
    dynamic = true,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "async-DashGlobeWithArcs.js.map",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashGlobeWithArcs.js.map",
    dynamic = true,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "async-DashGlobeWithAirlineRoutes.js.map",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashGlobeWithAirlineRoutes.js.map",
    dynamic = true,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "async-DashGlobeWithSatellites.js.map",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashGlobeWithSatellites.js.map",
    dynamic = true,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "dash_globe_wrapper.min.js",
    external_url = nothing,
    dynamic = nothing,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "dash_globe_wrapper.min.js.map",
    external_url = nothing,
    dynamic = true,
    async = nothing,
    type = :js
)
            ]
        )

    )
end
end
