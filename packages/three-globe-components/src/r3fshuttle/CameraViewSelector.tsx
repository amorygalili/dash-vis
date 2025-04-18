import React from 'react';

// Camera view options
export type CameraView = 'orbit' | 'shuttle';

interface CameraViewSelectorProps {
  cameraView: CameraView;
  setCameraView: (view: CameraView) => void;
  handleResetCamera: () => void;
}

const CameraViewSelector: React.FC<CameraViewSelectorProps> = ({
  cameraView,
  setCameraView,
  handleResetCamera
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 100,
      background: 'rgba(0,0,0,0.7)',
      padding: '10px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(5px)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
        Camera View
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          backgroundColor: cameraView === 'orbit' ? 'rgba(255,255,255,0.2)' : 'transparent'
        }}>
          <input
            type="radio"
            name="cameraView"
            value="orbit"
            checked={cameraView === 'orbit'}
            onChange={() => setCameraView('orbit')}
            style={{ marginRight: '8px' }}
          />
          <span>🌎 Orbit View</span>
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          backgroundColor: cameraView === 'shuttle' ? 'rgba(255,255,255,0.2)' : 'transparent'
        }}>
          <input
            type="radio"
            name="cameraView"
            value="shuttle"
            checked={cameraView === 'shuttle'}
            onChange={() => setCameraView('shuttle')}
            style={{ marginRight: '8px' }}
          />
          <span>🚀 Shuttle View</span>
        </label>

        {/* Reset camera button */}
        <button
          onClick={handleResetCamera}
          style={{
            marginTop: '8px',
            padding: '6px 10px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
        >
          🔄 Reset Camera
        </button>
      </div>
    </div>
  );
};

export default CameraViewSelector;
