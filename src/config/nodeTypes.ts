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

export const BindDialerDefault = {
  bind_addr: "null",
  dial_addr: "",
  dns_client: {
    dns_server_list: [],
    ip_strategy: "Ipv4Only",
    static_pairs: { a: "b" },
  },
  in_auto_route: {
    tun_dev_name: "dev",
    tun_gateway: "gate",
    router_ip: "ip",
    original_dev_name: "od",
    direct_list: [],
    dns_list: [],
  },
  out_auto_route: {
    tun_dev_name: "",
    original_dev_name: "",
    router_ip: "",
  },
  ext: {
    fixed_target_addr: "",
    pre_defined_early_data: "abc",
  },
} as BindDialerConfig;

export const NODE_TYPES: NodeTypeConfig[] = [
  // Inbound Nodes
  {
    type: "Echo",
    label: "Echo",
    category: "inbound",
    defaultConfig: {} as any,
  },
  {
    type: "Stdio",
    label: "Stdio",
    category: "inbound",
    defaultConfig: {
      ext: { pre_defined_early_data: "" },
    } as StdioConfig,
  },
  {
    type: "Fileio",
    label: "File I/O",
    category: "inbound",
    defaultConfig: {
      i: "test.crt",
      o: "testfile.txt",
      sleep_interval: 500,
      bytes_per_turn: 10,
      ext: { fixed_target_addr: "fake.com:80" },
    } as FileConfig,
  },
  {
    type: "BindDialer",
    label: "Bind Dialer",
    category: "inbound",
    defaultConfig: BindDialerDefault,
  },
  {
    type: "Listener",
    label: "Listener",
    category: "inbound",
    defaultConfig: {
      listen_addr: "0.0.0.0:10801",
      ext: {
        fixed_target_addr: "",
        pre_defined_early_data: "abc",
      },
    } as Listener,
  },
  {
    type: "TcpOptListener",
    label: "TCP Opt Listener",
    category: "inbound",
    defaultConfig: {
      listen_addr: "0.0.0.0:12345",
      sockopt: {
        tproxy: false,
      },
    } as TcpOptListener,
  },
  {
    type: "Adder",
    label: "Adder",
    category: "inbound",
    defaultConfig: {
      value: 1,
    } as any,
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
    defaultConfig: {
      output_dir: "",
      output_format: "ruci",
      output_file_extension: "cbor",
      record_mode: "full",
      prettify: false,
      label: "direct",
      piece_truncate_option: "no-truncate",
      session_truncate_option: "no-truncate",
    } as RecorderConfig,
  },
  {
    type: "TLS",
    label: "TLS Server",
    category: "inbound",
    defaultConfig: {
      cert: "",
      key: "",
      alpn: ["h2", "http/1.1"],
    } as TlsServerOptions,
  },
  {
    type: "NativeTLS",
    label: "Native TLS",
    category: "inbound",
    defaultConfig: {
      cert: "",
      key: "",
      alpn: ["h2", "http/1.1"],
    } as TlsServerOptions,
  },
  {
    type: "H2",
    label: "HTTP/2",
    category: "inbound",
    defaultConfig: {
      is_grpc: false,
      http_config: {
        method: "GET",
        scheme: "https",
        authority: "user@www.ruci.com:80",
        path: "/mypath",
        headers: {},
        use_early_data: false,
      },
    } as H2,
  },
  {
    type: "Http",
    label: "HTTP",
    category: "inbound",
    defaultConfig: {
      userpass: "",
      more: [],
    } as PlainTextPassSet,
  },
  {
    type: "Socks5",
    label: "SOCKS5",
    category: "inbound",
    defaultConfig: {
      userpass: "",
      more: [],
    } as PlainTextPassSet,
  },
  {
    type: "Socks5Http",
    label: "SOCKS5 HTTP",
    category: "inbound",
    defaultConfig: {
      userpass: "",
      more: [],
    } as PlainTextPassSet,
  },
  {
    type: "Trojan",
    label: "Trojan",
    category: "inbound",
    defaultConfig: {
      password: "",
      more: [],
    } as TrojanConfig,
  },
  {
    type: "HttpFilter",
    label: "HTTP Filter",
    category: "inbound",
    defaultConfig: {
      method: "GET",
      scheme: "https",
      authority: "user@www.ruci.com:80",
      path: "/mypath",
      headers: {},
      use_early_data: false,
    } as CommonConfig,
  },
  {
    type: "WebSocket",
    label: "WebSocket",
    category: "inbound",
    defaultConfig: {
      http_config: {
        method: "GET",
        scheme: "https",
        authority: "user@www.ruci.com:80",
        path: "/mypath",
        headers: {},
        use_early_data: false,
      },
    } as WebSocket,
  },
  {
    type: "Quic",
    label: "QUIC",
    category: "inbound",
    defaultConfig: {
      cert: "",
      key: "",
      alpn: ["h2", "http/1.1"],
      listen_addr: "0.0.0.0:443",
    } as QuicServerConfig,
  },
  {
    type: "Stack",
    label: "Stack",
    category: "inbound",
    defaultConfig: {} as any,
  },
  {
    type: "SPE1",
    label: "SPE1",
    category: "inbound",
    defaultConfig: {
      qa: [
        ["q1", "a1"],
        ["q2", "a2"],
      ],
    } as SPE1,
  },
  {
    type: "Lua",
    label: "Lua",
    category: "inbound",
    defaultConfig: {
      file_name: "file.lua",
      handshake_function: "handshake_function",
    } as Lua,
  },
  {
    type: "MITM",
    label: "MITM",
    category: "inbound",
    defaultConfig: {
      cert: "",
      key: "",
      alpn: ["h2", "http/1.1"],
    } as TlsServerOptions,
  },
  {
    type: "Embedder",
    label: "Embedder",
    category: "inbound",
    defaultConfig: {
      file_name: "file.lua",
    } as Embedder,
  },

  // Outbound Nodes
  {
    type: "Blackhole",
    label: "Blackhole",
    category: "outbound",
    defaultConfig: {} as any,
  },
  {
    type: "Direct",
    label: "Direct",
    category: "outbound",
    defaultConfig: {
      leak_target_addr: true,
      dns_client: {
        dns_server_list: [],
        ip_strategy: "Ipv4Only",
      },
    } as DirectConfig,
  },
  {
    type: "Stdio",
    label: "Stdio",
    category: "outbound",
    defaultConfig: {
      write_mode: "UTF8",
      ext: {},
    } as StdioConfig,
  },
  {
    type: "Fileio",
    label: "File I/O",
    category: "outbound",
    defaultConfig: {
      i: "test.crt",
      o: "testfile.txt",
      sleep_interval: 500,
      bytes_per_turn: 10,
      ext: { fixed_target_addr: "fake.com:80" },
    } as FileConfig,
  },
  {
    type: "BindDialer",
    label: "Bind Dialer",
    category: "outbound",
    defaultConfig: BindDialerDefault,
  },
  {
    type: "Adder",
    label: "Adder",
    category: "outbound",
    defaultConfig: { value: 1 } as any,
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
    defaultConfig: {} as RecorderConfig,
  },
  {
    type: "TLS",
    label: "TLS Client",
    category: "outbound",
    defaultConfig: {
      host: null,
      insecure: false,
      alpn: ["h2", "http/1.1"],
    } as TlsClientOptions,
  },
  {
    type: "OptDirect",
    label: "Opt Direct",
    category: "outbound",
    defaultConfig: {} as OptDirect,
  },
  {
    type: "OptDialer",
    label: "Opt Dialer",
    category: "outbound",
    defaultConfig: {} as OptDialerOption,
  },
  {
    type: "NativeTLS",
    label: "Native TLS",
    category: "outbound",
    defaultConfig: {} as TlsClientOptions,
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
    defaultConfig: {} as Socks5Out,
  },
  {
    type: "Trojan",
    label: "Trojan",
    category: "outbound",
    defaultConfig: {
      password: "",
      more: null,
    } as TrojanClientConfig,
  },
  {
    type: "WebSocket",
    label: "WebSocket",
    category: "outbound",
    defaultConfig: {} as CommonConfig,
  },
  {
    type: "H2Single",
    label: "H2 Single",
    category: "outbound",
    defaultConfig: {} as H2,
  },
  {
    type: "H2Mux",
    label: "H2 Mux",
    category: "outbound",
    defaultConfig: {} as H2,
  },
  {
    type: "Quic",
    label: "QUIC",
    category: "outbound",
    defaultConfig: {
      server_addr: "f",
      server_name: "a",
    } as QuicClientConfig,
  },
  {
    type: "SPE1",
    label: "SPE1",
    category: "outbound",
    defaultConfig: {} as SPE1,
  },
  {
    type: "Lua",
    label: "Lua",
    category: "outbound",
    defaultConfig: {
      file_name: "",
      handshake_function: "",
    } as Lua,
  },
];

