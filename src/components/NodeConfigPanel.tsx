import { Node } from "reactflow";
import { Typography, TextField, Box, Button } from "@mui/material";
import {
  useForm,
  useFieldArray,
  Controller,
  useController,
  FormProvider,
  useFormContext,
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
  const methods = useForm({
    defaultValues: selectedNode?.data.config || {},
    shouldUnregister: true,
  });

  const { control, reset, handleSubmit } = methods;

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

  // 处理新添加的节点，确保可选项不会自动填充
  useEffect(() => {
    if (
      selectedNode &&
      (!selectedNode.data.config ||
        Object.keys(selectedNode.data.config).length === 0)
    ) {
      // 如果是新节点（没有配置或配置为空对象），则不自动填充可选项
      reset(
        {},
        {
          keepDefaultValues: false,
          keepDirty: false,
        }
      );
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
    // 清理数据，移除所有 undefined 和 null 值
    const cleanData = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return undefined;
      }

      if (Array.isArray(obj)) {
        const cleanedArray = obj
          .map(cleanData)
          .filter((item) => item !== undefined);
        return cleanedArray.length > 0 ? cleanedArray : undefined;
      }

      if (typeof obj === "object") {
        const cleanedObj: Record<string, any> = {};
        let hasValidProps = false;

        Object.entries(obj).forEach(([key, value]) => {
          const cleanedValue = cleanData(value);
          if (cleanedValue !== undefined) {
            cleanedObj[key] = cleanedValue;
            hasValidProps = true;
          }
        });

        return hasValidProps ? cleanedObj : undefined;
      }

      return obj;
    };

    const cleanedData = cleanData(data) || {};

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

    verifyNumberTypes(cleanedData, selectedNode.data.config);

    onNodeUpdate({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        config: cleanedData,
      },
    });
  };

  const nodeTypeConfig = NODE_TYPES.find(
    (nodeType) =>
      nodeType.type === selectedNode.data.type &&
      nodeType.category === selectedNode.data.category
  );

  // 检查属性是否为可选项（在 TypeScript 类定义中以问号结尾）
  const isOptionalProperty = (
    key: string,
    config: any,
    defaultConfig: any
  ): boolean => {
    // 检查默认配置中的值
    const defaultValue = _.get(defaultConfig, key);

    const isOptionalType =
      defaultValue === null ||
      defaultValue === undefined ||
      Array.isArray(defaultValue) ||
      (typeof defaultValue === "object" &&
        defaultValue !== null &&
        Object.keys(defaultValue).length === 0);

    // 如果类型不是可选类型，直接返回 false
    if (!isOptionalType) {
      return false;
    }

    // 检查配置中是否已经存在该项
    // 如果已存在且不是 undefined，则不显示为可选项
    const configValue = _.get(config, key);
    return configValue === undefined;
  };

  const renderConfigFields = (
    config: any,
    defaultConfig: any,
    path: string = ""
  ) => {
    return Object.entries(defaultConfig || {}).map(([key, defaultValue]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const configValue = _.get(config, key);
      const isConfigValueUndefined = configValue === undefined;

      // 检查是否为可选项
      const isOptional = isOptionalProperty(key, config, defaultConfig);

      // 如果是可选项且配置中不存在该项，则显示"加入"按钮
      if (isOptional) {
        return (
          <OptionalField
            key={currentPath}
            path={currentPath}
            fieldKey={key}
            defaultValue={defaultValue}
            control={control}
          />
        );
      }

      // 处理不同类型的配置项
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
          // 如果是嵌套对象，且配置中不存在该项，则显示"加入"按钮
          if (isConfigValueUndefined) {
            return (
              <OptionalField
                key={currentPath}
                path={currentPath}
                fieldKey={key}
                defaultValue={defaultValue}
                control={control}
              />
            );
          }

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
        // 如果是基本类型，且配置中不存在该项，则显示"加入"按钮
        if (isConfigValueUndefined) {
          return (
            <OptionalField
              key={currentPath}
              path={currentPath}
              fieldKey={key}
              defaultValue={defaultValue}
              control={control}
            />
          );
        }

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
      <FormProvider {...methods}>
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
      </FormProvider>
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

interface OptionalFieldProps {
  path: string;
  fieldKey: string;
  defaultValue: any;
  control: any;
}

const OptionalField = ({
  path,
  fieldKey,
  defaultValue,
  control,
}: OptionalFieldProps) => {
  const [isAdded, setIsAdded] = useState(false);
  const { setValue, unregister, getValues } = useFormContext();

  useEffect(() => {
    // 检查表单中是否已经有该字段的值
    const currentValue = getValues(path);
    // 只有当值不是 undefined 且不是 null 时，才认为该字段已添加
    if (currentValue !== undefined && currentValue !== null) {
      setIsAdded(true);
    } else {
      setIsAdded(false);
    }
  }, [getValues, path]);

  const handleAdd = () => {
    // 使用 setValue 将默认值添加到表单中
    // 对于数组类型，如果默认值不是空数组，我们可能需要特殊处理
    if (Array.isArray(defaultValue)) {
      // 如果是空数组，添加一个空数组
      // 如果不是空数组，复制默认值
      setValue(path, [...defaultValue]);
    } else {
      setValue(path, defaultValue);
    }
    setIsAdded(true);
  };

  const handleRemove = () => {
    // 使用 unregister 从表单中移除该项
    unregister(path);
    setIsAdded(false);
  };

  if (!isAdded) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", margin: 2 }}>
        <Typography variant="body2" sx={{ marginRight: 2 }}>
          {fieldKey}
        </Typography>
        <Button variant="outlined" size="small" onClick={handleAdd}>
          添加
        </Button>
      </Box>
    );
  }

  // 如果已添加，则根据类型渲染相应的字段
  const renderField = () => {
    if (typeof defaultValue === "object" && defaultValue !== null) {
      if (Array.isArray(defaultValue)) {
        return (
          <ArrayField
            name={path}
            control={control}
            defaultValue={defaultValue}
            label={fieldKey}
          />
        );
      } else if (Object.keys(defaultValue).length === 0) {
        return (
          <RecordField
            name={path}
            control={control}
            defaultValue={defaultValue}
            label={fieldKey}
          />
        );
      } else {
        // 嵌套对象，直接渲染子字段
        return (
          <Box sx={{ padding: 1 }}>
            {Object.entries(defaultValue).map(([subKey, subValue]) => {
              const subPath = `${path}.${subKey}`;

              // 基本类型或简单对象
              if (
                typeof subValue !== "object" ||
                subValue === null ||
                Array.isArray(subValue) ||
                Object.keys(subValue).length === 0
              ) {
                if (
                  typeof subValue === "object" &&
                  subValue !== null &&
                  Array.isArray(subValue)
                ) {
                  return (
                    <Box
                      key={subPath}
                      sx={{ margin: 1, padding: 1, border: "1px dashed #ccc" }}
                    >
                      <Typography variant="subtitle2">{subKey}</Typography>
                      <ArrayField
                        name={subPath}
                        control={control}
                        defaultValue={subValue}
                        label={subKey}
                      />
                    </Box>
                  );
                } else if (
                  typeof subValue === "object" &&
                  subValue !== null &&
                  Object.keys(subValue).length === 0
                ) {
                  return (
                    <Box
                      key={subPath}
                      sx={{ margin: 1, padding: 1, border: "1px dashed #ccc" }}
                    >
                      <Typography variant="subtitle2">{subKey}</Typography>
                      <RecordField
                        name={subPath}
                        control={control}
                        defaultValue={subValue}
                        label={subKey}
                      />
                    </Box>
                  );
                } else {
                  // 基本类型
                  return (
                    <Box key={subPath} sx={{ margin: 1 }}>
                      <Controller
                        name={subPath}
                        control={control}
                        defaultValue={subValue}
                        render={({ field }) => {
                          if (typeof subValue === "boolean") {
                            return (
                              <TextField
                                {...field}
                                label={subKey}
                                fullWidth
                                margin="normal"
                                size="small"
                                type="checkbox"
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => field.onChange(e.target.checked)}
                              />
                            );
                          } else if (typeof subValue === "number") {
                            return (
                              <TextField
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "") {
                                    field.onChange(subValue);
                                  } else {
                                    const num = parseFloat(value);
                                    !isNaN(num) && field.onChange(num);
                                  }
                                }}
                                label={subKey}
                                fullWidth
                                margin="normal"
                                size="small"
                                type="number"
                                inputProps={{
                                  step: Number.isInteger(subValue)
                                    ? "1"
                                    : "any",
                                }}
                              />
                            );
                          } else {
                            return (
                              <TextField
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                value={
                                  isNull(field.value) ? subValue : field.value
                                }
                                label={subKey}
                                fullWidth
                                margin="normal"
                                size="small"
                              />
                            );
                          }
                        }}
                      />
                    </Box>
                  );
                }
              } else {
                // 复杂嵌套对象，显示一个折叠面板
                return (
                  <Box
                    key={subPath}
                    sx={{ margin: 1, padding: 1, border: "1px dashed #ccc" }}
                  >
                    <Typography variant="subtitle2">{subKey}</Typography>
                    <Box sx={{ paddingLeft: 2 }}>
                      {Object.entries(subValue as object).map(
                        ([nestedKey, nestedValue]) => {
                          const nestedPath = `${subPath}.${nestedKey}`;
                          return (
                            <Controller
                              key={nestedPath}
                              name={nestedPath}
                              control={control}
                              defaultValue={nestedValue}
                              render={({ field }) => {
                                if (typeof nestedValue === "boolean") {
                                  return (
                                    <TextField
                                      {...field}
                                      label={nestedKey}
                                      fullWidth
                                      margin="normal"
                                      size="small"
                                      type="checkbox"
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                      ) => field.onChange(e.target.checked)}
                                    />
                                  );
                                } else if (typeof nestedValue === "number") {
                                  return (
                                    <TextField
                                      value={field.value ?? ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                          field.onChange(nestedValue);
                                        } else {
                                          const num = parseFloat(value);
                                          !isNaN(num) && field.onChange(num);
                                        }
                                      }}
                                      label={nestedKey}
                                      fullWidth
                                      margin="normal"
                                      size="small"
                                      type="number"
                                      inputProps={{
                                        step: Number.isInteger(nestedValue)
                                          ? "1"
                                          : "any",
                                      }}
                                    />
                                  );
                                } else if (
                                  typeof nestedValue !== "object" ||
                                  nestedValue === null
                                ) {
                                  return (
                                    <TextField
                                      onChange={field.onChange}
                                      onBlur={field.onBlur}
                                      value={
                                        isNull(field.value)
                                          ? nestedValue
                                          : field.value
                                      }
                                      label={nestedKey}
                                      fullWidth
                                      margin="normal"
                                      size="small"
                                    />
                                  );
                                } else {
                                  // 对于更深层次的嵌套，显示一个简单的提示
                                  return (
                                    <Box key={nestedPath} sx={{ margin: 1 }}>
                                      <Typography variant="body2">
                                        {nestedKey}: 复杂对象 (保存后可编辑)
                                      </Typography>
                                    </Box>
                                  );
                                }
                              }}
                            />
                          );
                        }
                      )}
                    </Box>
                  </Box>
                );
              }
            })}
          </Box>
        );
      }
    } else {
      // 基本类型
      return (
        <Controller
          name={path}
          control={control}
          defaultValue={defaultValue}
          render={({ field }) => {
            if (typeof defaultValue === "boolean") {
              return (
                <TextField
                  {...field}
                  label={fieldKey}
                  fullWidth
                  margin="normal"
                  size="small"
                  type="checkbox"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.checked)
                  }
                />
              );
            } else if (typeof defaultValue === "number") {
              return (
                <TextField
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      field.onChange(defaultValue);
                    } else {
                      const num = parseFloat(value);
                      !isNaN(num) && field.onChange(num);
                    }
                  }}
                  label={fieldKey}
                  fullWidth
                  margin="normal"
                  size="small"
                  type="number"
                  inputProps={{
                    step: Number.isInteger(defaultValue) ? "1" : "any",
                  }}
                />
              );
            } else {
              return (
                <TextField
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={isNull(field.value) ? defaultValue : field.value}
                  label={fieldKey}
                  fullWidth
                  margin="normal"
                  size="small"
                />
              );
            }
          }}
        />
      );
    }
  };

  return (
    <Box sx={{ margin: 2, padding: 2, border: "1px solid #ccc" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 1,
        }}
      >
        <Typography variant="subtitle2">{fieldKey}</Typography>
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={handleRemove}
        >
          移除
        </Button>
      </Box>
      {renderField()}
    </Box>
  );
};

export default NodeConfigPanel;
