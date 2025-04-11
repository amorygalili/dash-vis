import { useState } from 'react';
import GlobeWithAirlineRoutes from './GlobeWithAirlineRoutes';
import GlobeWithArcs from './GlobeWithArcs';
import GlobeWithSatellites from './GlobeWithSatellites';
import MyGlobe from './MyGlobe';
import TiledGlobe from './TiledGlobe';
import { GlbModelLoader } from './GlbModelLoader';
import GlobeWithOrbitingShuttle from './GlobeWithOrbitingShuttle';
import GlobeWithOrbitingGlbShuttle from './GlobeWithOrbitingGlbShuttle';
import { useResizeDetector } from 'react-resize-detector';
import { useGLTF } from "@react-three/drei";


type GlobeType = 'tiled' | 'arcs' | 'basic' | 'airlines' | 'satellites' | 'glbmodel' | 'orbitingshuttle' | 'orbitingglbshuttle';

function App() {
  const { width, height, ref } = useResizeDetector();
  const [selectedGlobe, setSelectedGlobe] = useState<GlobeType>('tiled');

  const renderGlobe = () => {
    switch (selectedGlobe) {
      case 'tiled':
        return <TiledGlobe width={width || 0} height={height || 0} />;
      case 'arcs':
        return <GlobeWithArcs width={width || 0} height={height || 0} />;
      case 'basic':
        return <MyGlobe width={width || 0} height={height || 0} />;
      case 'airlines':
        return <GlobeWithAirlineRoutes width={width || 0} height={height || 0} />;
      case 'satellites':
        return <GlobeWithSatellites width={width || 0} height={height || 0} />;
      case 'glbmodel':
        return <div style={{ width: `${width || 0}px`, height: `${height || 0}px` }}>
          <GlbModelLoader path="/Shuttle Model.glb" />
        </div>;
      case 'orbitingshuttle':
        return <GlobeWithOrbitingShuttle width={width || 0} height={height || 0} />;
      case 'orbitingglbshuttle':
        return <GlobeWithOrbitingGlbShuttle width={width || 0} height={height || 0} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px' }}>
        <select
          value={selectedGlobe}
          onChange={(e) => setSelectedGlobe(e.target.value as GlobeType)}
          style={{
            padding: '8px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="tiled">Tiled Globe</option>
          <option value="arcs">Globe with Arcs</option>
          <option value="basic">Basic Globe</option>
          <option value="airlines">Globe with Airline Routes</option>
          <option value="satellites">Globe with Satellites</option>
          <option value="glbmodel">GLB Model Loader</option>
          <option value="orbitingshuttle">Orbiting Shuttle</option>
          <option value="orbitingglbshuttle">Orbiting GLB Shuttle</option>
        </select>
      </div>
      <div ref={ref} style={{ flex: 1, minHeight: 0 }}>
        {renderGlobe()}
      </div>
    </div>
  );
}

useGLTF.preload('/Shuttle Model.glb');



export default App;

