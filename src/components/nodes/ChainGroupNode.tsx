import { memo } from "react";
import { NodeProps } from "reactflow";
import { Box, Typography } from "@mui/material";
import { ChainViewNodeData } from "./ChainViewNode";

export interface ChainGroupNodeData {
  nodes: ChainViewNodeData[];
  category: "inbound" | "outbound";
  chainTag: string;
}

export const ChainGroupNode = memo(
  ({ data }: NodeProps<ChainGroupNodeData>) => {
    return (
      <div
        style={{
          backgroundColor:
            data.category === "inbound"
              ? "rgba(227, 242, 253, 0.2)"
              : "rgba(251, 233, 231, 0.2)",
          border: `2px dashed ${
            data.category === "inbound" ? "#1976d2" : "#d32f2f"
          }`,
          borderRadius: "8px",
          padding: "16px",
          minWidth: "200px",
          cursor: "move",
        }}
      >
        <div className="nodrag">
          <Typography
            variant="caption"
            sx={{
              display: "block",
              marginBottom: 1,
              color: (theme) =>
                data.category === "inbound"
                  ? theme.palette.primary.main
                  : theme.palette.error.main,
              fontWeight: "bold",
              userSelect: "none",
            }}
          >
            Chain: {data.chainTag}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {data.nodes.map((nodeData, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "white",
                  border: (theme) =>
                    `1px solid ${
                      nodeData.category === "inbound"
                        ? theme.palette.primary.main
                        : theme.palette.error.main
                    }`,
                  borderRadius: 1,
                  padding: 2,
                  minWidth: 180,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {nodeData.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {nodeData.label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Chain: {nodeData.chainTag}
                </Typography>
              </Box>
            ))}
          </Box>
        </div>
      </div>
    );
  }
);
