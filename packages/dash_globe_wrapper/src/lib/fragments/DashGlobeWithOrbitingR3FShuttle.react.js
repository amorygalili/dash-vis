import React from 'react';
import PropTypes from 'prop-types';
import { GlobeWithOrbitingR3FShuttle } from 'three-globe-components';

function DashGlobeWithOrbitingR3FShuttle({ id, width, height, shuttlePath, shuttlePosition, shuttleLookAt, orbitPathPoints }) {
    return (
        <div id={id} style={{ position: 'relative' }}>
            <GlobeWithOrbitingR3FShuttle
                width={width}
                height={height}
                shuttlePath={shuttlePath}
                shuttlePosition={shuttlePosition}
                shuttleLookAt={shuttleLookAt}
                orbitPathPoints={orbitPathPoints}
            />
        </div>
    );
}

DashGlobeWithOrbitingR3FShuttle.defaultProps = {
    width: 500,
    height: 500,
    shuttlePath: "assets/Shuttle Model.glb"
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
