import React, { useRef, useEffect, useState, useMemo } from 'react';

/**
 * BreathingNodeGraph - 3D WebGL visualization with spring physics
 * 
 * The breathing/tensioned node visualization for the 280-skill taxonomy.
 * Features:
 * - 3D WebGL rendering
 * - Spring physics simulation (nodes attract/repel each other)
 * - Breathing animation (subtle pulse)
 * - Interactive node selection
 * - Camera orbit controls
 * 
 * Based on Eva-style topological displays for MAGI system,
 * skill dependencies, and field lines.
 */

// @ts-ignore - Three.js types for simplicity
declare global {
  interface THREE {
    Scene;
    Vector3
    Matrix4
    Color
    Euler: Euler;
    Object3D
  }
}

export interface Node3D {
  id: string;
  name: string;
  category?: string;
  layer?: number;
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
  connections: string[];
  skills?: string[];
}

export interface Connection3D {
  id: string;
  source: string;
  target: string;
  strength: number;
}

export interface BreathingNodeGraphProps {
  /** Nodes to visualize */
  nodes?: Node3D[];
  
  /** Connections between nodes */
  connections?: Connection3D[];
  
  /** Color theme */
  color?: 'cyan' | 'green' | 'orange' | 'magenta';
  
  /** Enable breathing animation */
  breathing?: boolean;
  
  /** Breathing speed (ms per cycle) */
  breathSpeed?: number;
  
  /** Spring physics stiffness */
  springStiffness?: number;
  
  /** Spring physics damping */
  springDamping?: number;
  
  /** Repulsion strength between nodes */
  repulsion?: number;
  
  /** Camera auto-rotate */
  autoRotate?: boolean;
  
  /** Rotation speed (radians per second) */
  rotationSpeed?: number;
  
  /** Width */
  width?: number;
  
  /** Height */
  height?: number;
  
  /** On node click */
  onNodeClick?: (node: Node3D) => void;
  
  /** Additional className */
  className?: string;
}

const colorValues3D = {
  cyan: 0x00CCFF,
  green: 0x00FF66,
  orange: 0xFF6600,
  magenta: 0xFF00CC,
};

