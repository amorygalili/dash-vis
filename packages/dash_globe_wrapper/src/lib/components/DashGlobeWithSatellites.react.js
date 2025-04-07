import React from 'react';
import PropTypes from 'prop-types';
import { DashGlobeWithSatellites as RealComponent } from '../LazyLoader';

const DashGlobeWithSatellites = (props) => {
    return (
        <React.Suspense fallback={null}>
            <RealComponent {...props}/>
        </React.Suspense>
    );
};

DashGlobeWithSatellites.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    setProps: PropTypes.func
};

export default DashGlobeWithSatellites;