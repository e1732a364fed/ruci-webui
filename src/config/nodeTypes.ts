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
  ext: optional({
    fixed_target_addr: optional(""),
    pre_defined_early_data: optional("abc"),
  }),
  // xx: optional({ xx: optional({ xx: optional({ xx: optional(1) }) }) }),
};

export class Ext {
  fixed_target_addr?: string | null;
  pre_defined_early_data?: string | null;

  constructor(
    fixed_target_addr?: string | null,
    pre_defined_early_data?: string | null
  ) {
    this.fixed_target_addr = fixed_target_addr;
    this.pre_defined_early_data = pre_defined_early_data;
  }
}

export const ExtDefault = {
  fixed_target_addr: "fake.com:80",
  pre_defined_early_data: "abc",
} as Ext;

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

export const NODE_TYPES: NodeTypeConfig[] = [
  // Inbound Nodes
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
  } as Listener),
  new NodeTypeConfig("TcpOptListener", "TCP Opt Listener", "inbound", {
    listen_addr: "0.0.0.0:12345",
    sockopt: {
      tproxy: false,
    },
    ext: optional(ExtDefault),
  } as TcpOptListener),
  new NodeTypeConfig("Adder", "Adder", "inbound", {
    value: 1,
  } as any),
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
    http_config: optional({
      method: "GET",
      scheme: "https",
      authority: "user@www.ruci.com:80",
      path: "/mypath",
      headers: {},
      use_early_data: false,
    }),
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
    password: required(""),
    more: optional([]),
  }),
  new NodeTypeConfig("HttpFilter", "HTTP Filter", "inbound", {
    method: "GET",
    scheme: "https",
    authority: "user@www.ruci.com:80",
    path: "/mypath",
    headers: {},
    use_early_data: false,
  } as CommonConfig),
  new NodeTypeConfig("WebSocket", "WebSocket", "inbound", {
    http_config: {
      method: "GET",
      scheme: "https",
      authority: "user@www.ruci.com:80",
      path: "/mypath",
      headers: {},
      use_early_data: false,
    },
  } as WebSocket),
  new NodeTypeConfig("Quic", "QUIC", "inbound", {
    cert: "",
    key: "",
    alpn: ["h2", "http/1.1"],
    listen_addr: "0.0.0.0:443",
  } as QuicServerConfig),
  new NodeTypeConfig("Stack", "Stack", "inbound", {} as any),
  new NodeTypeConfig("SPE1", "SPE1", "inbound", {
    qa: [
      ["q1", "a1"],
      ["q2", "a2"],
    ],
  } as SPE1),
  new NodeTypeConfig("Lua", "Lua", "inbound", {
    file_name: "file.lua",
    handshake_function: "handshake_function",
  } as Lua),
  new NodeTypeConfig("MITM", "MITM", "inbound", {
    cert: "",
    key: "",
    alpn: optional(["h2", "http/1.1"]),
  }),
  new NodeTypeConfig("Embedder", "Embedder", "inbound", {
    file_name: "file.lua",
  } as Embedder),

  // Outbound Nodes
  new NodeTypeConfig("Blackhole", "Blackhole", "outbound", {} as any),
  new NodeTypeConfig("Direct", "Direct", "outbound", {
    leak_target_addr: true,
    dns_client: {
      dns_server_list: optional([]),
      ip_strategy: optional("Ipv4Only"),
    },
  }),
  new NodeTypeConfig("Stdio", "Stdio", "outbound", {
    write_mode: "UTF8",
    ext: ExtDefault,
  } as StdioConfig),
  new NodeTypeConfig("Fileio", "File I/O", "outbound", {
    i: "test.crt",
    o: "testfile.txt",
    sleep_interval: 500,
    bytes_per_turn: 10,
    ext: ExtDefault,
  } as FileConfig),
  new NodeTypeConfig(
    "BindDialer",
    "Bind Dialer",
    "outbound",
    BindDialerDefault
  ),
  new NodeTypeConfig("Adder", "Adder", "outbound", { value: 1 } as any),
  new NodeTypeConfig("Counter", "Counter", "outbound", {}),
  new NodeTypeConfig("Recorder", "Recorder", "outbound", RecorderDefault),
  new NodeTypeConfig("TLS", "TLS Client", "outbound", {
    host: "null",
    insecure: false,
    alpn: ["h2", "http/1.1"],
  } as TlsClientOptions),
  new NodeTypeConfig("OptDirect", "Opt Direct", "outbound", {
    sockopt: {},
    more_num_of_files: false,
    dns_client: {},
  } as OptDirect),
  new NodeTypeConfig(
    "OptDialer",
    "Opt Dialer",
    "outbound",
    {} as OptDialerOption
  ),
  new NodeTypeConfig("NativeTLS", "Native TLS", "outbound", {
    cert: "",
    key: "",
    alpn: ["h2", "http/1.1"],
    insecure: false,
  } as TlsClientOptions),
  new NodeTypeConfig("Http", "HTTP", "outbound", {
    userpass: "",
    ext: ExtDefault,
  }),
  new NodeTypeConfig("Socks5", "SOCKS5", "outbound", {
    userpass: "",
    early_data: true,
    ext: ExtDefault,
  } as Socks5Out),
  new NodeTypeConfig("Trojan", "Trojan", "outbound", {
    password: "",
    more: null,
  } as TrojanClientConfig),
  new NodeTypeConfig("WebSocket", "WebSocket", "outbound", {
    method: "",
    scheme: "",
    authority: "",
    path: "",
    headers: {},
    use_early_data: false,
  } as CommonConfig),
  new NodeTypeConfig("H2Single", "H2 Single", "outbound", {
    is_grpc: false,
    http_config: {},
  } as H2),
  new NodeTypeConfig("H2Mux", "H2 Mux", "outbound", {
    is_grpc: false,
    http_config: {},
  } as H2),
  new NodeTypeConfig("Quic", "QUIC", "outbound", {
    server_addr: "",
    server_name: "",
  } as QuicClientConfig),
  new NodeTypeConfig("SPE1", "SPE1", "outbound", { qa: optional(["q"]) }),
  new NodeTypeConfig("Lua", "Lua", "outbound", {
    file_name: "",
    handshake_function: "",
  } as Lua),
];

