import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Paper, Typography } from "@mui/material";

interface RouteNodeData {
  tag: string;
  category: "inbound" | "outbound";
}

export const RouteNode = memo(
  ({ data, isConnectable }: NodeProps<RouteNodeData>) => {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          minWidth: 150,
          backgroundColor: data.category === "inbound" ? "#e3f2fd" : "#fbe9e7",
          border: "1px solid #ccc",
        }}
      >
        {data.category === "inbound" && (
          <Handle
            type="source"
            position={Position.Right}
            isConnectable={isConnectable}
          />
        )}
        {data.category === "outbound" && (
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={isConnectable}
          />
        )}
        <Typography variant="subtitle1" align="center">
          {data.tag}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
        >
          {data.category}
        </Typography>
      </Paper>
    );
  }
);
