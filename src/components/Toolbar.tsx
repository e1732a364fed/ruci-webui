import { Box, Paper, Typography, Button, Tabs, Tab } from "@mui/material";
import { NODE_TYPES } from "../config/nodeTypes";
import { Node } from "reactflow";
import { ChainNodeData } from "./nodes/ChainNode";
import { useState, useRef } from "react";

interface ToolbarProps {
  onAddNode: (node: Node<ChainNodeData>) => void;
  category?: "inbound" | "outbound" | "all";
  onExportJson?: () => void;
  onImportJson?: (jsonData: string) => void;
  onExportConfigJson?: () => void;
  onImportConfigJson?: (jsonData: string) => void;
}

export const Toolbar = ({
  onAddNode,
  category = "all",
  onExportJson,
  onImportJson,
  onExportConfigJson,
  onImportConfigJson,
}: ToolbarProps) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "inbound" | "outbound"
  >(category === "all" ? "inbound" : category);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const configFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNode = (
    type: string,
    label: string,
    nodeCategory: "inbound" | "outbound",
    defaultConfig: Record<string, any>,
    optionalFields: string[]
  ) => {
    const xOffset = Math.floor(Math.random() * 200) - 100;
    const yOffset = Math.floor(Math.random() * 200) - 100;

    // 过滤掉可选项，只保留非可选项
    const filterOptionalProperties = (
      config: Record<string, any>,
      optFields: string[],
      path: string = ""
    ): Record<string, any> => {
      // 创建一个空对象作为结果
      const result: Record<string, any> = {};

      // 遍历配置对象的所有属性
      Object.entries(config).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;

        // 检查当前属性是否在可选字段列表中
        const isOptional = optFields.some((field) => {
          // 处理嵌套路径，例如 "http_config.headers"
          if (field.includes(".")) {
            return (
              currentPath.startsWith(field) || field.startsWith(currentPath)
            );
          }
          return field === key;
        });

        // 如果不是可选项，则添加到结果中
        if (!isOptional) {
          // 如果值是对象且不是数组，递归处理
          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            // 对于嵌套对象，我们只保留其中的非可选属性
            const filteredNestedConfig = filterOptionalProperties(
              value,
              optFields,
              currentPath
            );
            // 只有当过滤后的嵌套配置不为空时，才添加到结果中
            if (Object.keys(filteredNestedConfig).length > 0) {
              result[key] = filteredNestedConfig;
            }
          } else {
            result[key] = value;
          }
        }
      });

      return result;
    };

    // 过滤掉可选项，只保留非可选项
    const filteredConfig = filterOptionalProperties(
      defaultConfig,
      optionalFields
    );

    const newNode: Node<ChainNodeData> = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type: "chainNode",
      position: { x: 100 + xOffset, y: 100 + yOffset },
      data: {
        type,
        label,
        category: nodeCategory,
        chainTag: "", // This will be set by the App component
        config: filteredConfig,
      },
    };
    onAddNode(newNode);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleConfigImportClick = () => {
    configFileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImportJson) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImportJson(content);
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfigFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && onImportConfigJson) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImportConfigJson(content);
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (configFileInputRef.current) {
      configFileInputRef.current.value = "";
    }
  };

  const filteredNodes = NODE_TYPES.filter((node) =>
    category === "all"
      ? node.category === selectedCategory
      : node.category === category
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6"> Toolbar </Typography>
        {category === "all" && (
          <Tabs
            value={selectedCategory}
            onChange={(_, newValue) => setSelectedCategory(newValue)}
            sx={{ ml: "auto" }}
          >
            <Tab label="Inbound" value="inbound" />
            <Tab label="Outbound" value="outbound" />
          </Tabs>
        )}
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          {onImportJson && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".json"
                onChange={handleFileChange}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleImportClick}
              >
                Import View
              </Button>
            </>
          )}
          {onExportJson && (
            <Button variant="contained" size="small" onClick={onExportJson}>
              Export View
            </Button>
          )}
          {onImportConfigJson && (
            <>
              <input
                type="file"
                ref={configFileInputRef}
                style={{ display: "none" }}
                accept=".json"
                onChange={handleConfigFileChange}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleConfigImportClick}
              >
                Import Config
              </Button>
            </>
          )}
          {onExportConfigJson && (
            <Button
              variant="contained"
              size="small"
              onClick={onExportConfigJson}
            >
              Export Config
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {filteredNodes.map((nodeType) => (
          <Button
            key={nodeType.type}
            variant="outlined"
            size="small"
            onClick={() =>
              handleAddNode(
                nodeType.type,
                nodeType.label,
                nodeType.category,
                nodeType.defaultConfig,
                nodeType.optional_fields
              )
            }
          >
            {nodeType.label}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};
