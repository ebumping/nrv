import React, { useState, useEffect, useMemo } from 'react';
import { HUDFrame, ContourMap, WaveformMonitor } from './index';
import type { ContourNode, ContourEdge } from './ContourMap';

/**
 * SkillGraphViewer - NERV-styled skill graph visualization
 * 
 * Consumes JSON exported from skill_graph and renders it
 * with authentic Eva styling.
 * 
 * Usage:
 *   1. Export from skill_graph: graph_to_json(graph)
 *   2. Pass to component: <SkillGraphViewer data={jsonData} />
 */

export interface SkillNode {
  id: string;
  name: string;
  description?: string;
  capabilities?: string[];
  dependencies?: string[];
  claims?: string[];
  priority?: string | number;
}

export interface SkillLink {
  source: string;
  target: string;
  type: 'dependency' | 'claim';
  claim?: string;
}

export interface SkillSequence {
  id: string;
  task: string;
  skills: string[];
  confidence?: number;
}

export interface SkillGraphData {
  nodes: SkillNode[];
  links: SkillLink[];
  sequences?: SkillSequence[];
}

export interface SkillGraphViewerProps {
  /** Graph data exported from skill_graph */
  data: SkillGraphData;
  
  /** Layout algorithm */
  layout?: 'force' | 'circular' | 'layered';
  
  /** Show sequences panel */
  showSequences?: boolean;
  
  /** Color theme */
  color?: 'cyan' | 'green' | 'orange' | 'magenta';
  
  /** Height of the visualization */
  height?: number;
  
  /** On node select */
  onNodeSelect?: (node: SkillNode) => void;
  
  /** Additional className */
  className?: string;
}

// Color mapping for capabilities
const capabilityColors: Record<string, string> = {
  'web': '#00CCFF',      // cyan
  'code': '#00FF66',     // green
  'file': '#00FF66',     // green
  'terminal': '#FF6600', // orange
  'research': '#FF00CC', // magenta
  'analysis': '#FF00CC', // magenta
  'default': '#00CCFF',  // cyan
};

