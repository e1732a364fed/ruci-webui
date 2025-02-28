import { Node } from "reactflow";
import { Typography, TextField, Box, Button } from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { ChainNodeData } from "./nodes/ChainNode";
import { NODE_TYPES } from "../config/nodeTypes";
import { get, set } from "lodash";

interface NodeConfigPanelProps {
  selectedNode: Node<ChainNodeData> | null;
  onNodeUpdate: (node: Node<ChainNodeData>) => void;
}

const NodeConfigPanel = ({
  selectedNode,
  onNodeUpdate,
}: NodeConfigPanelProps) => {
  const { control, handleSubmit } = useForm();
  const { watch } = useForm();
  
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

  const renderConfigFields = (
    config: any,
    defaultConfig: any,
    path: string = ""
  ) => {
    return Object.entries(defaultConfig || {}).map(([key, defaultValue]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof defaultValue === "object" && defaultValue !== null) {
        if (Array.isArray(defaultValue)) {
          return (
            <Box
              key={currentPath}
              sx={{ margin: 2, padding: 2, border: "1px solid #ccc" }}
            >
              <ArrayField
                name={currentPath}
                control={control}
                defaultValue={get(config, key, [])}
                label={key}
              />
            </Box>
          );
        } else {
          return (
            <Box
              key={currentPath}
              sx={{ margin: 2, padding: 2, border: "1px solid #ccc" }}
            >
              <Typography variant="subtitle2">{key}</Typography>
              {renderConfigFields(
                get(config, key, {}),
                defaultValue,
                currentPath
              )}
            </Box>
          );
        }
      } else {
        return (
          <Controller
            key={currentPath}
            name={currentPath}
            control={control}
            defaultValue={get(config, key, defaultValue)}
            render={({ field }) => (
              <TextField
                {...field}
                label={key}
                fullWidth
                margin="normal"
                size="small"
              />
            )}
          />
        );
      }
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
        {nodeTypeConfig &&
          renderConfigFields(
            selectedNode.data.config,
            nodeTypeConfig.defaultConfig
          )}
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          fullWidth
        >
          Save Changes
        </Button>
      </form>
    </Box>
  );
};

// 新增的ArrayField组件
const ArrayField = ({ control, name, defaultValue, label }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div>
      <Typography variant="subtitle2">{label}</Typography>
      {fields.map((field, index) => (
        <Box
          key={field.id}
          sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}
        >
          <Controller
            name={`${name}.${index}`}
            control={control}
            defaultValue={defaultValue[index] || ""}
            render={({ field }) => (
              <TextField {...field} fullWidth size="small" />
            )}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => remove(index)}
          >
            Delete
          </Button>
        </Box>
      ))}
      <Button
        variant="contained"
        size="small"
        onClick={() => append("")}
        sx={{ mt: 1 }}
      >
        Add Item
      </Button>
    </div>
  );
};
export default NodeConfigPanel;