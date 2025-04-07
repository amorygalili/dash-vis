import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as satellite from 'satellite.js';

interface Props {
  width: number;
  height: number;
}

const EARTH_RADIUS_KM = 6371; // km
const TIME_STEP = 3 * 1000; // per frame

interface SatelliteData {
  satrec: satellite.SatRec;
  name: string;
  lat?: number;
  lng?: number;
  alt?: number;
}

satellite

const GlobeWithSatellites = ({ width, height }: Props) => {
  const globeRef = useRef<any>(undefined);
  const [satData, setSatData] = useState<SatelliteData[]>([]);
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    // Time ticker
    const interval = setInterval(() => {
      setTime((prevTime) => new Date(+prevTime + TIME_STEP));
    }, TIME_STEP / 60); // Update at 60 FPS
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load satellite data
    fetch('https://unpkg.com/globe.gl/example/datasets/space-track-leo.txt')
      .then((res) => res.text())
      .then((rawData) => {
        const tleData = rawData
          .replace(/\r/g, '')
          .split(/\n(?=[^12])/)
          .filter(Boolean)
          .map((tle) => tle.split('\n'));

        const satData = tleData
          .map(([name, ...tle]) => ({
            satrec: satellite.twoline2satrec(tle[0], tle[1]),
            name: name.trim().replace(/^0 /, ''),
          }))
          // Exclude those that can't be propagated
          .filter((d) => !!satellite.propagate(d.satrec, new Date()).position);

        setSatData(satData);
      });
  }, []);

  const particlesData = useMemo(() => {
    if (!satData.length) return [];

    // Update satellite positions
    const gmst = satellite.gstime(time);
    return satData
      .map((d) => {
        const eci = satellite.propagate(d.satrec, time);
        if (eci.position) {
          const gdPos = satellite.eciToGeodetic(eci.position as any, gmst);
          const lat = (satellite as any).radiansToDegrees(gdPos.latitude);
          const lng = (satellite as any).radiansToDegrees(gdPos.longitude);
          const alt = gdPos.height / EARTH_RADIUS_KM;
          return { ...d, lat, lng, alt };
        }
        return null;
      })
      .filter((d) => d && !isNaN(d.lat!) && !isNaN(d.lng!) && !isNaN(d.alt!));
  }, [satData, time]);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ altitude: 3.5 });
    }
  }, []);

  return (
    <div>
      <Globe
        width={width}
        height={height}
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        particlesData={particlesData as object[]}
        particleLabel={((d: SatelliteData) => d.name) as any}
        particleLat={((d: SatelliteData) => d.lat!) as any}
        particleLng={((d: SatelliteData) => d.lng!) as any}
        particleAltitude={((d: SatelliteData) => d.alt!) as any}
        particlesColor={useCallback(() => 'palegreen', [])}
      />
      <div
        style={{
          position: 'absolute',
          fontSize: '12px',
          fontFamily: 'sans-serif',
          padding: '5px',
          borderRadius: '3px',
          backgroundColor: 'rgba(200, 200, 200, 0.1)',
          color: 'lavender',
          bottom: '10px',
          right: '10px',
        }}
      >
        {time.toString()}
      </div>
    </div>
  );
};

export default GlobeWithSatellites;
