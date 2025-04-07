import React from 'react';
import PropTypes from 'prop-types';
import { TiledGlobe } from 'three-globe-components';

function DashGlobeWrapper({ id, width, height }) {
    return (
        <div id={id}>
            <TiledGlobe width={width} height={height} />
        </div>
    );
}

DashGlobeWrapper.defaultProps = {
    width: 500,
    height: 500
};

DashGlobeWrapper.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Width of the globe in pixels
     */
    width: PropTypes.number,

    /**
     * Height of the globe in pixels
     */
    height: PropTypes.number,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};

export default DashGlobeWrapper;
