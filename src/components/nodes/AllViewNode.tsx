import { memo } from "react";
// import { memo, useState } from "react";
import { NodeProps } from "reactflow";
// import { Handle, Position, NodeProps } from "reactflow";
import { Paper, Typography, Box } from "@mui/material";

export interface AllViewNodeData {
  type: string;
  label: string;
  category: "inbound" | "outbound";
  chainTag: string;
  nodes: {
    type: string;
    label: string;
    config: Record<string, any>;
  }[];
}

export const AllViewNode = memo(
  // ({ data, isConnectable, selected }: NodeProps<AllViewNodeData>) => {
  ({ data, selected }: NodeProps<AllViewNodeData>) => {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          minWidth: 180,
          backgroundColor: data.category === "inbound" ? "#e3f2fd" : "#fbe9e7",
          border: `2px solid ${selected ? "#1976d2" : "#ccc"}`,
          // position: "relative",
          transition: "all 0.2s ease",
          cursor: "move",
          "&:hover": {
            boxShadow: 8,
            border: `2px solid ${
              data.category === "inbound" ? "#1976d2" : "#d32f2f"
            }`,
          },
          userSelect: "none",
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {data.label}
            <br /> {data.chainTag}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {data.nodes.map((node, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "white",
                  border: (theme) =>
                    `1px solid ${
                      data.category === "inbound"
                        ? theme.palette.primary.main
                        : theme.palette.error.main
                    }`,
                  borderRadius: 1,
                  padding: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {node.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {node.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    );
  }
);
