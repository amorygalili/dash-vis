
module DashGlobeWrapper
using Dash

const resources_path = realpath(joinpath( @__DIR__, "..", "deps"))
const version = "0.0.1"

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
    relative_package_path = "async-DashGlobeWrapper.js.map",
    external_url = "https://unpkg.com/dash_globe_wrapper@0.0.1/dash_globe_wrapper/async-DashGlobeWrapper.js.map",
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
