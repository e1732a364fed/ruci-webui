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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";

interface ControlPanelProps {}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ControlPanel = ({}: ControlPanelProps) => {
  const [apiUrl, setApiUrl] = useState<string>("http://127.0.0.1:40681/api");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [configFileName, setConfigFileName] = useState<string>("");
  const [configFileContent, setConfigFileContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValue, setTabValue] = useState(0);

  // New states for utility functions
  const [convertInputFileName, setConvertInputFileName] = useState<string>("");
  const [convertInputContent, setConvertInputContent] = useState<string>("");
  const [convertOutputFormat, setConvertOutputFormat] =
    useState<string>("json");
  const [certificateName, setCertificateName] = useState<string>("");
  const [qrText, setQrText] = useState<string>("");
  const [trojanPassword, setTrojanPassword] = useState<string>("");
  const [qrResult, setQrResult] = useState<string>("");

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  // Utility functions
  const convertFormatByContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/utils/convert_format/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_file_name: convertInputFileName,
          input_file_content: convertInputContent,
          output_format: convertOutputFormat,
        }),
      });

      const result = await response.text();
      setStatusMessage(`格式转换成功: ${result}`);
      setStatusError(false);
    } catch (error) {
      setStatusMessage(
        `格式转换错误: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setStatusError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResource = async (resource: "mmdb" | "webui" | "wintun") => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/utils/download/${resource}`, {
        method: "GET",
      });

      const result = await response.text();
      setStatusMessage(`下载${resource}成功: ${result}`);
      setStatusError(false);
    } catch (error) {
      setStatusMessage(
        `下载${resource}错误: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setStatusError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCertificate = async (type: "ca" | "normal") => {
    if (!certificateName) {
      setStatusMessage("请输入证书名称");
      setStatusError(true);
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        type === "ca" ? "generate_ca_certificate" : "generate_certificate";
      const response = await fetch(
        `${apiUrl}/utils/${endpoint}/${certificateName}`,
        {
          method: "GET",
        }
      );

      const result = await response.text();
      setStatusMessage(`生成${type === "ca" ? "CA" : ""}证书成功: ${result}`);
      setStatusError(false);
    } catch (error) {
      setStatusMessage(
        `生成证书错误: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setStatusError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!qrText) {
      setStatusMessage("请输入要生成二维码的文本");
      setStatusError(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/utils/qr/${encodeURIComponent(qrText)}`,
        {
          method: "GET",
        }
      );

      const result = await response.text();
      console.log(result);
      setQrResult(result);
      setStatusMessage("二维码生成成功");
      setStatusError(false);
    } catch (error) {
      setStatusMessage(
        `生成二维码错误: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setStatusError(true);
      setQrResult("");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTrojanHash = async () => {
    if (!trojanPassword) {
      setStatusMessage("请输入Trojan密码");
      setStatusError(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/utils/trojan_hash/${encodeURIComponent(trojanPassword)}`,
        {
          method: "GET",
        }
      );

      const result = await response.text();
      setStatusMessage(`计算Trojan哈希成功: ${result}`);
      setStatusError(false);
    } catch (error) {
      setStatusMessage(
        `计算Trojan哈希错误: ${
          error instanceof Error ? error.message : String(error)
        }`
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
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="基本控制" />
        <Tab label="工具" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
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
                    <CircularProgress
                      size={24}
                      sx={{ ml: 1, color: "white" }}
                    />
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
                    <CircularProgress
                      size={24}
                      sx={{ ml: 1, color: "white" }}
                    />
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
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                格式转换
              </Typography>
              <TextField
                fullWidth
                label="输入文件名"
                variant="outlined"
                value={convertInputFileName}
                onChange={(e) => setConvertInputFileName(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="输入内容"
                variant="outlined"
                multiline
                rows={4}
                value={convertInputContent}
                onChange={(e) => setConvertInputContent(e.target.value)}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>输出格式</InputLabel>
                <Select
                  value={convertOutputFormat}
                  label="输出格式"
                  onChange={(e) => setConvertOutputFormat(e.target.value)}
                >
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="toml">LUA</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={convertFormatByContent}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                转换格式
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                下载资源
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => downloadResource("mmdb")}
                  disabled={isLoading}
                >
                  下载 MMDB
                </Button>
                <Button
                  variant="contained"
                  onClick={() => downloadResource("webui")}
                  disabled={isLoading}
                >
                  下载 WebUI
                </Button>
                <Button
                  variant="contained"
                  onClick={() => downloadResource("wintun")}
                  disabled={isLoading}
                >
                  下载 Wintun
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                证书生成
              </Typography>
              <TextField
                fullWidth
                label="证书名称"
                variant="outlined"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
                margin="normal"
              />
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => generateCertificate("ca")}
                  disabled={isLoading}
                >
                  生成 CA 证书
                </Button>
                <Button
                  variant="contained"
                  onClick={() => generateCertificate("normal")}
                  disabled={isLoading}
                >
                  生成普通证书
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                二维码生成
              </Typography>
              <TextField
                fullWidth
                label="文本内容"
                variant="outlined"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                margin="normal"
              />
              {qrResult && (
                <TextField
                  fullWidth
                  label="二维码结果"
                  variant="outlined"
                  value={qrResult}
                  multiline
                  rows={20}
                  InputProps={{
                    readOnly: true,
                    style: {
                      fontFamily: "monospace",
                      lineHeight: "1",
                    },
                  }}
                  margin="normal"
                />
              )}
              <Button
                variant="contained"
                onClick={generateQRCode}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                生成二维码
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Trojan 哈希计算
              </Typography>
              <TextField
                fullWidth
                label="Trojan 密码"
                variant="outlined"
                value={trojanPassword}
                onChange={(e) => setTrojanPassword(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={calculateTrojanHash}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                计算哈希
              </Button>
            </Grid>
          </Grid>

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {statusMessage && (
            <Alert severity={statusError ? "error" : "success"} sx={{ mt: 2 }}>
              {" "}
              {statusMessage}
            </Alert>
          )}
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default ControlPanel;
