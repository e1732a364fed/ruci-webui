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
  viewport,
  onViewportChange,
  nodePositions,
  onNodesChange,
}: ChainViewProps) => {
  // 转换节点数据
  const initialNodes = useMemo(() => {
    const viewNodes: Node<AllViewNodeData>[] = [];
    let inboundYOffset = 100;
    let outboundYOffset = 100;

    // 按照 chainTag 对节点进行分组
    const inboundChains = new Map<string, Node<ChainNodeData>[]>();
    const outboundChains = new Map<string, Node<ChainNodeData>[]>();

    // 首先找出所有的 chainTag
    const inboundTags = new Set(
      in_chainNodes.map((node) => node.data.chainTag)
    );
    const outboundTags = new Set(
      out_chainNodes.map((node) => node.data.chainTag)
    );

    // 为每个 chainTag 构建完整的链
    inboundTags.forEach((tag) => {
      if (!tag) return;

      // 找出属于这个 chain 的所有节点
      const chainNodes = in_chainNodes.filter(
        (node) => node.data.chainTag === tag
      );
      if (chainNodes.length > 0) {
        inboundChains.set(tag, chainNodes);
      }
    });

    outboundTags.forEach((tag) => {
      if (!tag) return;

      // 找出属于这个 chain 的所有节点
      const chainNodes = out_chainNodes.filter(
        (node) => node.data.chainTag === tag
      );
      if (chainNodes.length > 0) {
        outboundChains.set(tag, chainNodes);
      }
    });

    // 处理入站链
    inboundChains.forEach((chainNodes, tag) => {
      const nodeId = `chain-inbound-${tag}`;
      const savedPosition = nodePositions[nodeId];
      const x = savedPosition ? savedPosition.x : 100;
      const y = savedPosition ? savedPosition.y : inboundYOffset;

      viewNodes.push({
        id: nodeId,
        type: "allViewNode",
        data: {
          type: "chain",
          label: "InboundChain",
          category: "inbound",
          chainTag: tag,
          nodes: chainNodes.map((node) => ({
            type: node.data.type,
            label: node.data.label,
            config: node.data.config,
          })),
        },
        position: { x, y },
        draggable: true,
      });

      if (!savedPosition) {
        inboundYOffset += (chainNodes.length + 2) * 120;
      }
    });

    // 处理出站链
    outboundChains.forEach((chainNodes, tag) => {
      const nodeId = `chain-outbound-${tag}`;
      const savedPosition = nodePositions[nodeId];
      const x = savedPosition ? savedPosition.x : 500;
      const y = savedPosition ? savedPosition.y : outboundYOffset;

      viewNodes.push({
        id: nodeId,
        type: "allViewNode",
        data: {
          type: "chain",
          label: "OutboundChain",
          category: "outbound",
          chainTag: tag,
          nodes: chainNodes.map((node) => ({
            type: node.data.type,
            label: node.data.label,
            config: node.data.config,
          })),
        },
        position: { x, y },
        draggable: true,
      });

      if (!savedPosition) {
        outboundYOffset += (chainNodes.length + 2) * 120;
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
