import { Box, Typography } from "@mui/material";

interface JsonPreviewPanelProps {
  config: {
    inbounds?: Record<string, Record<string, any>[]>;
    outbounds?: Record<string, Record<string, any>[]>;
    routes?: Record<string, any>;
  };
}

const JsonPreviewPanel = ({ config }: JsonPreviewPanelProps) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        JSON Preview
      </Typography>
      <Box
        component="pre"
        sx={{
          backgroundColor: "#f5f5f5",
          padding: 2,
          borderRadius: 1,
          overflow: "auto",
          maxHeight: "calc(100vh - 300px)",
          "& code": {
            fontFamily: "monospace",
          },
        }}
      >
        <code>{JSON.stringify(config, null, 2)}</code>
      </Box>
    </Box>
  );
};

export default JsonPreviewPanel;
