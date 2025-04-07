import React from 'react';
import PropTypes from 'prop-types';
import { GlobeWithSatellites } from 'three-globe-components';

function DashGlobeWithSatellites({ id, width, height }) {
    return (
        <div id={id}>
            <GlobeWithSatellites width={width} height={height} />
        </div>
    );
}

DashGlobeWithSatellites.defaultProps = {
    width: 500,
    height: 500
};

DashGlobeWithSatellites.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    setProps: PropTypes.func
};

export default DashGlobeWithSatellites;