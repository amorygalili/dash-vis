import React from 'react';
import PropTypes from 'prop-types';
import { DashBasicGlobe as RealComponent } from '../LazyLoader';

const DashBasicGlobe = (props) => {
    return (
        <React.Suspense fallback={null}>
            <RealComponent {...props}/>
        </React.Suspense>
    );
};

DashBasicGlobe.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    setProps: PropTypes.func
};

export default DashBasicGlobe;