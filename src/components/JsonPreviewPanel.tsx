import { Box, Typography } from "@mui/material";

interface JsonPreviewPanelProps {
  config: {
    inbounds?: { tag: string; chain: Record<string, any>[] }[];
    outbounds?: { tag: string; chain: Record<string, any>[] }[];
    tag_route: [string, string][];
    fallback_route: [string, string][];
    rule_route: any;
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
