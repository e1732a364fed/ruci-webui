import { memo } from "react";
import { NodeProps } from "reactflow";
import { Typography } from "@mui/material";

export interface GroupNodeData {
  type: "group";
  label: string;
  category: "inbound" | "outbound";
  chainTag: string;
  config: Record<string, never>;
}

export const GroupNode = memo(({ data }: NodeProps<GroupNodeData>) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor:
          data.category === "inbound"
            ? "rgba(227, 242, 253, 0.2)"
            : "rgba(251, 233, 231, 0.2)",
        border: `2px dashed ${
          data.category === "inbound" ? "#1976d2" : "#d32f2f"
        }`,
        borderRadius: "8px",
        position: "relative",
        cursor: "move",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: -20,
          left: 8,
          color: data.category === "inbound" ? "#1976d2" : "#d32f2f",
          backgroundColor: "white",
          padding: "0 4px",
          userSelect: "none",
        }}
      >
        Chain: {data.chainTag}
      </Typography>
    </div>
  );
});
