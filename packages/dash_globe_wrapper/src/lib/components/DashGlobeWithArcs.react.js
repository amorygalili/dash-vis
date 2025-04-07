import React from 'react';
import PropTypes from 'prop-types';
import { DashGlobeWithArcs as RealComponent } from '../LazyLoader';

const DashGlobeWithArcs = (props) => {
    return (
        <React.Suspense fallback={null}>
            <RealComponent {...props}/>
        </React.Suspense>
    );
};

DashGlobeWithArcs.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    setProps: PropTypes.func
};

export default DashGlobeWithArcs;