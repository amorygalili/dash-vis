import React from 'react';
import PropTypes from 'prop-types';
import { DashGlobeWithOrbitingR3FShuttle as RealComponent } from '../LazyLoader';

const DashGlobeWithOrbitingR3FShuttle = (props) => {
    return (
        <React.Suspense fallback={null}>
            <RealComponent {...props}/>
        </React.Suspense>
    );
};

DashGlobeWithOrbitingR3FShuttle.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    shuttlePath: PropTypes.string,
    shuttlePosition: PropTypes.object,
    shuttleLookAt: PropTypes.object,
    orbitPathPoints: PropTypes.array,
    setProps: PropTypes.func
};

export default DashGlobeWithOrbitingR3FShuttle;
