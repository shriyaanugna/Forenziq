import React, { useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Evidence, Finding, Correlation } from '../types';
import { Network, ShieldAlert, FileText, Share2, Layers } from 'lucide-react';

interface InvestigationGraphProps {
  evidenceList: Evidence[];
  findingsList: Finding[];
  correlationsList: Correlation[];
}

export default function InvestigationGraph({
  evidenceList,
  findingsList,
  correlationsList,
}: InvestigationGraphProps) {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Construct graph nodes & links dynamically from actual database records
  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const entityNodeMap = new Map<string, string>();

    // 1. Evidence Nodes (Blue)
    evidenceList.forEach((ev) => {
      nodes.push({
        id: ev.id,
        name: ev.evidence_id,
        label: ev.file_name,
        type: 'EVIDENCE',
        color: '#38bdf8', // sky-400
        val: 8,
        data: ev,
      });
    });

    // 2. Finding Nodes (Color by Severity)
    findingsList.forEach((fnd) => {
      const color =
        fnd.severity === 'CRITICAL'
          ? '#ef4444' // red-500
          : fnd.severity === 'HIGH'
          ? '#f97316' // orange-500
          : fnd.severity === 'MEDIUM'
          ? '#f59e0b' // amber-500
          : '#10b981'; // emerald-500

      nodes.push({
        id: fnd.id,
        name: fnd.finding_id,
        label: fnd.title,
        type: 'FINDING',
        color,
        val: 6,
        data: fnd,
      });

      // Link Finding -> Evidence
      if (fnd.evidence_id) {
        links.push({
          source: fnd.evidence_id,
          target: fnd.id,
          type: 'HAS_FINDING',
          color: '#475569',
        });
      }

      // 3. Entity Nodes (Purple) & Finding -> Entity links
      const entities = fnd.entities || {};
      Object.entries(entities).forEach(([key, values]) => {
        if (Array.isArray(values)) {
          values.forEach((val) => {
            if (typeof val === 'string' && val.trim().length > 0) {
              const entityId = `entity_${val.toLowerCase()}`;
              if (!entityNodeMap.has(entityId)) {
                entityNodeMap.set(entityId, val);
                nodes.push({
                  id: entityId,
                  name: val,
                  label: `${key.toUpperCase()}: ${val}`,
                  type: 'ENTITY',
                  color: '#c084fc', // purple-400
                  val: 4,
                  data: { entityType: key, value: val },
                });
              }

              links.push({
                source: fnd.id,
                target: entityId,
                type: 'EXTRACTED_ENTITY',
                color: '#64748b',
              });
            }
          });
        }
      });
    });

    // 4. Correlation Cross-Evidence Edges (Distinguished highlight line)
    correlationsList.forEach((crl) => {
      links.push({
        source: crl.source_evidence_id,
        target: crl.target_evidence_id,
        type: 'CORRELATION',
        label: `Correlated via ${crl.matched_entity_value}`,
        color: '#f59e0b', // Amber highlight
        curvature: 0.2,
      });
    });

    return { nodes, links };
  }, [evidenceList, findingsList, correlationsList]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4">
      {/* Interactive 2D Graph Canvas */}
      <div className="lg:col-span-3 bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden flex flex-col">
        <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="flex items-center gap-1 text-sky-400">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Evidence
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Finding
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Entity
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-0.5 bg-amber-400"></span> Correlation
          </span>
        </div>

        {graphData.nodes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
            No graph nodes available. Upload evidence to populate graph topology.
          </div>
        ) : (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel={(node: any) => `${node.type}: ${node.label || node.name}`}
            nodeColor={(node: any) => node.color}
            nodeRelSize={6}
            linkColor={(link: any) => link.color}
            linkWidth={(link: any) => (link.type === 'CORRELATION' ? 2.5 : 1)}
            linkDirectionalParticles={(link: any) => (link.type === 'CORRELATION' ? 2 : 0)}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={(node: any) => setSelectedNode(node)}
            backgroundColor="#020617"
          />
        )}
      </div>

      {/* Node Inspector Side Panel */}
      <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-y-auto space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-slate-200 font-bold text-sm">
          <Network className="w-4 h-4 text-cyan-400" /> Graph Inspector
        </div>

        {!selectedNode ? (
          <p className="text-xs text-slate-500 italic mt-4">
            Click on any Evidence, Finding, or Entity node in the interactive graph to inspect topology metadata.
          </p>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Node Type</span>
              <span className="text-cyan-400 font-bold text-sm">{selectedNode.type}</span>
            </div>

            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Identifier</span>
              <span className="text-slate-200">{selectedNode.name}</span>
            </div>

            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Label</span>
              <span className="text-slate-300">{selectedNode.label}</span>
            </div>

            {selectedNode.type === 'EVIDENCE' && (
              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-sky-400 font-bold block">Evidence Hash:</span>
                <span className="text-[10px] text-slate-400 break-all">{selectedNode.data.sha256_hash}</span>
              </div>
            )}

            {selectedNode.type === 'FINDING' && (
              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-red-400 font-bold block">Severity: {selectedNode.data.severity}</span>
                <p className="text-slate-300 font-sans text-[11px] mt-1">{selectedNode.data.description}</p>
              </div>
            )}

            {selectedNode.type === 'ENTITY' && (
              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold block">Entity Value:</span>
                <span className="text-slate-200">{selectedNode.data.value}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
