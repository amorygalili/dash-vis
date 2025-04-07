import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

interface Props {
  width: number;
  height: number;
}

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string[];
}

const GlobeWithArcs = ({ width, height }: Props) => {
  const globeRef = useRef<any>(undefined);
  const [arcsData, setArcsData] = useState<ArcData[]>([]);

  useEffect(() => {
    // Generate random arcs data
    const N = 20;
    const gData = [...Array(N).keys()].map(() => ({
      startLat: (Math.random() - 0.5) * 180,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 180,
      endLng: (Math.random() - 0.5) * 360,
      color: [
        ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)],
        ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
      ]
    }));
    setArcsData(gData);
  }, []);

  return (
    <Globe
      width={width}
      height={height}
      ref={globeRef}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
      arcsData={arcsData}
      arcColor={'color'}
      arcDashLength={() => Math.random()}
      arcDashGap={() => Math.random()}
      arcDashAnimateTime={() => Math.random() * 4000 + 500}
    />
  );
};

export default GlobeWithArcs;