import React, { useState, useEffect } from 'react';
import {
  HUDContainer,
  TacticalPanel,
  Elbow,
  Bar,
  BarStack,
  PillButton,
  HUDButton,
  ButtonGroup,
  DataReadout,
  Crosshair,
  StatusIndicator,
  Waveform,
  HUDProgress,
  Terrain,
  Marker,
  Coordinates,
  Flex,
  Grid,
  Spacer,
  Divider,
  Card,
  Heading,
  Text,
  Label,
  DataDisplay,
  Code,
  colors,
} from './index';

// Demo page showcasing all NRV components
export function Demo() {
  const [altitude, setAltitude] = useState(12450);
  const [speed, setSpeed] = useState(847.3);
  const [heading, setHeading] = useState(127);
  
  // Simulate changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setAltitude(prev => prev + Math.floor(Math.random() * 100 - 50));
      setSpeed(prev => Math.max(0, prev + (Math.random() * 10 - 5)));
      setHeading(prev => (prev + Math.floor(Math.random() * 5 - 2) + 360) % 360);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Random waveform data
  const waveformData = Array.from({ length: 50 }, () => Math.random());
  
  return (
    <HUDContainer fullscreen showGrid showScanlines>
      {/* Header */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${colors.hud.green}20`,
      }}>
        <Flex align="center" gap={16}>
          <Heading level={2} variant="hud">NRV CONTROL</Heading>
          <Label>v0.1.0</Label>
        </Flex>
        
        <Flex align="center" gap={24}>
          <StatusIndicator label="SYSTEMS" status="online" />
          <StatusIndicator label="NETWORK" status="online" />
          <StatusIndicator label="SENSORS" status="warning" />
        </Flex>
      </div>
      
      {/* Main Content */}
      <div style={{ 
        position: 'absolute', 
        top: 70, 
        left: 24, 
        right: 24, 
        bottom: 24,
        display: 'grid',
        gridTemplateColumns: '280px 1fr 300px',
        gap: 24,
      }}>
        
        {/* Left Panel - LCARS Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Elbow variant="top-left" title="NAVIGATION" color="orange">
            <PillButton size="sm" color="purple">AUTO</PillButton>
          </Elbow>
          
          <BarStack
            bars={[
              { color: 'purple', length: '80%', label: 'WAYPOINTS' },
              { color: 'salmon', length: '100%', label: 'ROUTES' },
              { color: 'blue', length: '60%', label: 'MARKERS' },
              { color: 'tan', length: '90%', label: 'ZONES' },
            ]}
          />
          
          <Spacer size={8} />
          
          <Card variant="lcars" title="POSITION">
            <Coordinates 
              lat={34.0522} 
              lng={-118.2437} 
              format="dms"
              label="Current Location"
            />
            <Spacer size={12} />
            <DataDisplay 
              label="Altitude" 
              value={altitude}
              unit="FT"
              status="normal"
              size="lg"
            />
          </Card>
          
          <Spacer size={8} />
          
          <Elbow variant="top-left" title="SYSTEMS" color="purple" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <HUDProgress value={78} max={100} label="FUEL" color={colors.hud.green} />
            <HUDProgress value={45} max={100} label="POWER" color={colors.hud.amber} />
            <HUDProgress value={92} max={100} label="SHIELDS" color={colors.hud.cyan} />
          </div>
        </div>
        
        {/* Center Panel - Main Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TacticalPanel title="TERRAIN VIEW" borderColor={colors.hud.green}>
            <Terrain width={600} height={350} />
            
            {/* Overlay markers */}
            <div style={{ position: 'absolute', top: 50, left: 100 }}>
              <Marker type="diamond" label="ALPHA" pulse />
            </div>
            <div style={{ position: 'absolute', top: 150, right: 150 }}>
              <Marker type="circle" color={colors.hud.cyan} label="BRAVO" />
            </div>
          </TacticalPanel>
          
          <Grid columns={3} gap={16}>
            <TacticalPanel title="TELEMETRY">
              <DataReadout 
                label="VELOCITY" 
                value={speed.toFixed(1)} 
                unit="KTS"
                status="normal"
                size="lg"
              />
              <Spacer size={8} />
              <DataReadout 
                label="HEADING" 
                value={`${heading}°`}
                status="normal"
                size="md"
              />
            </TacticalPanel>
            
            <TacticalPanel title="WAVEFORM">
              <Waveform data={waveformData} height={80} />
            </TacticalPanel>
            
            <TacticalPanel title="TRACKING">
              <Flex align="center" gap={16}>
                <Crosshair variant="target" size={40} animated />
                <div>
                  <Text size="sm" color={colors.hud.whiteDim}>TARGET LOCK</Text>
                  <Text size="lg" weight="bold" color={colors.hud.green}>ACQUIRED</Text>
                </div>
              </Flex>
            </TacticalPanel>
          </Grid>
        </div>
        
        {/* Right Panel - Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Elbow variant="top-right" title="CONTROLS" color="orange" />
          
          <Card variant="hud" title="ACTIONS">
            <ButtonGroup orientation="vertical" gap={8}>
              <HUDButton variant="primary" size="lg">ENGAGE</HUDButton>
              <HUDButton variant="secondary">SCAN AREA</HUDButton>
              <HUDButton variant="danger">EMERGENCY STOP</HUDButton>
            </ButtonGroup>
          </Card>
          
          <Spacer size={8} />
          
          <Card variant="hud" title="MODE">
            <Grid columns={2} gap={8}>
              <PillButton color="orange" size="md" active>AUTO</PillButton>
              <PillButton color="purple" size="md">MANUAL</PillButton>
              <PillButton color="salmon" size="md">STEALTH</PillButton>
              <PillButton color="blue" size="md">COMBAT</PillButton>
            </Grid>
          </Card>
          
          <Spacer size={8} />
          
          <Card variant="hud" title="LOG">
            <div style={{ 
              height: 150, 
              overflow: 'auto',
              fontSize: '11px',
              lineHeight: 1.6,
            }}>
              <Text size="xs" color={colors.hud.whiteDim}>
                {'>'} System initialized<br/>
                {'>'} Sensors online<br/>
                {'>'} <Code color={colors.hud.amber}>WARNING: Low power</Code><br/>
                {'>'} Navigation lock acquired<br/>
                {'>'} <Code color={colors.hud.green}>Target locked</Code><br/>
                {'>'} Standing by...<br/>
              </Text>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '8px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: `1px solid ${colors.hud.green}20`,
        fontSize: '11px',
      }}>
        <Text size="xs" color={colors.hud.whiteDim}>
          NRV COMPONENT LIBRARY • DEMO BUILD
        </Text>
        <Text size="xs" color={colors.hud.green}>
          UPLINK: STABLE • LATENCY: 12ms
        </Text>
      </div>
    </HUDContainer>
  );
}

export default Demo;
