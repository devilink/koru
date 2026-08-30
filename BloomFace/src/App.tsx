import React, { useState, useEffect, useRef } from 'react';
import { FaceRenderer } from './components/FaceRenderer';
import { initialFaceState, FaceState } from './state/FaceState';
import { AnimationController } from './animation/AnimationController';

import { CameraManager } from './phone/CameraManager';
import { MicrophoneManager } from './phone/MicrophoneManager';
import { TouchManager } from './phone/TouchManager';
import { OrientationManager } from './phone/OrientationManager';
import { RobotConnection, ConnectionState } from './communication/RobotConnection';
import { RobotMessage } from './communication/Protocol';

// Singleton Managers
const cameraManager = new CameraManager();
const micManager = new MicrophoneManager();
const touchManager = new TouchManager();
const orientationManager = new OrientationManager();
const robotConnection = new RobotConnection();

export const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Debug UI State
  const [showDebug, setShowDebug] = useState(true);
  const [cameraPreviewEnabled, setCameraPreviewEnabled] = useState(false);
  const [espIp, setEspIp] = useState('192.168.1.100');
  
  const [hardwareStatus, setHardwareStatus] = useState({
    camera: 'PENDING',
    mic: 'PENDING',
    touch: 'OFF',
    orientation: 'PENDING',
    robot: 'DISCONNECTED' as ConnectionState,
    latency: 0,
    lastMessage: 'NONE',
    heartbeat: 'OK'
  });

  const controllerRef = useRef<AnimationController | null>(null);
  const cameraContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Reference to hold transient stats so interval can pick them up
  const statsRef = useRef({ latency: 0, lastMessage: 'NONE', lastPongTime: Date.now() });

  useEffect(() => {
    controllerRef.current = new AnimationController((newState) => {
      // Intentionally left empty. State updates are now handled locally in FaceRenderer.
    });

    // Listen to robot messages for stats
    const unsubMsg = robotConnection.onMessage((msg: RobotMessage) => {
      statsRef.current.lastMessage = msg.type;
      if (msg.type === 'PONG') {
        statsRef.current.latency = Date.now() - msg.timestamp;
        statsRef.current.lastPongTime = Date.now();
      }
    });

    const unsubState = robotConnection.onStateChange((state) => {
      // Immediate update for state changes
      setHardwareStatus(prev => ({ ...prev, robot: state }));
    });

    // Setup polling for debug UI
    const interval = setInterval(() => {
      if (isInitialized) {
        const isConnected = robotConnection.getState() === 'CONNECTED';
        const msSincePong = Date.now() - statsRef.current.lastPongTime;
        const hbStatus = isConnected && msSincePong > 6000 ? 'TIMEOUT' : 'OK';

        setHardwareStatus({
          camera: cameraManager.getPermissionState(),
          mic: micManager.getPermissionState(),
          touch: touchManager.getStatus() === 'READY' ? `READY (${touchManager.getLastAction()})` : 'OFF',
          orientation: orientationManager.getPermissionState(),
          robot: robotConnection.getState(),
          latency: statsRef.current.latency,
          lastMessage: statsRef.current.lastMessage,
          heartbeat: hbStatus
        });
      }
    }, 500);

    return () => {
      clearInterval(interval);
      unsubMsg();
      unsubState();
      if (controllerRef.current) controllerRef.current.dispose();
      cameraManager.stop();
      micManager.stop();
      touchManager.stop();
      orientationManager.stop();
      robotConnection.disconnect();
    };
  }, [isInitialized]);

  // Handle camera preview toggle
  useEffect(() => {
    if (cameraPreviewEnabled && cameraContainerRef.current) {
      cameraManager.toggleDebugPreview(cameraContainerRef.current);
    } else {
      cameraManager.toggleDebugPreview(null);
    }
  }, [cameraPreviewEnabled, isInitialized]);

  const handleInitialize = async () => {
    console.log('[App] Requesting hardware permissions...');
    
    // Request permissions concurrently (ignore failures so face still works)
    await Promise.allSettled([
      cameraManager.requestPermissionAndStart(),
      micManager.requestPermissionAndStart(),
      orientationManager.requestPermissionAndStart()
    ]);

    // Start touch tracking
    touchManager.start({
      onTap: () => console.log('[Touch] Tap detected'),
      onLongPress: () => {
        console.log('[Touch] Long press detected -> Triggering Extreme Cute');
        controllerRef.current?.playExtremeCute();
      },
      onSwipe: (dir) => console.log(`[Touch] Swipe detected: ${dir}`)
    });

    // Start the face idle animation
    controllerRef.current?.startIdle();
    setIsInitialized(true);
  };

  const handleConnectRobot = () => {
    robotConnection.connect(`ws://${espIp}:81`);
  };

  const handleDisconnectRobot = () => {
    robotConnection.disconnect();
  };

  const handlePing = () => {
    robotConnection.send({ type: 'PING', timestamp: Date.now() });
  };

  const handleCommand = () => {
    robotConnection.send({ type: 'COMMAND', command: 'TEST' });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
      
      {!isInitialized && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#000', zIndex: 100, display: 'flex',
          flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          color: 'white', fontFamily: 'sans-serif'
        }}>
          <h1 style={{ marginBottom: '20px', letterSpacing: '2px' }}>KORU OS</h1>
          <button 
            onClick={handleInitialize}
            style={{
              padding: '16px 32px', fontSize: '18px', borderRadius: '30px',
              border: '2px solid white', background: 'transparent', color: 'white',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px'
            }}
          >
            Initialize Robot
          </button>
          <p style={{ marginTop: '20px', color: '#666', fontSize: '12px' }}>
            Requires Camera & Microphone permissions
          </p>
        </div>
      )}

      {isInitialized && <FaceRenderer controllerRef={controllerRef} />}
      
      {/* Dev UI overlay */}
      {isInitialized && showDebug && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 10,
          color: 'white', fontFamily: 'sans-serif', pointerEvents: 'auto',
          maxHeight: '95vh', overflowY: 'auto'
        }}>
          <button 
            onClick={() => setShowDebug(false)} 
            style={{ padding: '4px 8px', marginBottom: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Hide Debug
          </button>
          
          <div style={{ 
            background: 'rgba(0,0,0,0.85)', padding: '16px', borderRadius: '8px',
            border: '1px solid #444', marginBottom: '10px', minWidth: '320px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', color: '#888' }}>Hardware Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '6px', fontSize: '12px', marginBottom: '12px' }}>
              <span style={{ color: '#aaa' }}>Face:</span><span style={{ color: '#0f0' }}>READY</span>
              <span style={{ color: '#aaa' }}>Camera:</span>
              <span style={{ color: hardwareStatus.camera === 'GRANTED' ? '#0f0' : (hardwareStatus.camera === 'DENIED' || hardwareStatus.camera === 'UNAVAILABLE' ? '#f00' : '#ffa500') }}>
                {hardwareStatus.camera}
              </span>
              <span style={{ color: '#aaa' }}>Microphone:</span>
              <span style={{ color: hardwareStatus.mic === 'GRANTED' ? '#0f0' : (hardwareStatus.mic === 'DENIED' || hardwareStatus.mic === 'UNAVAILABLE' ? '#f00' : '#ffa500') }}>
                {hardwareStatus.mic}
              </span>
              <span style={{ color: '#aaa' }}>Touch:</span><span style={{ color: '#0f0' }}>{hardwareStatus.touch}</span>
              <span style={{ color: '#aaa' }}>Orientation:</span>
              <span style={{ color: hardwareStatus.orientation === 'READY' ? '#0f0' : (hardwareStatus.orientation === 'UNSUPPORTED' || hardwareStatus.orientation === 'DENIED' ? '#f00' : '#ffa500') }}>
                {hardwareStatus.orientation}
              </span>
            </div>

            <hr style={{ borderColor: '#333', margin: '12px 0' }} />

            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', color: '#888' }}>ESP32 Connection</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input 
                type="text" 
                value={espIp}
                onChange={(e) => setEspIp(e.target.value)}
                placeholder="192.168.1.100"
                style={{ background: '#222', color: '#fff', border: '1px solid #555', padding: '4px', flex: 1 }}
              />
              <button onClick={handleConnectRobot} style={{ padding: '4px 8px', background: '#006600', color: 'white', border: 'none', borderRadius: '4px' }}>CONNECT</button>
              <button onClick={handleDisconnectRobot} style={{ padding: '4px 8px', background: '#660000', color: 'white', border: 'none', borderRadius: '4px' }}>DISCONNECT</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '6px', fontSize: '12px', marginBottom: '12px' }}>
              <span style={{ color: '#aaa' }}>ESP32:</span>
              <span style={{ color: hardwareStatus.robot === 'CONNECTED' ? '#0f0' : (hardwareStatus.robot === 'ERROR' ? '#f00' : '#ffa500') }}>
                {hardwareStatus.robot}
              </span>
              <span style={{ color: '#aaa' }}>Latency:</span><span style={{ color: '#fff' }}>{hardwareStatus.latency} ms</span>
              <span style={{ color: '#aaa' }}>Last Message:</span><span style={{ color: '#fff' }}>{hardwareStatus.lastMessage}</span>
              <span style={{ color: '#aaa' }}>Heartbeat:</span>
              <span style={{ color: hardwareStatus.heartbeat === 'OK' ? '#0f0' : '#f00' }}>{hardwareStatus.heartbeat}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={handlePing} style={{ padding: '4px 8px', background: '#444', color: 'white', border: '1px solid #666', borderRadius: '4px' }}>SEND PING</button>
              <button onClick={handleCommand} style={{ padding: '4px 8px', background: '#444', color: 'white', border: '1px solid #666', borderRadius: '4px' }}>TEST COMMAND</button>
            </div>
            
            <button 
              onClick={() => setCameraPreviewEnabled(!cameraPreviewEnabled)} 
              style={{ marginTop: '16px', padding: '6px 12px', width: '100%', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer' }}
            >
              {cameraPreviewEnabled ? 'Hide Camera Preview' : 'Show Camera Preview'}
            </button>
            
            {cameraPreviewEnabled && (
              <div 
                ref={cameraContainerRef} 
                style={{ 
                  marginTop: '10px', width: '100%', aspectRatio: '3/4', 
                  backgroundColor: '#222', borderRadius: '4px', overflow: 'hidden' 
                }} 
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', maxWidth: '320px' }}>
            <button onClick={() => controllerRef.current?.getMixer().idleSystem.triggerBlink()} style={{ padding: '8px' }}>Blink</button>
            <button onClick={() => controllerRef.current?.playLove()} style={{ padding: '8px' }}>Love</button>
            <button onClick={() => controllerRef.current?.playCry()} style={{ padding: '8px' }}>Cry</button>
            <button onClick={() => controllerRef.current?.playSleep()} style={{ padding: '8px' }}>Sleep</button>
            <button onClick={() => controllerRef.current?.playUncomfortable()} style={{ padding: '8px' }}>Uncomfortable</button>
            <button onClick={() => controllerRef.current?.playExtremeCute()} style={{ padding: '8px' }}>Extreme Cute</button>
            <button onClick={() => controllerRef.current?.resetFace()} style={{ padding: '8px', background: '#ccc' }}>Reset</button>
          </div>

        </div>
      )}
      
      {/* Hidden button to re-enable debug if hidden (top left corner, 40x40 area) */}
      {isInitialized && !showDebug && (
        <div 
          onClick={() => setShowDebug(true)}
          style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', zIndex: 10, cursor: 'pointer' }}
        />
      )}
    </div>
  );
};
