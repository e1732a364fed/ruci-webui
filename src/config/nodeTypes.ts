export interface NodeTypeConfig {
  type: string;
  label: string;
  category: "inbound" | "outbound";
  defaultConfig: Record<string, any>;
}

export function isStreamGenerator(
  type: string,
  category: "inbound" | "outbound"
): boolean {
  const type_lower = type.toLowerCase();
  if (category === "inbound") {
    return [
      "binddialer",
      "listener",
      "tcpoptlistener",
      "quic",
      "stdio",
      "fileio",
    ].includes(type_lower);
  }
  if (category === "outbound") {
    return ["direct", "optdirect", "optdialer", "stdio", "fileio"].includes(
      type_lower
    );
  }
  return false;
}

export function isStreamConsumer(
  type: string,
  category: "inbound" | "outbound"
): boolean {
  if (category === "outbound") {
    return ["blackhole"].includes(type.toLowerCase());
  }
  if (category === "inbound") {
    return ["echo"].includes(type.toLowerCase());
  }
  return false;
}

export const NODE_TYPES: NodeTypeConfig[] = [
  // Inbound Nodes
  {
    type: "Echo",
    label: "Echo",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Stdio",
    label: "Stdio",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Fileio",
    label: "File I/O",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "BindDialer",
    label: "Bind Dialer",
    category: "inbound",
    defaultConfig: {
      bind_addr: null,
      dial_addr: "",
      dns_client: null,
      in_auto_route: null,
      out_auto_route: null,
      ext: null,
    },
  },
  {
    type: "Listener",
    label: "Listener",
    category: "inbound",
    defaultConfig: {
      listen_addr: "0.0.0.0:10801",
      ext: null,
    },
  },
  {
    type: "TcpOptListener",
    label: "TCP Opt Listener",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Adder",
    label: "Adder",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Counter",
    label: "Counter",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Recorder",
    label: "Recorder",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "TLS",
    label: "TLS",
    category: "inbound",
    defaultConfig: {
      cert: "",
      key: "",
      alpn: ["h2", "http/1.1"],
    },
  },
  {
    type: "NativeTLS",
    label: "Native TLS",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "H2",
    label: "HTTP/2",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Http",
    label: "HTTP",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Socks5",
    label: "SOCKS5",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Socks5Http",
    label: "SOCKS5 HTTP",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Trojan",
    label: "Trojan",
    category: "inbound",
    defaultConfig: {
      password: "",
      more: null,
    },
  },
  {
    type: "HttpFilter",
    label: "HTTP Filter",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "WebSocket",
    label: "WebSocket",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Quic",
    label: "QUIC",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Stack",
    label: "Stack",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "SPE1",
    label: "SPE1",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "Lua",
    label: "Lua",
    category: "inbound",
    defaultConfig: {},
  },
  {
    type: "MITM",
    label: "MITM",
    category: "inbound",
    defaultConfig: {},
  },

  // Outbound Nodes
  {
    type: "Blackhole",
    label: "Blackhole",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "Direct",
    label: "Direct",
    category: "outbound",
    defaultConfig: {
      leak_target_addr: true,
      dns_client: null,
    },
  },
  {
    type: "Stdio",
    label: "Stdio",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "Fileio",
    label: "File I/O",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "BindDialer",
    label: "Bind Dialer",
    category: "outbound",
    defaultConfig: {
      bind_addr: null,
      dial_addr: "",
      dns_client: null,
      in_auto_route: null,
      out_auto_route: null,
      ext: null,
    },
  },
  {
    type: "Adder",
    label: "Adder",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "Counter",
    label: "Counter",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "Recorder",
    label: "Recorder",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "TLS",
    label: "TLS",
    category: "outbound",
    defaultConfig: {
      host: null,
      insecure: false,
      alpn: ["h2", "http/1.1"],
    },
  },
  {
    type: "OptDirect",
    label: "Opt Direct",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "OptDialer",
    label: "Opt Dialer",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "NativeTLS",
    label: "Native TLS",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "Http",
    label: "HTTP",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "Socks5",
    label: "SOCKS5",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "Trojan",
    label: "Trojan",
    category: "outbound",
    defaultConfig: {
      password: "",
      more: null,
    },
  },
  {
    type: "WebSocket",
    label: "WebSocket",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "H2Single",
    label: "H2 Single",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "H2Mux",
    label: "H2 Mux",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "Quic",
    label: "QUIC",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "SPE1",
    label: "SPE1",
    category: "outbound",
    defaultConfig: {},
  },
  {
    type: "Lua",
    label: "Lua",
    category: "outbound",
    defaultConfig: {},
  },
];
