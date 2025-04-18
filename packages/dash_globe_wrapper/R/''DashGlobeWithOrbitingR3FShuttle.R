# AUTO GENERATED FILE - DO NOT EDIT

#' @export
''DashGlobeWithOrbitingR3FShuttle <- function(id=NULL, height=NULL, width=NULL) {
    
    props <- list(id=id, height=height, width=width)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'DashGlobeWithOrbitingR3FShuttle',
        namespace = 'dash_globe_wrapper',
        propNames = c('id', 'height', 'width'),
        package = 'dashGlobeWrapper'
        )

    structure(component, class = c('dash_component', 'list'))
}
