import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Divider,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

interface FileStructure {
  files: string[];
  directories: Record<string, FileStructure>;
}

const ExamplesPanel: React.FC = () => {
  const [folderType, setFolderType] = useState<string>("lua_examples");
  const [fileStructure, setFileStructure] = useState<FileStructure | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    // 当文件夹类型改变时，获取该文件夹的文件结构
    const fetchFileStructure = async () => {
      try {
        const response = await fetch(`/${folderType}/index.json`);
        if (response.ok) {
          const structure = await response.json();
          setFileStructure(structure);
          setSelectedFile("");
          setSelectedPath("");
          setFileContent("");
          setExpandedDirs({});
        } else {
          console.error("Failed to fetch file structure");
          setFileStructure(null);
          setSelectedFile("");
          setSelectedPath("");
        }
      } catch (error) {
        console.error("Error fetching file structure:", error);
        setFileStructure(null);
        setSelectedFile("");
        setSelectedPath("");
      }
    };

    fetchFileStructure();
  }, [folderType]);

  useEffect(() => {
    // 当选择的文件改变时，获取文件内容
    if (selectedFile) {
      const fetchFileContent = async () => {
        try {
          // 修复路径拼接问题，处理根目录文件
          const fullPath = selectedPath
            ? `/${folderType}${selectedPath}/${selectedFile}`
            : `/${folderType}/${selectedFile}`;

          const response = await fetch(fullPath);
          if (response.ok) {
            const content = await response.text();
            setFileContent(content);
          } else {
            console.error(`Failed to fetch file content from ${fullPath}`);
            setFileContent("");
          }
        } catch (error) {
          console.error("Error fetching file content:", error);
          setFileContent("");
        }
      };

      fetchFileContent();
    } else {
      setFileContent("");
    }
  }, [selectedFile, selectedPath, folderType]);

  const handleFolderChange = (event: SelectChangeEvent) => {
    setFolderType(event.target.value);
    setSelectedFile("");
    setSelectedPath("");
    setFileContent("");
    setExpandedDirs({});
  };

  const handleFileSelect = (file: string, path: string) => {
    setSelectedFile(file);
    setSelectedPath(path);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(fileContent).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("无法复制内容: ", err);
      }
    );
  };

  const toggleDirectory = (path: string) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const getLanguage = () => {
    if (folderType === "lua_examples") return "lua";
    if (folderType === "json_examples") return "json";
    return "text";
  };

  // 递归渲染文件结构
  const renderFileStructure = (
    structure: FileStructure | null,
    currentPath: string = ""
  ) => {
    if (!structure) return null;

    return (
      <>
        {/* 渲染文件 */}
        {structure.files.map((file) => (
          <ListItem key={`${currentPath}/${file}`} disablePadding>
            <ListItemButton
              selected={selectedFile === file && selectedPath === currentPath}
              onClick={() => handleFileSelect(file, currentPath)}
              sx={{ pl: currentPath.split("/").length * 2 }}
            >
              <InsertDriveFileIcon sx={{ mr: 1 }} />
              <ListItemText primary={file} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* 渲染目录 */}
        {Object.entries(structure.directories).map(
          ([dirName, dirStructure]) => {
            const dirPath = `${currentPath}/${dirName}`;
            const isExpanded = expandedDirs[dirPath] || false;

            return (
              <React.Fragment key={dirPath}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => toggleDirectory(dirPath)}
                    sx={{ pl: currentPath.split("/").length * 2 }}
                  >
                    <FolderIcon sx={{ mr: 1 }} />
                    <ListItemText primary={dirName} />
                    <IconButton edge="end" size="small">
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </ListItemButton>
                </ListItem>
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {renderFileStructure(dirStructure, dirPath)}
                </Collapse>
              </React.Fragment>
            );
          }
        )}
      </>
    );
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box sx={{ p: 2, height: "100%" }}>
      <Typography variant="h5" gutterBottom>
        示例浏览器
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>选择文件夹</InputLabel>
            <Select
              value={folderType}
              label="选择文件夹"
              onChange={handleFolderChange}
            >
              <MenuItem value="lua_examples">Lua 示例</MenuItem>
              <MenuItem value="json_examples">JSON 示例</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyContent}
            disabled={!fileContent}
            color={copied ? "success" : "primary"}
            sx={{ mb: 2 }}
          >
            {copied ? "已复制" : "复制内容"}
          </Button>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={handleThemeToggle}
              icon={<LightModeIcon />}
              checkedIcon={<DarkModeIcon />}
            />
          }
          label={darkMode ? "深色模式" : "浅色模式"}
          sx={{ ml: 2 }}
        />
      </Box>

      <Grid container spacing={2} sx={{ height: "calc(100% - 150px)" }}>
        <Grid item xs={4}>
          <Paper
            elevation={3}
            sx={{
              height: "100%",
              overflow: "auto",
              p: 1,
            }}
          >
            <List dense component="nav">
              {renderFileStructure(fileStructure)}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Paper
            elevation={3}
            sx={{
              height: "100%",
              overflow: "auto",
              backgroundColor: darkMode ? "#1E1E1E" : "#f5f5f5",
            }}
          >
            {fileContent ? (
              <SyntaxHighlighter
                language={getLanguage()}
                style={darkMode ? vs2015 : docco}
                customStyle={{ margin: 0, height: "100%" }}
                wrapLongLines={true}
              >
                {fileContent}
              </SyntaxHighlighter>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                <Typography>
                  {!fileStructure ? "没有可用的文件" : "请选择一个文件查看内容"}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExamplesPanel;
