import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { csvParseRows } from 'd3-dsv';

const COUNTRY = 'United States';
const OPACITY = 0.22;

interface Props {
  width: number;
  height: number;
}

interface Airport {
  airportId: string;
  name: string;
  city: string;
  country: string;
  iata: string;
  icao: string;
  lat: number;
  lng: number;
  alt: string;
  timezone: string;
  dst: string;
  tz: string;
  type: string;
  source: string;
}

interface Route {
  airline: string;
  airlineId: string;
  srcIata: string;
  srcAirportId: string;
  dstIata: string;
  dstAirportId: string;
  codeshare: string;
  stops: string;
  equipment: string;
  srcAirport: Airport;
  dstAirport: Airport;
}

const GlobeWithAirlineRoutes = ({ width, height }: Props) => {
  const globeRef = useRef<any>(undefined);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    // Load data
    Promise.all([
      fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat')
        .then((res) => res.text())
        .then((d) =>
          csvParseRows(d, ([
            airportId,
            name,
            city,
            country,
            iata,
            icao,
            lat,
            lng,
            alt,
            timezone,
            dst,
            tz,
            type,
            source,
          ]) => ({
            airportId,
            name,
            city,
            country,
            iata,
            icao,
            lat: Number(lat),
            lng: Number(lng),
            alt,
            timezone,
            dst,
            tz,
            type,
            source,
          }))
        ),
      fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat')
        .then((res) => res.text())
        .then((d) =>
          csvParseRows(d, ([
            airline,
            airlineId,
            srcIata,
            srcAirportId,
            dstIata,
            dstAirportId,
            codeshare,
            stops,
            equipment,
          ]) => ({
            airline,
            airlineId,
            srcIata,
            srcAirportId,
            dstIata,
            dstAirportId,
            codeshare,
            stops,
            equipment,
          }))
        ),
    ]).then(([airports, routes]) => {
      const byIata = Object.fromEntries(airports.map((airport) => [airport.iata, airport]));
      const filteredRoutes = routes
        .filter((d) => byIata[d.srcIata] && byIata[d.dstIata]) // Exclude unknown airports
        .filter((d) => d.stops === '0') // Non-stop flights only
        .map((d) => ({
          ...d,
          srcAirport: byIata[d.srcIata],
          dstAirport: byIata[d.dstIata],
        }))
        .filter(
          (d) => d.srcAirport.country === COUNTRY && d.dstAirport.country !== COUNTRY
        ); // International routes from country

      setAirports(airports);
      setRoutes(filteredRoutes);
    });
  }, []);

  useEffect(() => {
    // Aim at continental US centroid
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 });
    }
  }, []);

  return (
    <Globe
      width={width}
      height={height}
      ref={globeRef}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
      arcsData={routes}
      arcLabel={((d: Route) => `${d.airline}: ${d.srcIata} → ${d.dstIata}`) as any}
      arcStartLat={((d: Route) => +d.srcAirport.lat) as any}
      arcStartLng={((d: Route) => +d.srcAirport.lng) as any}
      arcEndLat={((d: Route) => +d.dstAirport.lat) as any}
      arcEndLng={((d: Route) => +d.dstAirport.lng) as any}
      arcDashLength={0.25}
      arcDashGap={1}
      arcDashInitialGap={() => Math.random()}
      arcDashAnimateTime={4000}
      arcColor={() => [`rgba(0, 255, 0, ${OPACITY})`, `rgba(255, 0, 0, ${OPACITY})`]}
      arcsTransitionDuration={0}
      pointsData={airports}
      pointColor={() => 'orange'}
      pointAltitude={0}
      pointRadius={0.02}
      pointsMerge
    />
  );
};

export default GlobeWithAirlineRoutes;
