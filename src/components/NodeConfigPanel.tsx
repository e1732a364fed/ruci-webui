import { Node } from "reactflow";
import { Typography, TextField, Box, Button } from "@mui/material";
import {
  useForm,
  useFieldArray,
  Controller,
  useController,
} from "react-hook-form";
import { ChainNodeData } from "./nodes/ChainNode";
import { NODE_TYPES } from "../config/nodeTypes";
import _, { isNull } from "lodash"; // bun i lodash, bun i -D @types/lodash
import { useEffect, useState } from "react";

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
      if (isNull(template)) {
        return true;
      }
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
        } else if (Object.keys(defaultValue).length === 0) {
          // 处理 Record 类型的配置项，如 static_pairs, headers 或空对象
          return (
            <Box
              key={currentPath}
              sx={{ margin: 2, padding: 2, border: "1px solid #ccc" }}
            >
              <RecordField
                name={currentPath}
                control={control}
                defaultValue={_.get(config, key, {})}
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
            defaultValue={
              isNull(_.get(config, key, defaultValue))
                ? defaultValue
                : _.get(config, key, defaultValue)
            }
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <TextField
                // {...field}
                onChange={onChange} // send value to hook form
                onBlur={onBlur} // notify when input is touched
                ref={ref} //
                value={isNull(value) ? defaultValue : value}
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

interface RecordFieldProps {
  control: any;
  name: string;
  defaultValue: Record<string, any>;
  label: string;
}

const RecordField = ({
  control,
  name,
  defaultValue,
  label,
}: RecordFieldProps) => {
  const { field } = useController({
    name,
    control,
    defaultValue: defaultValue || {},
  });

  const [entries, setEntries] = useState<{ key: string; value: any }[]>(() => {
    // 将对象转换为键值对数组
    return Object.entries(field.value || {}).map(([k, v]) => ({
      key: k,
      value: v,
    }));
  });

  // 当 field.value 变化时更新 entries
  useEffect(() => {
    const newEntries = Object.entries(field.value || {}).map(([k, v]) => ({
      key: k,
      value: v,
    }));

    // 只有当值真正变化时才更新 entries
    if (!_.isEqual(newEntries, entries)) {
      setEntries(newEntries);
    }
  }, [field.value]);

  // 当 entries 变化时更新表单值
  useEffect(() => {
    const recordValue = entries.reduce((acc, { key, value }) => {
      if (key.trim()) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    // 使用 field.onChange 更新表单值，但避免不必要的更新
    if (!_.isEqual(recordValue, field.value)) {
      field.onChange(recordValue);
    }
  }, [entries, field]);

  const addEntry = () => {
    setEntries([...entries, { key: "", value: "" }]);
  };

  const removeEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  const updateEntry = (
    index: number,
    fieldName: "key" | "value",
    newValue: any
  ) => {
    const newEntries = [...entries];
    newEntries[index][fieldName] = newValue;
    setEntries(newEntries);
  };

  const getValueType = (value: any): string => {
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "checkbox";
    return "text";
  };

  const renderValueField = (
    entry: { key: string; value: any },
    index: number
  ) => {
    const type = getValueType(entry.value);

    if (type === "checkbox") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <input
            type="checkbox"
            checked={Boolean(entry.value)}
            onChange={(e) => updateEntry(index, "value", e.target.checked)}
          />
        </Box>
      );
    }

    return (
      <TextField
        value={entry.value === null ? "" : entry.value}
        onChange={(e) => {
          let newValue: string | number = e.target.value;
          if (type === "number" && e.target.value !== "") {
            newValue = parseFloat(e.target.value);
          }
          updateEntry(index, "value", newValue);
        }}
        placeholder="Value"
        size="small"
        type={type}
        sx={{ flex: 1 }}
      />
    );
  };

  return (
    <div>
      <Typography variant="subtitle2">{label}</Typography>
      {entries.map((entry, index) => (
        <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            value={entry.key}
            onChange={(e) => updateEntry(index, "key", e.target.value)}
            placeholder="Key"
            size="small"
            sx={{ flex: 1 }}
          />
          {renderValueField(entry, index)}
          <Button onClick={() => removeEntry(index)}>Delete</Button>
        </Box>
      ))}
      <Button onClick={addEntry}>Add Item</Button>
    </div>
  );
};

export default NodeConfigPanel;
