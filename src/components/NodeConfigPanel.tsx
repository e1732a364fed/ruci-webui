import { Node } from "reactflow";
import { Typography, TextField, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { ChainNodeData } from "./nodes/ChainNode";

interface NodeConfigPanelProps {
  selectedNode: Node<ChainNodeData> | null;
  onNodeUpdate: (node: Node<ChainNodeData>) => void;
}

const NodeConfigPanel = ({
  selectedNode,
  onNodeUpdate,
}: NodeConfigPanelProps) => {
  const { register, handleSubmit, reset } = useForm();

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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Node Configuration
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Type: {selectedNode.data.type}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {Object.entries(selectedNode.data.config || {}).map(([key, value]) => (
          <TextField
            key={key}
            label={key}
            defaultValue={value}
            {...register(key)}
            fullWidth
            margin="normal"
            size="small"
          />
        ))}
      </form>
    </Box>
  );
};

export default NodeConfigPanel;
