import React from 'react';
import PropTypes from 'prop-types';
import { GlobeWithArcs } from 'three-globe-components';

function DashGlobeWithArcs({ id, width, height }) {
    return (
        <div id={id}>
            <GlobeWithArcs width={width} height={height} />
        </div>
    );
}

DashGlobeWithArcs.defaultProps = {
    width: 500,
    height: 500
};

DashGlobeWithArcs.propTypes = {
    id: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    setProps: PropTypes.func
};

export default DashGlobeWithArcs;