export interface BindDialerConfig {
  bind_addr?: string | null;
  dial_addr?: string | null;
  dns_client?: DnsClientConfig | null;
  in_auto_route?: InAutoRouteParams | null;
  out_auto_route?: OutAutoRouteParams | null;
  ext?: Ext | null;
}

export interface Listener {
  listen_addr: string;
  ext?: Ext;
}

export interface Ext {
  fixed_target_addr?: string | null;
  pre_defined_early_data?: string | null;
}

export interface OutAutoRouteParams {
  tun_dev_name?: string | null;
  original_dev_name?: string | null;
  router_ip?: string | null;
}

export interface InAutoRouteParams {
  tun_dev_name?: string | null;
  tun_gateway?: string | null;
  router_ip?: string | null;
  original_dev_name?: string | null;
  direct_list?: string[] | null;
  dns_list?: string[] | null;
}

export interface FileConfig {
  i: string;
  o: string;
  sleep_interval?: number | null;
  bytes_per_turn?: number | null;
  ext?: Ext;
}

export interface PlainTextPassSet {
  userpass?: string | null;
  more?: string[] | null;
}

export interface OptDirect {
  sockopt: SockOpt;
  more_num_of_files?: boolean;
  dns_client?: DnsClientConfig;
}

export interface Socks5Out {
  userpass?: string | null;
  early_data?: boolean | null;
  ext?: Ext;
}

