import { useCallback, useEffect } from "react";
// import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  // OnEdgesChange,
  Viewport,
} from "reactflow";
import { Box, Paper, Typography } from "@mui/material";
import { RouteNode } from "./nodes/RouteNode";

interface RouteNodeData {
  tag: string;
  category: "inbound" | "outbound";
}

interface RouteEditorProps {
  inboundChains: string[];
  outboundChains: string[];
  initialEdges?: Edge[];
  onEdgesChange?: (edges: Edge[]) => void;
  config: any;
  viewport?: Viewport;
  onViewportChange?: (viewport: Viewport) => void;
}

const nodeTypes = {
  routeNode: RouteNode,
};

const RouteEditor = ({
  inboundChains,
  outboundChains,
  initialEdges = [],
  onEdgesChange: onEdgesChangeCallback,
  // config,
  viewport,
  onViewportChange,
}: RouteEditorProps) => {
  // 创建初始节点
  const initialNodes: Node<RouteNodeData>[] = [
    // Inbound chains
    ...inboundChains.map((tag, index) => ({
      id: `${tag}`,
      type: "routeNode",
      position: { x: 100, y: 100 + index * 100 },
      data: { tag, category: "inbound" as const },
      draggable: true,
    })),
    // Outbound chains
    ...outboundChains.map((tag, index) => ({
      id: `${tag}`,
      type: "routeNode",
      position: { x: 500, y: 100 + index * 100 },
      data: { tag, category: "outbound" as const },
      draggable: true,
    })),
  ];

  const [nodes, setNodes, onNodesChange] =
    useNodesState<RouteNodeData>(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);

  // 当边发生变化时通知父组件
  useEffect(() => {
    onEdgesChangeCallback?.(edges);
  }, [edges, onEdgesChangeCallback]);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (!sourceNode || !targetNode) return;

      // 只允许从 inbound 连接到 outbound
      if (
        sourceNode.data.category !== "inbound" ||
        targetNode.data.category !== "outbound"
      ) {
        console.warn("Only inbound to outbound connections are allowed");
        return;
      }

      setEdges((eds) => addEdge(params, eds));
    },
    [nodes]
  );

  const onMoveEnd = useCallback(
    (_event: any, viewport: Viewport) => {
      onViewportChange?.(viewport);
    },
    [onViewportChange]
  );

  return (
    <Box sx={{ height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Route Configuration
      </Typography>
      <Paper elevation={3} sx={{ height: "calc(100% - 32px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultViewport={viewport}
          onMoveEnd={onMoveEnd}
          fitView={!viewport}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Paper>
    </Box>
  );
};

export default RouteEditor;
