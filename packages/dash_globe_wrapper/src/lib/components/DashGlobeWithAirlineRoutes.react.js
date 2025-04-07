import React from 'react';
import PropTypes from 'prop-types';
import { DashGlobeWithAirlineRoutes as RealComponent } from '../LazyLoader';

const DashGlobeWithAirlineRoutes = (props) => {
    return (
        <React.Suspense fallback={null}>
            <RealComponent {...props}/>
        </React.Suspense>
    );
};

DashGlobeWithAirlineRoutes.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    setProps: PropTypes.func
};

export default DashGlobeWithAirlineRoutes;