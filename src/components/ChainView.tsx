import { useMemo, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  Viewport,
  NodeChange,
  applyNodeChanges,
} from "reactflow";
import { Paper } from "@mui/material";
import { ChainNode, ChainNodeData } from "./nodes/ChainNode";
import { AllViewNode, AllViewNodeData } from "./nodes/AllViewNode";

interface ChainViewProps {
  in_chainNodes: Node<ChainNodeData>[];
  out_chainNodes: Node<ChainNodeData>[];
  inboundEdges: Edge[];
  outboundEdges: Edge[];
  viewport?: Viewport;
  onViewportChange?: (viewport: Viewport) => void;
  nodePositions: Record<string, { x: number; y: number }>;
  onNodesChange: (nodes: Node<AllViewNodeData>[]) => void;
}

const nodeTypes: NodeTypes = {
  allViewNode: AllViewNode,
};

export const ChainView = ({
  in_chainNodes,
  out_chainNodes,
  inboundEdges,
  outboundEdges,
  viewport,
  onViewportChange,
  nodePositions,
  onNodesChange,
}: ChainViewProps) => {
  // 转换节点数据
  const initialNodes = useMemo(() => {
    const chainGroups = new Map<string, Node<ChainNodeData>[]>();

    [...in_chainNodes, ...out_chainNodes].forEach((node) => {
      if (node.data.chainTag) {
        const group = chainGroups.get(node.data.chainTag) || [];
        group.push(node);
        chainGroups.set(node.data.chainTag, group);
      }
    });

    const viewNodes: Node<AllViewNodeData>[] = [];
    let yOffset = 100;

    chainGroups.forEach((chainGroupNodes, chainTag) => {
      const category = chainGroupNodes[0].data.category;
      const nodeId = `chain-${category}-${chainTag}`;
      const savedPosition = nodePositions[nodeId];
      const x = savedPosition
        ? savedPosition.x
        : category === "inbound"
        ? 100
        : 500;
      const y = savedPosition ? savedPosition.y : yOffset;

      viewNodes.push({
        id: nodeId,
        type: "allViewNode",
        data: {
          type: "chain",
          label: "Chain",
          category,
          chainTag,
          nodes: chainGroupNodes.map((node) => ({
            type: node.data.type,
            label: node.data.label,
            config: node.data.config,
          })),
        },
        position: { x, y },
        draggable: true,
      });

      if (!savedPosition) {
        yOffset += (chainGroupNodes.length + 2) * 120;
      }
    });

    return viewNodes;
  }, [in_chainNodes, out_chainNodes, nodePositions]);

  const [nodes, setNodes, handleNodesChange] =
    useNodesState<AllViewNodeData>(initialNodes);

  // 简化节点变化处理逻辑
  const handleNodeChanges = useCallback(
    (changes: NodeChange[]) => {
      handleNodesChange(changes);
      // 只在节点位置变化完成时通知父组件
      const positionChanges = changes.filter(
        (change) => change.type === "position" && change.dragging === false
      );
      if (positionChanges.length > 0) {
        const updatedNodes = applyNodeChanges(changes, nodes);
        onNodesChange(updatedNodes);
      }
    },
    [nodes, handleNodesChange, onNodesChange]
  );

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  const onMoveEnd = useCallback(
    (event: any, viewport: Viewport) => {
      onViewportChange?.(viewport);
    },
    [onViewportChange]
  );

  return (
    <Paper
      elevation={3}
      sx={{ height: "100%", "& .react-flow__renderer": { borderRadius: 1 } }}
    >
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView={!viewport}
        nodesDraggable={true}
        onNodesChange={handleNodeChanges}
        nodesConnectable={false}
        elementsSelectable={true}
        defaultViewport={viewport}
        onMoveEnd={onMoveEnd}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </Paper>
  );
};