export function SkillGraphViewer({
  data,
  layout = 'force',
  showSequences = true,
  color = 'cyan',
  height = 500,
  onNodeSelect,
  className,
}: SkillGraphViewerProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Calculate node positions using force-directed-like layout
  const { nodes: positionedNodes, edges: positionedEdges } = useMemo(() => {
    const nodeCount = data.nodes.length;
    
    // Simple circular layout for now (force layout would be ideal but expensive)
    const centerX = 50;
    const centerY = 50;
    const radius = nodeCount > 5 ? 35 : 25;
    
    const nodes: ContourNode[] = data.nodes.map((node, i) => {
      // Circular distribution with some randomness
      const angle = (i / nodeCount) * Math.PI * 2;
      const r = radius * (0.8 + Math.random() * 0.4);
      
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      
      // Color based on primary capability
      const primaryCap = node.capabilities?.[0] || 'default';
      const nodeColor = capabilityColors[primaryCap] || capabilityColors.default;
      
      return {
        id: node.id,
        x,
        y,
        label: node.name.toUpperCase(),
        value: typeof node.priority === 'number' ? node.priority : undefined,
        color: nodeColor,
      };
    });
    
    // Convert links to edges
    const edges: ContourEdge[] = data.links.map(link => ({
      source: link.source,
      target: link.target,
      strength: link.type === 'dependency' ? 0.8 : 0.4,
    }));
    
    return { nodes, edges };
  }, [data, layout]);
  
  // Get selected node details
  const selectedNodeData = useMemo(() => {
    if (!selectedNode) return null;
    return data.nodes.find(n => n.id === selectedNode.id) || null;
  }, [selectedNode, data.nodes]);
  
  // Handle node click
  const handleNodeClick = (node: ContourNode) => {
    const skillNode = data.nodes.find(n => n.id === node.id);
    if (skillNode) {
      setSelectedNode(skillNode);
      onNodeSelect?.(skillNode);
    }
  };
  
  // Generate readouts
  const readouts: [string, string, string, string] = useMemo(() => {
    const nodeCount = data.nodes.length;
    const linkCount = data.links.length;
    return [
      `+ ${String(nodeCount).padStart(8, '0')}`,
      `${String(linkCount).padStart(8, '0')}`,
      `- ${String(Math.floor(nodeCount / 2)).padStart(8, '0')}`,
      `+ ${String(data.sequences?.length || 0).padStart(8, '0')}`,
    ];
  }, [data]);
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    height,
    fontFamily: 'var(--nerv-font-mono)',
  };
  
  const mainPanelStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };
  
  const sidePanelStyle: React.CSSProperties = {
    width: '280px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };
  
  const nodeDetailsStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: 'var(--nerv-bg-elevated)',
    border: '1px solid var(--nerv-cyan)',
    borderRadius: '2px',
  };
  
  return (
    <div style={containerStyle} className={className}>
      {/* Main graph view */}
      <div style={mainPanelStyle}>
        {/* Contour map visualization */}
        <HUDFrame 
          label="SKILL TOPOLOGY" 
          labelJp="スキル・トポロジー"
          color={color}
          cornerBrackets
          crosshairs
        >
          <ContourMap
            nodes={positionedNodes}
            edges={positionedEdges}
            color={color}
            animated
            contourCount={60}
            readouts={readouts}
            height={height - 100}
            onNodeClick={handleNodeClick}
          />
        </HUDFrame>
        
        {/* Waveform status */}
        <HUDFrame label="SYNC PATTERN" color="green" cornerBrackets>
          <WaveformMonitor
            waveCount={6}
            color="green"
            frequency={1.5}
            amplitude={0.7}
            showGrid
            height={60}
            readout={selectedNode ? 'ACTIVE' : 'STANDBY'}
            readoutLabel="STATUS"
          />
        </HUDFrame>
      </div>
      
      {/* Side panel */}
      <div style={sidePanelStyle}>
        {/* Selected node details */}
        <HUDFrame 
          label="NODE ANALYSIS" 
          labelJp="ノード解析"
          color="cyan"
          cornerBrackets
          dashedBorder
        >
          {selectedNodeData ? (
            <div style={nodeDetailsStyle}>
              <div style={{ 
                color: 'var(--nerv-orange)', 
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
              }}>
                {selectedNodeData.name.toUpperCase()}
              </div>
              <div style={{ color: 'var(--nerv-text-dim)', marginBottom: '8px', fontSize: '10px' }}>
                ID: {selectedNodeData.id}
              </div>
              {selectedNodeData.description && (
                <div style={{ color: 'var(--nerv-text-normal)', marginBottom: '12px', fontSize: '11px' }}>
                  {selectedNodeData.description}
                </div>
              )}
              {selectedNodeData.capabilities && selectedNodeData.capabilities.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ color: 'var(--nerv-text-dim)', fontSize: '9px', marginBottom: '4px' }}>
                    CAPABILITIES
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {selectedNodeData.capabilities.map(cap => (
                      <span 
                        key={cap}
                        style={{ 
                          padding: '2px 6px',
                          backgroundColor: 'rgba(0, 204, 255, 0.1)',
                          border: '1px solid var(--nerv-cyan)',
                          color: 'var(--nerv-cyan)',
                          fontSize: '9px',
                        }}
                      >
                        {cap.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedNodeData.dependencies && selectedNodeData.dependencies.length > 0 && (
                <div>
                  <div style={{ color: 'var(--nerv-text-dim)', fontSize: '9px', marginBottom: '4px' }}>
                    DEPENDENCIES
                  </div>
                  <div style={{ color: 'var(--nerv-text-normal)', fontSize: '10px' }}>
                    {selectedNodeData.dependencies.join(' → ')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center',
              color: 'var(--nerv-text-dim)',
              fontSize: '11px',
            }}>
              SELECT NODE FOR ANALYSIS
            </div>
          )}
        </HUDFrame>
        
        {/* Sequences panel */}
        {showSequences && data.sequences && data.sequences.length > 0 && (
          <HUDFrame 
            label="EXECUTION SEQUENCES" 
            labelJp="実行シーケンス"
            color="orange"
            cornerBrackets
          >
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto',
              padding: '8px',
            }}>
              {data.sequences.map((seq, i) => (
                <div 
                  key={seq.id || i}
                  style={{ 
                    padding: '8px',
                    marginBottom: '4px',
                    backgroundColor: 'rgba(255, 102, 0, 0.05)',
                    borderLeft: '2px solid var(--nerv-orange)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredNode(seq.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div style={{ 
                    color: 'var(--nerv-orange)', 
                    fontSize: '10px',
                    marginBottom: '4px',
                  }}>
                    {seq.task.substring(0, 40)}...
                  </div>
                  <div style={{ color: 'var(--nerv-text-dim)', fontSize: '9px' }}>
                    {seq.skills.length} SKILLS • CONF: {((seq.confidence || 1) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </HUDFrame>
        )}
      </div>
    </div>
  );
}

export default SkillGraphViewer;
