export class NodeTypeConfig {
  type: string;
  label: string;
  category: "inbound" | "outbound";
  defaultConfig: Record<string, any>;

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

export class BindDialerConfig {
  bind_addr?: string;
  dial_addr?: string;
  dns_client?: DnsClientConfig | null;
  in_auto_route?: InAutoRouteParams | null;
  out_auto_route?: OutAutoRouteParams | null;
  ext?: Ext | null;

  constructor(
    bind_addr?: string,
    dial_addr?: string,
    dns_client?: DnsClientConfig | null,
    in_auto_route?: InAutoRouteParams | null,
    out_auto_route?: OutAutoRouteParams | null,
    ext?: Ext | null
  ) {
    this.bind_addr = bind_addr;
    this.dial_addr = dial_addr;
    this.dns_client = dns_client;
    this.in_auto_route = in_auto_route;
    this.out_auto_route = out_auto_route;
    this.ext = ext;
  }
}

export const BindDialerDefault = new BindDialerConfig(
  "addr",
  "",
  {
    dns_server_list: [],
    ip_strategy: LookupIpStrategy.Ipv4Only,
    static_pairs: {},
  },
  {
    tun_dev_name: "dev",
    tun_gateway: "gate",
    router_ip: "ip",
    original_dev_name: "od",
    direct_list: [],
    dns_list: [],
  },
  {
    tun_dev_name: "",
    original_dev_name: "",
    router_ip: "",
  },
  {
    fixed_target_addr: "",
    pre_defined_early_data: "abc",
  }
);

export const NODE_TYPES: NodeTypeConfig[] = [
  // Inbound Nodes
  new NodeTypeConfig("Echo", "Echo", "inbound", {} as any),
  new NodeTypeConfig("Stdio", "Stdio", "inbound", {
    ext: { pre_defined_early_data: "" },
  } as StdioConfig),
  new NodeTypeConfig("Fileio", "File I/O", "inbound", {
    i: "test.crt",
    o: "testfile.txt",
    sleep_interval: 500,
    bytes_per_turn: 10,
    ext: { fixed_target_addr: "fake.com:80" },
  } as FileConfig),
  new NodeTypeConfig("BindDialer", "Bind Dialer", "inbound", BindDialerDefault),
  new NodeTypeConfig("Listener", "Listener", "inbound", {
    listen_addr: "0.0.0.0:10801",
    ext: {
      fixed_target_addr: "",
      pre_defined_early_data: "abc",
    },
  } as Listener),
  new NodeTypeConfig("TcpOptListener", "TCP Opt Listener", "inbound", {
    listen_addr: "0.0.0.0:12345",
    sockopt: {
      tproxy: false,
    },
  } as TcpOptListener),
  new NodeTypeConfig("Adder", "Adder", "inbound", {
    value: 1,
  } as any),
  new NodeTypeConfig("Counter", "Counter", "inbound", {}),
  new NodeTypeConfig("Recorder", "Recorder", "inbound", {
    output_dir: "",
    output_format: "ruci",
    output_file_extension: "cbor",
    record_mode: "full",
    prettify: false,
    label: "direct",
    piece_truncate_option: "no-truncate",
    session_truncate_option: "no-truncate",
  } as RecorderConfig),
  new NodeTypeConfig("TLS", "TLS Server", "inbound", {
    cert: "",
    key: "",
    alpn: ["h2", "http/1.1"],
  } as TlsServerOptions),
  new NodeTypeConfig("NativeTLS", "Native TLS", "inbound", {
    cert: "",
    key: "",
    alpn: ["h2", "http/1.1"],
  } as TlsServerOptions),
  new NodeTypeConfig("H2", "HTTP/2", "inbound", {
    is_grpc: false,
    http_config: {
      method: "GET",
      scheme: "https",
      authority: "user@www.ruci.com:80",
      path: "/mypath",
      headers: {},
      use_early_data: false,
    },
  } as H2),
  new NodeTypeConfig("Http", "HTTP", "inbound", {
    userpass: "",
    more: [],
  } as PlainTextPassSet),
  new NodeTypeConfig("Socks5", "SOCKS5", "inbound", {
    userpass: "",
    more: [],
  } as PlainTextPassSet),
  new NodeTypeConfig("Socks5Http", "SOCKS5 HTTP", "inbound", {
    userpass: "",
    more: [],
  } as PlainTextPassSet),
  new NodeTypeConfig("Trojan", "Trojan", "inbound", {
    password: "",
    more: [],
  } as TrojanConfig),
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
    alpn: ["h2", "http/1.1"],
  } as TlsServerOptions),
  new NodeTypeConfig("Embedder", "Embedder", "inbound", {
    file_name: "file.lua",
  } as Embedder),

  // Outbound Nodes
  new NodeTypeConfig("Blackhole", "Blackhole", "outbound", {} as any),
  new NodeTypeConfig("Direct", "Direct", "outbound", {
    leak_target_addr: true,
    dns_client: {
      dns_server_list: [],
      ip_strategy: "Ipv4Only",
    },
  } as DirectConfig),
  new NodeTypeConfig("Stdio", "Stdio", "outbound", {
    write_mode: "UTF8",
    ext: {},
  } as StdioConfig),
  new NodeTypeConfig("Fileio", "File I/O", "outbound", {
    i: "test.crt",
    o: "testfile.txt",
    sleep_interval: 500,
    bytes_per_turn: 10,
    ext: { fixed_target_addr: "fake.com:80" },
  } as FileConfig),
  new NodeTypeConfig(
    "BindDialer",
    "Bind Dialer",
    "outbound",
    BindDialerDefault
  ),
  new NodeTypeConfig("Adder", "Adder", "outbound", { value: 1 } as any),
  new NodeTypeConfig("Counter", "Counter", "outbound", {}),
  new NodeTypeConfig("Recorder", "Recorder", "outbound", {} as RecorderConfig),
  new NodeTypeConfig("TLS", "TLS Client", "outbound", {
    host: "null",
    insecure: false,
    alpn: ["h2", "http/1.1"],
  } as TlsClientOptions),
  new NodeTypeConfig("OptDirect", "Opt Direct", "outbound", {} as OptDirect),
  new NodeTypeConfig(
    "OptDialer",
    "Opt Dialer",
    "outbound",
    {} as OptDialerOption
  ),
  new NodeTypeConfig(
    "NativeTLS",
    "Native TLS",
    "outbound",
    {} as TlsClientOptions
  ),
  new NodeTypeConfig("Http", "HTTP", "outbound", {}),
  new NodeTypeConfig("Socks5", "SOCKS5", "outbound", {} as Socks5Out),
  new NodeTypeConfig("Trojan", "Trojan", "outbound", {
    password: "",
    more: null,
  } as TrojanClientConfig),
  new NodeTypeConfig("WebSocket", "WebSocket", "outbound", {} as CommonConfig),
  new NodeTypeConfig("H2Single", "H2 Single", "outbound", {} as H2),
  new NodeTypeConfig("H2Mux", "H2 Mux", "outbound", {} as H2),
  new NodeTypeConfig("Quic", "QUIC", "outbound", {
    server_addr: "f",
    server_name: "a",
  } as QuicClientConfig),
  new NodeTypeConfig("SPE1", "SPE1", "outbound", {} as SPE1),
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
