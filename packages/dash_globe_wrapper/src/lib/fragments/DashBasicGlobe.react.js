import React from 'react';
import PropTypes from 'prop-types';
import { MyGlobe } from 'three-globe-components';

function DashBasicGlobe({ id, width, height }) {
    return (
        <div id={id}>
            <MyGlobe width={width} height={height} />
        </div>
    );
}

DashBasicGlobe.defaultProps = {
    width: 500,
    height: 500
};

DashBasicGlobe.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    setProps: PropTypes.func
};

export default DashBasicGlobe;