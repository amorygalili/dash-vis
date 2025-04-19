# AUTO GENERATED FILE - DO NOT EDIT

#' @export
''DashGlobeWithOrbitingR3FShuttle <- function(id=NULL, height=NULL, orbitPathPoints=NULL, shuttleLookAt=NULL, shuttlePath=NULL, shuttlePosition=NULL, width=NULL) {
    
    props <- list(id=id, height=height, orbitPathPoints=orbitPathPoints, shuttleLookAt=shuttleLookAt, shuttlePath=shuttlePath, shuttlePosition=shuttlePosition, width=width)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'DashGlobeWithOrbitingR3FShuttle',
        namespace = 'dash_globe_wrapper',
        propNames = c('id', 'height', 'orbitPathPoints', 'shuttleLookAt', 'shuttlePath', 'shuttlePosition', 'width'),
        package = 'dashGlobeWrapper'
        )

    structure(component, class = c('dash_component', 'list'))
}
