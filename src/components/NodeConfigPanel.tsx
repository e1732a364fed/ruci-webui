import { Node } from "reactflow";
import { Typography, TextField, Box, Button } from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { ChainNodeData } from "./nodes/ChainNode";
import { NODE_TYPES } from "../config/nodeTypes";
import _ from "lodash"; // bun i lodash, bun i -D @types/lodash
import { useEffect } from "react";

interface NodeConfigPanelProps {
  selectedNode: Node<ChainNodeData> | null;
  onNodeUpdate: (node: Node<ChainNodeData>) => void;
}

const NodeConfigPanel = ({
  selectedNode,
  onNodeUpdate,
}: NodeConfigPanelProps) => {
  const { control, reset, handleSubmit } = useForm({
    defaultValues: selectedNode?.data.config || {},
    shouldUnregister: true,
  });

  useEffect(() => {
    if (selectedNode) {
      // 使用异步重置确保完全清除旧状态
      reset(selectedNode.data.config || {}, {
        keepDefaultValues: false,
        keepDirty: false,
      });
    } else {
      reset({});
    }
  }, [selectedNode, reset]);

  if (!selectedNode) {
    return (
      <Typography variant="body1" align="center">
        Select a node to configure
      </Typography>
    );
  }

  const onSubmit = (data: any) => {
    const verifyNumberTypes = (obj: any, template: any) => {
      Object.entries(template).forEach(([key, defaultValue]) => {
        if (typeof defaultValue === "object") {
          verifyNumberTypes(obj[key], defaultValue);
        } else if (typeof defaultValue === "number") {
          console.assert(
            typeof obj[key] === "number",
            `${key} should be number`
          );
        }
      });
    };

    verifyNumberTypes(data, selectedNode.data.config);

    // console.log("data", data, "seldata", selectedNode.data);

    onNodeUpdate({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        config: data,
      },
    });
  };

  const nodeTypeConfig = NODE_TYPES.find(
    (nodeType) =>
      nodeType.type === selectedNode.data.type &&
      nodeType.category === selectedNode.data.category
  );

  const renderConfigFields = (
    config: any,
    defaultConfig: any,
    path: string = ""
  ) => {
    // console.log("config", config, "defaultConfig", defaultConfig);
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
                defaultValue={_.get(config, key, [])}
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
                _.get(config, key, {}),
                defaultValue,
                currentPath
              )}
            </Box>
          );
        }
      } else {
        if (typeof defaultValue === "number") {
          return (
            <Controller
              key={currentPath}
              name={currentPath}
              control={control}
              defaultValue={_.get(config, key, defaultValue)}
              render={({ field }) => {
                const handleChange = (
                  e: React.ChangeEvent<HTMLInputElement>
                ) => {
                  const value = e.target.value;
                  if (value === "") {
                    field.onChange(defaultValue);
                  } else {
                    const num = parseFloat(value);
                    !isNaN(num) && field.onChange(num);
                  }
                };

                return (
                  <TextField
                    value={field.value ?? ""}
                    onChange={handleChange}
                    label={key}
                    fullWidth
                    margin="normal"
                    size="small"
                    type="number"
                    inputProps={{
                      step: Number.isInteger(defaultValue) ? "1" : "any",
                    }}
                  />
                );
              }}
            />
          );
        }

        if (typeof defaultValue === "boolean") {
          return (
            <Controller
              key={currentPath}
              name={currentPath}
              control={control}
              defaultValue={_.get(config, key, defaultValue)}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={key}
                  fullWidth
                  margin="normal"
                  size="small"
                  type="checkbox"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.checked)
                  }
                />
              )}
            />
          );
        }

        return (
          <Controller
            key={currentPath}
            name={currentPath}
            control={control}
            defaultValue={_.get(config, key, defaultValue)}
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
        <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
          Save Changes
        </Button>
      </form>
    </Box>
  );
};

const ArrayField = ({ control, name, defaultValue, label }: any) => {
  const { fields, append, remove } = useFieldArray({ control, name });
  const elementType =
    defaultValue[0] !== undefined ? typeof defaultValue[0] : "string";

  return (
    <div>
      <Typography variant="subtitle2">{label}</Typography>
      {fields.map((field, index) => (
        <Box key={field.id} sx={{ display: "flex", gap: 1, mb: 1 }}>
          <Controller
            name={`${name}.${index}`}
            control={control}
            defaultValue={defaultValue[index] ?? ""}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                type={elementType === "number" ? "number" : "text"}
                onChange={(e) => {
                  if (elementType === "number") {
                    const num = parseFloat(e.target.value);
                    field.onChange(isNaN(num) ? 0 : num);
                  } else {
                    field.onChange(e.target.value);
                  }
                }}
                inputProps={{
                  step:
                    elementType === "number" &&
                    Number.isInteger(defaultValue[index])
                      ? "1"
                      : "any",
                }}
              />
            )}
          />
          <Button onClick={() => remove(index)}>Delete</Button>
        </Box>
      ))}
      <Button onClick={() => append(elementType === "number" ? 0 : "")}>
        Add Item
      </Button>
    </div>
  );
};

export default NodeConfigPanel;
