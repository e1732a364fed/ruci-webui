import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

import packageJson from "../../package.json";

const WelcomeInfo: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ height: "100%", p: 3 }}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AccountTreeIcon sx={{ fontSize: 100, color: "primary.main", mb: 3 }} />
        <Typography variant="h4" gutterBottom>
          Welcome to Ruci WebUI
        </Typography>

        <Typography
          variant="body1"
          align="center"
          sx={{ maxWidth: "600px", mb: 4 }}
        >
          Control Panel: connect to ruci api server and control ruci. <br />
          Node Editor: Use the Chain Editor to create and connect inbound and
          outbound chains, and the Route Editor to define routing rules.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          version: {packageJson.version}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <a href="https://github.com/e1732a364fed/ruci-webui/">source code</a>
        </Typography>
      </Box>
    </Paper>
  );
};

export default WelcomeInfo;
