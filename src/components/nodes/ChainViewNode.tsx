import { memo } from "react";
import { NodeProps } from "reactflow";
import { Box, Typography } from "@mui/material";

export interface ChainViewNodeData {
  type: string;
  label: string;
  category: "inbound" | "outbound";
  chainTag: string;
  config: Record<string, any>;
}

export const ChainViewNode = memo(({ data }: NodeProps<ChainViewNodeData>) => {
  return (
    <Box
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
        minWidth: 180,
      }}
    >
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
    </Box>
  );
});
