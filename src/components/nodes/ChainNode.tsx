import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Paper, Typography, Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { isStreamGenerator, isStreamConsumer } from "../../config/nodeTypes";

export interface ChainNodeData {
  type: string;
  label: string;
  category: "inbound" | "outbound";
  chainTag: string;
  config: Record<string, any>;
}

type ChainNodeProps = NodeProps<ChainNodeData>;

export const ChainNode = memo(
  ({ data, isConnectable, selected, id }: ChainNodeProps) => {
    const handleDelete = (event: React.MouseEvent) => {
      event.stopPropagation();
      const deleteEvent = new CustomEvent("nodeDelete", {
        detail: { nodeId: id },
        bubbles: true,
      });
      const element = document.querySelector(".react-flow__renderer");
      if (element) {
        element.dispatchEvent(deleteEvent);
      }
    };

    const isGenerator = isStreamGenerator(data.type, data.category);
    const isConsumer = isStreamConsumer(data.type, data.category);

    return (
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          minWidth: 180,
          backgroundColor: data.category === "inbound" ? "#e3f2fd" : "#fbe9e7",
          border: `2px solid ${selected ? "#1976d2" : "#ccc"}`,
          position: "relative",
          transition: "all 0.2s ease",
          "&:hover .delete-button": {
            opacity: 1,
          },
        }}
      >
        {!isGenerator && !isConsumer && (
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{
              visibility: isConnectable ? "visible" : "hidden",
            }}
          />
        )}
        {isConsumer && (
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{
              visibility: isConnectable ? "visible" : "hidden",
            }}
          />
        )}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {data.type}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.label}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            Chain: {data.chainTag}
          </Typography>
          {isGenerator && (
            <Typography
              variant="caption"
              color="primary"
              sx={{ display: "block", mt: 1 }}
            >
              Stream Generator
            </Typography>
          )}
          {isConsumer && (
            <Typography
              variant="caption"
              color="secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Stream Consumer
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          className="delete-button"
          onClick={handleDelete}
          sx={{
            position: "absolute",
            top: -16,
            right: -16,
            backgroundColor: "#fff",
            opacity: 0,
            transition: "opacity 0.2s ease",
            "&:hover": {
              backgroundColor: "#f44336",
              color: "#fff",
            },
            zIndex: 1000,
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
        {!isGenerator && !isConsumer && (
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={{
              visibility: isConnectable ? "visible" : "hidden",
            }}
          />
        )}
        {isGenerator && (
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={{
              visibility: isConnectable ? "visible" : "hidden",
            }}
          />
        )}
      </Paper>
    );
  }
);