export class Listener {
  listen_addr: string;
  ext?: Ext;

  constructor(listen_addr: string, ext?: Ext) {
    this.listen_addr = listen_addr;
    this.ext = ext;
  }
}

export class OutAutoRouteParams {
  tun_dev_name?: string | null;
  original_dev_name?: string | null;
  router_ip?: string | null;

  constructor(
    tun_dev_name?: string | null,
    original_dev_name?: string | null,
    router_ip?: string | null
  ) {
    this.tun_dev_name = tun_dev_name;
    this.original_dev_name = original_dev_name;
    this.router_ip = router_ip;
  }
}

export class InAutoRouteParams {
  tun_dev_name?: string | null;
  tun_gateway?: string | null;
  router_ip?: string | null;
  original_dev_name?: string | null;
  direct_list?: string[] | null;
  dns_list?: string[] | null;

  constructor(
    tun_dev_name?: string | null,
    tun_gateway?: string | null,
    router_ip?: string | null,
    original_dev_name?: string | null,
    direct_list?: string[] | null,
    dns_list?: string[] | null
  ) {
    this.tun_dev_name = tun_dev_name;
    this.tun_gateway = tun_gateway;
    this.router_ip = router_ip;
    this.original_dev_name = original_dev_name;
    this.direct_list = direct_list;
    this.dns_list = dns_list;
  }
}

export class FileConfig {
  i: string;
  o: string;
  sleep_interval?: number | null;
  bytes_per_turn?: number | null;
  ext?: Ext;

  constructor(
    i: string,
    o: string,
    sleep_interval?: number | null,
    bytes_per_turn?: number | null,
    ext?: Ext
  ) {
    this.i = i;
    this.o = o;
    this.sleep_interval = sleep_interval;
    this.bytes_per_turn = bytes_per_turn;
    this.ext = ext;
  }
}

export class PlainTextPassSet {
  userpass?: string | null;
  more?: string[] | null;

  constructor(userpass?: string | null, more?: string[] | null) {
    this.userpass = userpass;
    this.more = more;
  }
}

