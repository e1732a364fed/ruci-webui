import { Box, Paper, Typography, Button, Tabs, Tab } from "@mui/material";
import { NODE_TYPES } from "../config/nodeTypes";
import { Node } from "reactflow";
import { ChainNodeData } from "./nodes/ChainNode";
import { useState } from "react";

interface ToolbarProps {
  onAddNode: (node: Node<ChainNodeData>) => void;
  category?: "inbound" | "outbound" | "all";
}

export const Toolbar = ({ onAddNode, category = "all" }: ToolbarProps) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "inbound" | "outbound"
  >(category === "all" ? "inbound" : category);

  const handleAddNode = (
    type: string,
    label: string,
    nodeCategory: "inbound" | "outbound",
    defaultConfig: Record<string, any>
  ) => {
    const newNode: Node<ChainNodeData> = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type: "chainNode",
      position: { x: 100, y: 100 },
      data: {
        type,
        label,
        category: nodeCategory,
        chainTag: "", // This will be set by the App component
        config: defaultConfig,
      },
    };
    onAddNode(newNode);
  };

  const filteredNodes = NODE_TYPES.filter((node) =>
    category === "all"
      ? node.category === selectedCategory
      : node.category === category
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6">Add Node</Typography>
        {category === "all" && (
          <Tabs
            value={selectedCategory}
            onChange={(_, newValue) => setSelectedCategory(newValue)}
            sx={{ ml: "auto" }}
          >
            <Tab label="Inbound" value="inbound" />
            <Tab label="Outbound" value="outbound" />
          </Tabs>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {filteredNodes.map((nodeType) => (
          <Button
            key={nodeType.type}
            variant="outlined"
            size="small"
            onClick={() =>
              handleAddNode(
                nodeType.type,
                nodeType.label,
                nodeType.category,
                nodeType.defaultConfig
              )
            }
          >
            {nodeType.label}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};
