import { Node } from "reactflow";
import { Typography, TextField, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { ChainNodeData } from "./nodes/ChainNode";
import { NODE_TYPES } from "../config/nodeTypes";

// import { BindDialerConfig, DnsClientConfig } from "../config/nodeTypes";

interface NodeConfigPanelProps {
  selectedNode: Node<ChainNodeData> | null;
  onNodeUpdate: (node: Node<ChainNodeData>) => void;
}

const NodeConfigPanel = ({
  selectedNode,
  onNodeUpdate,
}: NodeConfigPanelProps) => {
  const { register, handleSubmit } = useForm();

  if (!selectedNode) {
    return (
      <Typography variant="body1" align="center">
        Select a node to configure
      </Typography>
    );
  }

  const onSubmit = (data: any) => {
    onNodeUpdate({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        config: data,
      },
    });
  };

  const nodeTypeConfig = NODE_TYPES.find(
    (nodeType) => nodeType.type === selectedNode.data.type
  );

  const renderConfigFields = (config: any, default_config: any) => {
    return Object.entries(default_config || {}).map(
      ([default_key, default_value]) => {
        if (typeof default_value === "object" && default_value !== null) {
          if (default_value instanceof Array) {
            return (
              <Box
                key={default_key}
                sx={{ margin: 2, padding: 2, border: "1px solid #ccc" }}
              >
                <Typography variant="subtitle2">{default_key}</Typography>
                array
              </Box>
            );
          } else {
            return (
              <Box
                key={default_key}
                sx={{ margin: 2, padding: 2, border: "1px solid #ccc" }}
              >
                <Typography variant="subtitle2">{default_key}</Typography>
                {renderConfigFields(default_value, default_config[default_key])}
              </Box>
            );
          }
        } else {
          return (
            <TextField
              key={default_key}
              label={default_key}
              defaultValue={default_value}
              {...register(default_key)}
              fullWidth
              margin="normal"
              size="small"
            />
          );
        }
      }
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Node Configuration
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Type: {selectedNode.data.type}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {nodeTypeConfig &&
          renderConfigFields(
            selectedNode.data.config,
            nodeTypeConfig.defaultConfig
          )}
      </form>
    </Box>
  );
};

export default NodeConfigPanel;
