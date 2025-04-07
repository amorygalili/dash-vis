import React from 'react';
import PropTypes from 'prop-types';
import { GlobeWithAirlineRoutes } from 'three-globe-components';

function DashGlobeWithAirlineRoutes({ id, width, height }) {
    return (
        <div id={id}>
            <GlobeWithAirlineRoutes width={width} height={height} />
        </div>
    );
}

DashGlobeWithAirlineRoutes.defaultProps = {
    width: 500,
    height: 500
};

DashGlobeWithAirlineRoutes.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    setProps: PropTypes.func
};

export default DashGlobeWithAirlineRoutes;