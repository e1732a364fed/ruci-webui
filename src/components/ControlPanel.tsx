import { useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";

interface ControlPanelProps {}

const ControlPanel = ({}: ControlPanelProps) => {
  const [apiUrl, setApiUrl] = useState<string>("http://127.0.0.1:40681/api");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [configFileName, setConfigFileName] = useState<string>("");
  const [configFileContent, setConfigFileContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setConfigFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setConfigFileContent(content);
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const checkStatus = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    setStatusError(false);

    try {
      const response = await fetch(`${apiUrl}/status`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMessage(`服务器状态: ${JSON.stringify(data)}`);
        setStatusError(false);
      } else {
        setStatusMessage(`错误: ${response.status} ${response.statusText}`);
        setStatusError(true);
      }
    } catch (error) {
      setStatusMessage(
        `连接错误: ${error instanceof Error ? error.message : String(error)}`
      );
      setStatusError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const startEngine = async () => {
    if (!configFileContent) {
      setStatusMessage("请先选择配置文件");
      setStatusError(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setStatusError(false);

    try {
      const response = await fetch(`${apiUrl}/engine/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "Chain",
          config_file_name: configFileName,
          config_file_content: configFileContent,
          infinite: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMessage(`引擎启动成功: ${JSON.stringify(data)}`);
        setStatusError(false);
      } else {
        setStatusMessage(`启动错误: ${response.status} ${response.statusText}`);
        setStatusError(true);
      }
    } catch (error) {
      setStatusMessage(
        `连接错误: ${error instanceof Error ? error.message : String(error)}`
      );
      setStatusError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const stopEngine = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    setStatusError(false);

    try {
      const response = await fetch(`${apiUrl}/engine/stop`, {
        method: "GET",
      });

      if (response.ok) {
        const statusCode = await response.text();
        const numericStatus = parseInt(statusCode, 10);
        setStatusMessage(`引擎停止成功: ${numericStatus}`);
        setStatusError(false);
      } else {
        setStatusMessage(`停止错误: ${response.status} ${response.statusText}`);
        setStatusError(true);
      }
    } catch (error) {
      setStatusMessage(
        `连接错误: ${error instanceof Error ? error.message : String(error)}`
      );
      setStatusError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, height: "100%" }}>
      <Typography variant="h5" gutterBottom>
        控制面板
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              API 服务器设置
            </Typography>
            <TextField
              fullWidth
              label="API 服务器 URL"
              variant="outlined"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={checkStatus}
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              检查服务器状态
              {isLoading && (
                <CircularProgress size={24} sx={{ ml: 1, color: "white" }} />
              )}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              配置文件
            </Typography>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".json"
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              onClick={handleImportClick}
              sx={{ mr: 2 }}
            >
              选择配置文件
            </Button>
            {configFileName && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                已选择: {configFileName}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              引擎控制
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={startEngine}
                disabled={isLoading || !configFileContent}
              >
                启动引擎
                {isLoading && (
                  <CircularProgress size={24} sx={{ ml: 1, color: "white" }} />
                )}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={stopEngine}
                disabled={isLoading}
              >
                停止引擎
                {isLoading && (
                  <CircularProgress size={24} sx={{ ml: 1, color: "white" }} />
                )}
              </Button>
            </Box>
          </Grid>

          {statusMessage && (
            <Grid item xs={12}>
              <Alert severity={statusError ? "error" : "success"}>
                {statusMessage}
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ControlPanel;
