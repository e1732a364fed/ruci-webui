import { createContext } from "react";
import { Node } from "reactflow";
import { ChainNodeData } from "../components/nodes/ChainNode";

interface NodeConfigContextType {
  selectedNode: Node<ChainNodeData> | null;
  onNodeUpdate?: (node: Node<ChainNodeData>) => void;
}

export const NodeConfigContext = createContext<NodeConfigContextType | null>(
  null
);
