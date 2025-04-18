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
    setProps: PropTypes.func
};

export default DashGlobeWithOrbitingR3FShuttle;