export class OptDirect {
  sockopt: SockOpt;
  more_num_of_files?: boolean;
  dns_client?: DnsClientConfig;

  constructor(
    sockopt: SockOpt,
    more_num_of_files?: boolean,
    dns_client?: DnsClientConfig
  ) {
    this.sockopt = sockopt;
    this.more_num_of_files = more_num_of_files;
    this.dns_client = dns_client;
  }
}

export class Socks5Out {
  userpass?: string | null;
  early_data?: boolean | null;
  ext?: Ext;

  constructor(
    userpass?: string | null,
    early_data?: boolean | null,
    ext?: Ext
  ) {
    this.userpass = userpass;
    this.early_data = early_data;
    this.ext = ext;
  }
}

export class TcpOptListener {
  listen_addr: string;
  sockopt: SockOpt;
  ext?: Ext;

  constructor(listen_addr: string, sockopt: SockOpt, ext?: Ext) {
    this.listen_addr = listen_addr;
    this.sockopt = sockopt;
    this.ext = ext;
  }
}

export class H2 {
  is_grpc?: boolean;
  http_config?: CommonConfig;

  constructor(is_grpc?: boolean, http_config?: CommonConfig) {
    this.is_grpc = is_grpc;
    this.http_config = http_config;
  }
}

export class WebSocket {
  http_config?: CommonConfig;

  constructor(http_config?: CommonConfig) {
    this.http_config = http_config;
  }
}

export class TrojanPassSet {
  password?: string | null;
  more?: string[] | null;

  constructor(password?: string | null, more?: string[] | null) {
    this.password = password;
    this.more = more;
  }
}

export class TrojanClientConfig {
  password?: string | null;
  do_not_use_early_data?: boolean | null;

  constructor(
    password?: string | null,
    do_not_use_early_data?: boolean | null
  ) {
    this.password = password;
    this.do_not_use_early_data = do_not_use_early_data;
  }
}

export class StdioConfig {
  write_mode?: WriteMode | null;
  ext?: Ext;

  constructor(write_mode?: WriteMode | null, ext?: Ext) {
    this.write_mode = write_mode;
    this.ext = ext;
  }
}

export enum WriteMode {
  UTF8 = "UTF8",
  Bytes = "Bytes",
}

export class DirectConfig {
  leak_target_addr?: boolean | null;
  dns_client?: DnsClientConfig;

  constructor(leak_target_addr?: boolean | null, dns_client?: DnsClientConfig) {
    this.leak_target_addr = leak_target_addr;
    this.dns_client = dns_client;
  }
}

export class DnsClientConfig {
  dns_server_list?: [string, string][];
  ip_strategy?: LookupIpStrategy | null;
  static_pairs?: Record<string, string>;

  constructor(
    dns_server_list?: [string, string][],
    ip_strategy?: LookupIpStrategy | null,
    static_pairs?: Record<string, string>
  ) {
    this.dns_server_list = dns_server_list;
    this.ip_strategy = ip_strategy;
    this.static_pairs = static_pairs;
  }
}

export class SPE1 {
  qa?: [string, string][];

  constructor(qa?: [string, string][]) {
    this.qa = qa;
  }
}

export class Lua {
  file_name: string;
  handshake_function: string;

  constructor(file_name: string, handshake_function: string) {
    this.file_name = file_name;
    this.handshake_function = handshake_function;
  }
}

export class Embedder {
  file_name: string;

  constructor(file_name: string) {
    this.file_name = file_name;
  }
}

export enum Protocol {
  Udp = "Udp",
  Tcp = "Tcp",
}

export class SockOpt {
  tproxy?: boolean | null;
  so_mark?: number | null;
  bind_to_device?: string | null;

  constructor(
    tproxy?: boolean | null,
    so_mark?: number | null,
    bind_to_device?: string | null
  ) {
    this.tproxy = tproxy;
    this.so_mark = so_mark;
    this.bind_to_device = bind_to_device;
  }
}

export class OptDialerOption {
  dial_addr: string;
  sockopt: SockOpt;
  dns_client?: DnsClientConfig;

