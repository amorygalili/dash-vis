import React from 'react';
import PropTypes from 'prop-types';
import { DashGlobeWrapper as RealComponent } from '../LazyLoader';

const DashGlobeWrapper = (props) => {
    return (
        <React.Suspense fallback={null}>
            <RealComponent {...props}/>
        </React.Suspense>
    );
};

DashGlobeWrapper.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    setProps: PropTypes.func
};

export default DashGlobeWrapper;