export interface TcpOptListener {
  listen_addr: string;
  sockopt: SockOpt;
  ext?: Ext;
}

export interface H2 {
  is_grpc?: boolean;
  http_config?: CommonConfig;
}

export interface WebSocket {
  http_config?: CommonConfig;
}

export interface TrojanPassSet {
  password?: string | null;
  more?: string[] | null;
}

export interface TrojanClientConfig {
  password?: string | null;
  do_not_use_early_data?: boolean | null;
}

export interface StdioConfig {
  write_mode?: WriteMode | null;
  ext?: Ext;
}

export enum WriteMode {
  UTF8 = "UTF8",
  Bytes = "Bytes",
}

export interface DirectConfig {
  leak_target_addr?: boolean | null;
  dns_client?: DnsClientConfig;
}

export interface DnsClientConfig {
  dns_server_list?: [string, string][];
  ip_strategy?: LookupIpStrategy | null;
  static_pairs?: Record<string, string>;
}

export interface SPE1 {
  qa?: [string, string][];
}

export interface Lua {
  file_name: string;
  handshake_function: string;
}

export interface Embedder {
  file_name: string;
}

export enum Protocol {
  Udp = "Udp",
  Tcp = "Tcp",
}

export enum LookupIpStrategy {
  Ipv4Only = "Ipv4Only",
  Ipv6Only = "Ipv6Only",
  Ipv4AndIpv6 = "Ipv4AndIpv6",
  Ipv6thenIpv4 = "Ipv6thenIpv4",
  Ipv4thenIpv6 = "Ipv4thenIpv6",
}

export interface SockOpt {
  tproxy?: boolean | null;
  so_mark?: number | null;
  bind_to_device?: string | null;
}

export interface OptDialerOption {
  dial_addr: string;
  sockopt: SockOpt;
  dns_client?: DnsClientConfig;
}

export interface TproxyOptions {
  port?: number | null;
  route_ipv6?: boolean | null;
  proxy_local_udp_53?: boolean | null;
  local_net4?: string | null;
  auto_route?: boolean | null;
  auto_route_tcp?: boolean | null;
}

export interface RecorderConfig {
  label?: string | null;
  output_dir?: string | null;
  output_file_extension?: OutputFileExtension | null;
  output_format?: OutputFormat | null;
  record_mode?: RecordMode | null;
  prettify?: boolean | null;
  piece_truncate_option?: PieceTruncateOption | null;
  session_truncate_option?: SessionTruncateOption | null;
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

export interface CommonConfig {
  method?: string | null;
  scheme?: string | null;
  authority: string;
  path: string;
  headers?: Record<string, string> | null;
  use_early_data?: boolean | null;
}

export interface TlsServerOptions {
  cert: string;
  key: string;
  alpn?: string[] | null;
}

export interface TlsClientOptions {
  host?: string | null;
  insecure: boolean;
  alpn?: string[] | null;
  cert?: string | null;
}

export interface TrojanConfig {
  password?: string | null;
  more?: string[] | null;
}

export interface QuicServerConfig {
  key: string;
  cert: string;
  listen_addr: string;
  alpn?: string[] | null;
}

export interface QuicClientConfig {
  server_addr: string;
  server_name: string;
  cert?: string | null;
  alpn?: string[] | null;
  insecure?: boolean | null;
}