export function BreathingNodeGraph({
  nodes: initialNodes = [],
  connections: initialConnections = [],
  color = 'cyan',
  breathing = true,
  breathSpeed = 2000,
  springStiffness = 0.001,
  springDamping = 0.95,
  repulsion = 150,
  autoRotate = true,
  rotationSpeed = 0.0005,
  width = 800,
  height = 600,
  onNodeClick,
  className,
}: BreathingNodeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  
  const [animationId, setAnimationId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes3D, setNodes3D] = useState<Node3D[]>([]);
  
  // Initialize scene and nodes
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 1);
    camera.position.z = 5;
    cameraRef.current = camera;
    scene.add(camera);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Initialize nodes with positions
    const initNodes = () => {
      const newNodes: Node3D[] = nodes.map((node, i) => {
        // Arrange in a circle initially
        const angle = (i / nodes.length) * Math.PI * 2;
        const radius = Math.min(width, height) / 3;
        const x = Math.cos(angle) * radius + (width / 2 - 150);
        const y = Math.sin(angle) * radius + (height / 2 - 100);
        
        return {
          ...node,
          position: [x, y, z],
          velocity: [0, 0, 0],
        };
      });
      setNodes3D(newNodes);
    };
    
    initNodes();
    
    // Animation loop
    const animate = () => {
      const animationLoop = () => {
        if (!sceneRef.current || !rendererRef.current || !cameraRef.current) {
          requestAnimationFrame(animate);
          return;
        }
        
        // Update breathing animation
        const time = Date.now() * 0.001;
        const breathScale = breathing ? Math.sin(time / breathSpeed) * 0.3 + 1 : 1;
 0;
        
        // Update physics (springs)
        const deltaTime = 0.016;
        const tempNodes = [...nodes3D];
        
        // Apply spring forces
        for (let i = 0; i < tempNodes.length; i++) {
          const node = tempNodes[i];
          
          // Attraction to connected nodes (spring)
          for (const conn of connections) {
            const sourceNode = tempNodes.find(n => n.id === conn.source);
            const targetNode = tempNodes.find(n => n.id === conn.target);
            
            if (sourceNode && targetNode) {
              const dx = sourceNode.position[0] - targetNode.position[0];
              const dy = sourceNode.position[1] - targetNode.position[1];
              const dz = sourceNode.position[2] - targetNode.position[2];
              
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (distance > 0) {
                const force = (distance - 50) * springStiffness * conn.strength;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;
                const fz = (dz / distance) * force;
                
                node.velocity[0] += fx * deltaTime;
                node.velocity[1] += fy * deltaTime;
                node.velocity[2] += fz * deltaTime;
                targetNode.velocity[0] -= fx * deltaTime;
                targetNode.velocity[1] -= fy * deltaTime;
                targetNode.velocity[2] -= fz * deltaTime;
              }
            }
          }
          
          // Repulsion between all nodes
          for (let i = 0; i < tempNodes.length; i++) {
            for (let j = i + 1; j < tempNodes.length; j++) {
              const dx = tempNodes[i].position[0] - tempNodes[j].position[0];
              const dy = tempNodes[i].position[1] - tempNodes[j].position[1];
              const dz = tempNodes[i].position[2] - tempNodes[j].position[2];
              
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (distance > 0) {
                const force = repulsion / (distance * distance);
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;
                const fz = (dz / distance) * force;
                
                tempNodes[i].velocity[0] -= fx * deltaTime;
                tempNodes[i].velocity[1] -= fy * deltaTime;
                tempNodes[i].velocity[2] -= fz * deltaTime;
              }
            }
          }
          
          // Apply velocity with damping
          for (let i = 0; i < tempNodes.length; i++) {
            const node = tempNodes[i];
            node.position[0] += node.velocity[0] * springDamping;
            node.position[1] += node.velocity[1] * springDamping;
            node.position[2] += node.velocity[2] * springDamping;
            
            // Boundary constraints
            node.position[0] = Math.max(50, Math.min(width - 50, node.position[0]));
            node.position[1] = Math.max(50, Math.min(height - 50, node.position[1]));
            node.position[2] = Math.max(-200, Math.min(200, node.position[2]));
          }
          
          // Auto-rotate camera
          if (autoRotate) {
            const time = Date.now() * rotationSpeed;
            camera.position.x = Math.sin(time) * 300;
            camera.position.z = Math.cos(time) * 300 + 200;
            camera.lookAt(new THREE.Vector3(0, 0, 0));
          }
          
          // Render
          renderer.render(scene, camera);
          
          requestAnimationFrame(animationLoop);
        };
        animationLoop();
        
        return () => {
          if (rendererRef.current) {
            rendererRef.current.dispose();
          }
          if (sceneRef.current) {
            sceneRef.current.clear();
          }
        };
      };
    
      requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(animationId);
      };
    };
  }, [nodes, connections, breathing, breathSpeed, springStiffness, springDamping, repulsion, autoRotate, rotationSpeed, width, height]);
  
  const handleNodeClick = (nodeId: string) => {
    const node = nodes3D.find(n => n.id === nodeId);
    if (node && onNodeClick) {
      onNodeClick(node);
    }
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
  };
  
  return (
    <div 
      ref={containerRef} 
      style={{ width, height }}
      className={className}
    />
      {/* React overlay for labels */}
      <svg 
        ref={containerRef}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {nodes3D.map((node) => (
          <g key={node.id}>
            {/* Node label */}
            <text
              x={node.position[0]}
              y={node.position[1]}
              fill={colorValues3D[color]}
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              style={{
                textShadow: `0 0 4px ${colorValues3D[color]}`,
                opacity: selectedNodeId === null || selectedNodeId === node.id ? 1 : 0.4,
              }}
            >
              {node.name}
            </text>
            
            {/* Node category */}
            {node.category && (
              <text
                x={node.position[0]}
                y={node.position[1] + 14}
                fill={colorValues3D[color]}
                fontSize="6"
                textAnchor="middle"
                opacity={0.5}
              >
                [{node.layer}] {node.category}
              </text>
            )}
          </g>
        ))}
        
        {/* Legend */}
        <g style={{ position: 'absolute', top: 10, right: 10 }}>
          <text fill={colorValues3D[color]} fontSize="10" textAnchor="end">
            LAYER: {Math.max(...new Set(nodes3D.map(n => n.layer || 0)).join(', ')}
          </text>
        </g>
      </svg>
    </div>
  );
}

export default BreathingNodeGraph;
