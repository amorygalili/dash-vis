import React from 'react';

export const DashGlobeWrapper = React.lazy(() => import(/* webpackChunkName: "DashGlobeWrapper" */ './fragments/DashGlobeWrapper.react'));
export const DashGlobeWithArcs = React.lazy(() => import(/* webpackChunkName: "DashGlobeWithArcs" */ './fragments/DashGlobeWithArcs.react'));
export const DashGlobeWithAirlineRoutes = React.lazy(() => import(/* webpackChunkName: "DashGlobeWithAirlineRoutes" */ './fragments/DashGlobeWithAirlineRoutes.react'));
export const DashGlobeWithSatellites = React.lazy(() => import(/* webpackChunkName: "DashGlobeWithSatellites" */ './fragments/DashGlobeWithSatellites.react'));
export const DashBasicGlobe = React.lazy(() => import(/* webpackChunkName: "DashBasicGlobe" */ './fragments/DashBasicGlobe.react'));
export const DashGlobeWithOrbitingR3FShuttle = React.lazy(() => import(/* webpackChunkName: "DashGlobeWithOrbitingR3FShuttle" */ './fragments/DashGlobeWithOrbitingR3FShuttle.react'));