  constructor(
    dial_addr: string,
    sockopt: SockOpt,
    dns_client?: DnsClientConfig
  ) {
    this.dial_addr = dial_addr;
    this.sockopt = sockopt;
    this.dns_client = dns_client;
  }
}

export class TproxyOptions {
  port?: number | null;
  route_ipv6?: boolean | null;
  proxy_local_udp_53?: boolean | null;
  local_net4?: string | null;
  auto_route?: boolean | null;
  auto_route_tcp?: boolean | null;

  constructor(
    port?: number | null,
    route_ipv6?: boolean | null,
    proxy_local_udp_53?: boolean | null,
    local_net4?: string | null,
    auto_route?: boolean | null,
    auto_route_tcp?: boolean | null
  ) {
    this.port = port;
    this.route_ipv6 = route_ipv6;
    this.proxy_local_udp_53 = proxy_local_udp_53;
    this.local_net4 = local_net4;
    this.auto_route = auto_route;
    this.auto_route_tcp = auto_route_tcp;
  }
}

export class RecorderConfig {
  label?: string | null;
  output_dir?: string | null;
  output_file_extension?: OutputFileExtension | null;
  output_format?: OutputFormat | null;
  record_mode?: RecordMode | null;
  prettify?: boolean | null;
  piece_truncate_option?: PieceTruncateOption | null;
  session_truncate_option?: SessionTruncateOption | null;

  constructor(
    label?: string | null,
    output_dir?: string | null,
    output_file_extension?: OutputFileExtension | null,
    output_format?: OutputFormat | null,
    record_mode?: RecordMode | null,
    prettify?: boolean | null,
    piece_truncate_option?: PieceTruncateOption | null,
    session_truncate_option?: SessionTruncateOption | null
  ) {
    this.label = label;
    this.output_dir = output_dir;
    this.output_file_extension = output_file_extension;
    this.output_format = output_format;
    this.record_mode = record_mode;
    this.prettify = prettify;
    this.piece_truncate_option = piece_truncate_option;
    this.session_truncate_option = session_truncate_option;
  }
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

export class CommonConfig {
  method?: string | null;
  scheme?: string | null;
  authority: string;
  path: string;
  headers?: Record<string, string> | null;
  use_early_data?: boolean | null;

  constructor(
    authority: string,
    path: string,
    method?: string | null,
    scheme?: string | null,
    headers?: Record<string, string> | null,
    use_early_data?: boolean | null
  ) {
    this.method = method;
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.headers = headers;
    this.use_early_data = use_early_data;
  }
}

export class TlsServerOptions {
  cert: string;
  key: string;
  alpn?: string[] | null;

  constructor(cert: string, key: string, alpn?: string[] | null) {
    this.cert = cert;
    this.key = key;
    this.alpn = alpn;
  }
}

export class TlsClientOptions {
  host?: string | null;
  insecure: boolean;
  alpn?: string[] | null;
  cert?: string | null;

  constructor(
    insecure: boolean,
    host?: string | null,
    alpn?: string[] | null,
    cert?: string | null
  ) {
    this.host = host;
    this.insecure = insecure;
    this.alpn = alpn;
    this.cert = cert;
  }
}

export class TrojanConfig {
  password?: string | null;
  more?: string[] | null;

  constructor(password?: string | null, more?: string[] | null) {
    this.password = password;
    this.more = more;
  }
}

export class QuicServerConfig {
  key: string;
  cert: string;
  listen_addr: string;
  alpn?: string[] | null;

  constructor(
    key: string,
    cert: string,
    listen_addr: string,
    alpn?: string[] | null
  ) {
    this.key = key;
    this.cert = cert;
    this.listen_addr = listen_addr;
    this.alpn = alpn;
  }
}

export class QuicClientConfig {
  server_addr: string;
  server_name: string;
  cert?: string | null;
  alpn?: string[] | null;
  insecure?: boolean | null;

  constructor(
    server_addr: string,
    server_name: string,
    cert?: string | null,
    alpn?: string[] | null,
    insecure?: boolean | null
  ) {
    this.server_addr = server_addr;
    this.server_name = server_name;
    this.cert = cert;
    this.alpn = alpn;
    this.insecure = insecure;
  }
}
