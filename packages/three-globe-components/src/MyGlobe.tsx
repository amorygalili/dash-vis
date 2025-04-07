import Globe from 'react-globe.gl';

interface Props {
  width: number;
  height: number;
}

function MyGlobe({ width, height }: Props) {
  return <Globe width={width} height={height} />;
}

export default MyGlobe;
