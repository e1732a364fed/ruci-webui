import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
} from "reactflow";
import { Paper } from "@mui/material";
import { ChainNode, ChainNodeData } from "./nodes/ChainNode";
import { AllViewNode, AllViewNodeData } from "./nodes/AllViewNode";

interface ChainViewProps {
  in_chainNodes: Node<ChainNodeData>[];
  out_chainNodes: Node<ChainNodeData>[];
  inboundEdges: Edge[];
  outboundEdges: Edge[];
}

const nodeTypes: NodeTypes = {
  allViewNode: AllViewNode,
};

export const ChainView = ({
  in_chainNodes,
  out_chainNodes,
  inboundEdges,
  outboundEdges,
}: ChainViewProps) => {
  // 转换节点数据
  const initialNodes = useMemo(() => {
    const chainGroups = new Map<string, Node<ChainNodeData>[]>();

    // 收集所有链
    [...in_chainNodes, ...out_chainNodes].forEach((node) => {
      if (node.data.chainTag) {
        const group = chainGroups.get(node.data.chainTag) || [];
        group.push(node);
        chainGroups.set(node.data.chainTag, group);
      }
    });

    const viewNodes: Node<AllViewNodeData>[] = [];
    let yOffset = 100;

    // 为每个链创建节点
    chainGroups.forEach((chainGroupNodes, chainTag) => {
      const category = chainGroupNodes[0].data.category;
      const x = category === "inbound" ? 100 : 500;

      viewNodes.push({
        id: `chain-${category}-${chainTag}`,
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
        position: { x, y: yOffset },
        draggable: true,
      });

      yOffset += (chainGroupNodes.length + 2) * 120;
    });

    return viewNodes;
  }, [in_chainNodes, out_chainNodes]);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<AllViewNodeData>(initialNodes);

  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        "& .react-flow__renderer": { borderRadius: 1 },
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={true}
        onNodesChange={onNodesChange}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </Paper>
  );
};
