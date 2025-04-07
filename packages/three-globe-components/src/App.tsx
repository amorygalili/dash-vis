import { useState } from 'react';
import GlobeWithAirlineRoutes from './GlobeWithAirlineRoutes';
import GlobeWithArcs from './GlobeWithArcs';
import GlobeWithSatellites from './GlobeWithSatellites';
import MyGlobe from './MyGlobe';
import TiledGlobe from './TiledGlobe';
import { useResizeDetector } from 'react-resize-detector';

type GlobeType = 'tiled' | 'arcs' | 'basic' | 'airlines' | 'satellites';

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
        </select>
      </div>
      <div ref={ref} style={{ flex: 1, minHeight: 0 }}>
        {renderGlobe()}
      </div>
    </div>
  );
}

export default App;

