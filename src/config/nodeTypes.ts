export class Field {
  value: any;
  optional: boolean;

  constructor(value: any, optional: boolean = false) {
    this.value = value;
    this.optional = optional;
  }
}

// 创建必填字段的辅助函数
export function required(value: any): Field {
  return new Field(value, false);
}

// 创建可选字段的辅助函数
export function optional(value: any): Field {
  return new Field(value, true);
}

export class NodeTypeConfig {
  type: string;
  label: string;
  category: "inbound" | "outbound";
  defaultConfig: Record<string, Field>;

  constructor(
    type: string,
    label: string,
    category: "inbound" | "outbound",
    defaultConfig: Record<string, any>
  ) {
    this.type = type;
    this.label = label;
    this.category = category;
    this.defaultConfig = defaultConfig;
  }
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

export enum LookupIpStrategy {
  Ipv4Only = "Ipv4Only",
  Ipv6Only = "Ipv6Only",
  Ipv4AndIpv6 = "Ipv4AndIpv6",
  Ipv6thenIpv4 = "Ipv6thenIpv4",
  Ipv4thenIpv6 = "Ipv4thenIpv6",
}

export const ExtDefault = {
  fixed_target_addr: optional("fake.com:80"),
  pre_defined_early_data: optional("abc"),
};

export const BindDialerDefault = {
  bind_addr: optional("addr"),
  dial_addr: optional(""),
  dns_client: optional({
    dns_server_list: optional([]),
    ip_strategy: LookupIpStrategy.Ipv4Only,
    static_pairs: optional({}),
  }),
  in_auto_route: optional({
    tun_dev_name: "dev",
    tun_gateway: "gate",
    router_ip: "ip",
    original_dev_name: "od",
    direct_list: optional([]),
    dns_list: optional([]),
  }),
  out_auto_route: optional({
    tun_dev_name: "",
    original_dev_name: "",
    router_ip: "",
  }),
  ext: optional(ExtDefault),
};

export const RecorderDefault = {
  output_dir: optional(""),
  output_format: optional("ruci"),
  output_file_extension: optional("cbor"),
  record_mode: optional("full"),
  prettify: optional(false),
  label: optional("direct"),
  piece_truncate_option: optional("no-truncate"),
  session_truncate_option: optional("no-truncate"),
};

export const HttpCommonDefault = {
  method: optional("GET"),
  scheme: optional("https"),
  authority: "user@www.ruci.com:80",
  path: "/mypath",
  headers: optional({}),
  use_early_data: optional(false),
};

export const SoOptDefault = {
  bind_to_device: optional("en0"),
  so_mark: optional(255),
  tproxy: optional(false),
};

export const NODE_TYPES: NodeTypeConfig[] = [
  // Inbound Nodes
  new NodeTypeConfig("TproxyTcpResolver", "Tproxy Tcp Resolver", "inbound", {
    port: optional(0),
    route_ipv6: optional(false),
    proxy_local_udp_53: optional(false),
    auto_route: optional(false),
    auto_route_tcp: optional(false),
    local_net4: optional(""),
  }),
  new NodeTypeConfig("TproxyUdpListener", "Tproxy Udp Listener", "inbound", {
    listen_addr: "",
    sockopt: SoOptDefault,
    ext: ExtDefault,
  }),
  new NodeTypeConfig("Echo", "Echo", "inbound", {}),
  new NodeTypeConfig("Stdio", "Stdio", "inbound", {
    ext: optional(ExtDefault),
  }),
  new NodeTypeConfig("Fileio", "File I/O", "inbound", {
    i: required("test.crt"),
    o: required("testfile.txt"),
    sleep_interval: optional(500),
    bytes_per_turn: optional(10),
    ext: optional(ExtDefault),
  }),
  new NodeTypeConfig("BindDialer", "Bind Dialer", "inbound", BindDialerDefault),
  new NodeTypeConfig("Listener", "Listener", "inbound", {
    listen_addr: "0.0.0.0:10801",
    ext: optional(ExtDefault),
  }),
  new NodeTypeConfig("TcpOptListener", "TCP Opt Listener", "inbound", {
    listen_addr: "0.0.0.0:12345",
    sockopt: optional({
      tproxy: false,
    }),
    ext: optional(ExtDefault),
  }),
  new NodeTypeConfig("Adder", "Adder", "inbound", {
    value: 1,
  }),
  new NodeTypeConfig("Counter", "Counter", "inbound", {}),
  new NodeTypeConfig("Recorder", "Recorder", "inbound", RecorderDefault),
  new NodeTypeConfig("TLS", "TLS Server", "inbound", {
    cert: "",
    key: "",
    alpn: optional(["h2", "http/1.1"]),
  }),
  new NodeTypeConfig("NativeTLS", "Native TLS", "inbound", {
    cert: "",
    key: "",
    alpn: optional(["h2", "http/1.1"]),
  }),
  new NodeTypeConfig("H2", "HTTP/2", "inbound", {
    is_grpc: false,
    http_config: optional(HttpCommonDefault),
  }),
  new NodeTypeConfig("Http", "HTTP", "inbound", {
    userpass: optional(""),
    more: optional([]),
  }),
  new NodeTypeConfig("Socks5", "SOCKS5", "inbound", {
    userpass: optional(""),
    more: optional([]),
  }),
  new NodeTypeConfig("Socks5Http", "SOCKS5 HTTP", "inbound", {
    userpass: optional(""),
    more: optional([]),
  }),
  new NodeTypeConfig("Trojan", "Trojan", "inbound", {
    password: optional(""),
    more: optional([]),
  }),
  new NodeTypeConfig(
    "HttpFilter",
    "HTTP Filter",
    "inbound",
    optional(HttpCommonDefault)
  ),
  new NodeTypeConfig("WebSocket", "WebSocket", "inbound", {
    http_config: optional(HttpCommonDefault),
  }),
  new NodeTypeConfig("Quic", "QUIC", "inbound", {
    cert: "",
    key: "",
    alpn: optional(["h2", "http/1.1"]),
    listen_addr: "0.0.0.0:443",
  }),
  new NodeTypeConfig("StackLwip", "StackLwip", "inbound", {}),
  new NodeTypeConfig("StackSmoltcp", "StackSmoltcp", "inbound", {}),
  new NodeTypeConfig("SPE1", "SPE1", "inbound", {
    qa: optional([
      ["q1", "a1"],
      ["q2", "a2"],
    ]),
  }),
  new NodeTypeConfig("Lua", "Lua", "inbound", {
    file_name: "file.lua",
    handshake_function: "handshake_function",
  }),
  new NodeTypeConfig("MITM", "MITM", "inbound", {
    cert: "",
    key: "",
    alpn: optional(["h2", "http/1.1"]),
  }),
  new NodeTypeConfig("Embedder", "Embedder", "inbound", {
    file_name: "record.json",
  }),

  // Outbound Nodes
  new NodeTypeConfig("Blackhole", "Blackhole", "outbound", {}),
  new NodeTypeConfig("Direct", "Direct", "outbound", {
    leak_target_addr: optional(true),
    dns_client: optional({
      dns_server_list: optional([]),
      ip_strategy: optional("Ipv4Only"),
    }),
  }),
  new NodeTypeConfig("Stdio", "Stdio", "outbound", {
    write_mode: "UTF8",
    ext: optional(ExtDefault),
  }),
  new NodeTypeConfig("Fileio", "File I/O", "outbound", {
    i: "test.crt",
    o: "testfile.txt",
    sleep_interval: optional(500),
    bytes_per_turn: optional(10),
    ext: optional(ExtDefault),
  }),
  new NodeTypeConfig(
    "BindDialer",
    "Bind Dialer",
    "outbound",
    BindDialerDefault
  ),
  new NodeTypeConfig("Adder", "Adder", "outbound", { value: 1 }),
  new NodeTypeConfig("Counter", "Counter", "outbound", {}),
  new NodeTypeConfig("Recorder", "Recorder", "outbound", RecorderDefault),
  new NodeTypeConfig("TLS", "TLS Client", "outbound", {
    host: "",
    insecure: optional(false),
    alpn: optional(["h2", "http/1.1"]),
  }),
  new NodeTypeConfig("OptDirect", "Opt Direct", "outbound", {
    sockopt: optional({}),
    more_num_of_files: optional(false),
    dns_client: optional({}),
  }),
  new NodeTypeConfig("OptDialer", "Opt Dialer", "outbound", {}),
  new NodeTypeConfig("NativeTLS", "Native TLS", "outbound", {
    cert: "",
    key: "",
    alpn: optional(["h2", "http/1.1"]),
    insecure: optional(false),
  }),
  new NodeTypeConfig("Http", "HTTP", "outbound", {
    userpass: optional(""),
    ext: optional(ExtDefault),
  }),
  new NodeTypeConfig("Socks5", "SOCKS5", "outbound", {
    userpass: optional(""),
    early_data: optional(true),
    ext: optional(ExtDefault),
  }),
  new NodeTypeConfig("Trojan", "Trojan", "outbound", {
    password: optional(""),
    more: optional([]),
  }),
  new NodeTypeConfig("WebSocket", "WebSocket", "outbound", HttpCommonDefault),
  new NodeTypeConfig("H2Single", "H2 Single", "outbound", {
    is_grpc: false,
    http_config: optional(HttpCommonDefault),
  }),
  new NodeTypeConfig("H2Mux", "H2 Mux", "outbound", {
    is_grpc: false,
    http_config: optional(HttpCommonDefault),
  }),
  new NodeTypeConfig("Quic", "QUIC", "outbound", {
    server_addr: "",
    server_name: "",
  }),
  new NodeTypeConfig("SPE1", "SPE1", "outbound", { qa: optional(["q"]) }),
  new NodeTypeConfig("Lua", "Lua", "outbound", {
    file_name: "",
    handshake_function: "",
  }),
];

export enum WriteMode {
  UTF8 = "UTF8",
  Bytes = "Bytes",
}

export enum Protocol {
  Udp = "Udp",
  Tcp = "Tcp",
}

export enum OutputFileExtension {
  Json = "json",
  Cbor = "cbor",
}

export enum OutputFormat {
  Ruci = "ruci",
  Har = "har",
}

export enum RecordMode {
  Full = "full",
  Simplified = "simplified",
  Info = "info",
}

export enum PieceTruncateOption {
  NoTruncate = "no-truncate",
  PieceTruncate = "piece-truncate",
}

export enum SessionTruncateOption {
  NoTruncate = "no-truncate",
  SessionTruncate = "session-truncate",
}
