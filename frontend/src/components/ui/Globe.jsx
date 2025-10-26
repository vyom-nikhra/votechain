import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export const Globe = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // Major voting cities worldwide
        { location: [37.7595, -122.4367], size: 0.05 }, // San Francisco
        { location: [40.7128, -74.006], size: 0.08 }, // New York
        { location: [51.5074, -0.1278], size: 0.06 }, // London
        { location: [35.6762, 139.6503], size: 0.06 }, // Tokyo
        { location: [48.8566, 2.3522], size: 0.05 }, // Paris
        { location: [28.6139, 77.209], size: 0.07 }, // Delhi
        { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
        { location: [1.3521, 103.8198], size: 0.04 }, // Singapore
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: '100%', aspectRatio: 1 }}
      className={className}
    />
  );
};
