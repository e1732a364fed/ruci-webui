pub struct BindDialerConfig {
    pub bind_addr: Option<String>,
    pub dial_addr: Option<String>,

    pub dns_client: Option<DnsClientConfig>,

    pub in_auto_route: Option<InAutoRouteParams>,

    pub out_auto_route: Option<OutAutoRouteParams>,

    pub ext: Option<Ext>,
}

pub struct Ext {
    pub fixed_target_addr: Option<String>,
    pub pre_defined_early_data: Option<String>,
}

pub struct OutAutoRouteParams {
    pub tun_dev_name: Option<String>,
    pub original_dev_name: Option<String>,
    pub router_ip: Option<String>,
}

pub struct InAutoRouteParams {
    pub tun_dev_name: Option<String>,
    pub tun_gateway: Option<String>,
    pub router_ip: Option<String>,
    pub original_dev_name: Option<String>,
    pub direct_list: Option<Vec<String>>,
    pub dns_list: Option<Vec<String>>,
}

pub struct FileConfig {
    pub i: String,
    pub o: String,

    pub sleep_interval: Option<u64>,
    pub bytes_per_turn: Option<usize>,
    pub ext: Option<Ext>,
}

pub struct PlainTextPassSet {
    pub userpass: Option<String>,

    pub more: Option<Vec<String>>,
}

pub struct Socks5Out {
    pub userpass: Option<String>,
    pub early_data: Option<bool>,
    pub ext: Option<Ext>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct TrojanPassSet {
    pub password: Option<String>,
    pub more: Option<Vec<String>>,
}

pub struct TrojanClientConfig {
    pub password: Option<String>,
    pub do_not_use_early_data: Option<bool>,
}

pub struct StdioConfig {
    pub write_mode: Option<WriteMode>,
    pub ext: Option<Ext>,
}

pub enum WriteMode {
    #[default]
    UTF8,
    Bytes,
}

pub struct DirectConfig {
    pub leak_target_addr: Option<bool>,
    pub dns_client: Option<DnsClientConfig>,
}

pub struct DnsClientConfig {
    pub dns_server_list: Vec<(SocketAddr, Protocol)>,
    pub ip_strategy: Option<LookupIpStrategy>,
    pub static_pairs: HashMap<String, IpAddr>,
}

pub enum Protocol {
    Udp,
    Tcp,
}

pub enum LookupIpStrategy {
    Ipv4Only,
    Ipv6Only,
    Ipv4AndIpv6,
    Ipv6thenIpv4,
    Ipv4thenIpv6,
}

pub struct SockOpt {
    pub tproxy: Option<bool>,
    pub so_mark: Option<u8>,
    pub bind_to_device: Option<String>,
}

pub struct OptDialerOption {
    pub dial_addr: String,
    pub sockopt: SockOpt,
    pub dns_client: Option<DnsClientConfig>,
}

pub struct TproxyOptions {
    pub port: Option<u16>,
    pub route_ipv6: Option<bool>,
    pub proxy_local_udp_53: Option<bool>,

    pub local_net4: Option<String>,
    pub auto_route: Option<bool>,
    pub auto_route_tcp: Option<bool>,
}

pub struct RecorderConfig {
    pub label: Option<String>,
    pub output_dir: Option<String>,
    pub output_file_extension: Option<OutputFileExtension>,
    pub output_format: Option<OutputFormat>,
    pub record_mode: Option<RecordMode>,

    pub prettify: Option<bool>,

    pub piece_truncate_option: Option<PieceTruncateOption>,
    pub session_truncate_option: Option<SessionTruncateOption>,
}

#[serde(rename_all = "lowercase")]
pub enum OutputFileExtension {
    #[default]
    Json,
    Cbor,
}

#[serde(rename_all = "lowercase")]
pub enum OutputFormat {
    #[default]
    Ruci,
    Har,
}

#[serde(rename_all = "lowercase")]
pub enum RecordMode {
    #[default]
    Full,
    Simplified,
    Info,
}

#[serde(rename_all = "kebab-case")]
pub enum PieceTruncateOption {
    /// no-truncate
    #[default]
    NoTruncate,
    /// piece-truncate
    PieceTruncate(usize),
}

#[serde(rename_all = "kebab-case")]
pub enum SessionTruncateOption {
    /// no-truncate
    #[default]
    NoTruncate,
    /// session-truncate
    SessionTruncate(usize),
}

pub struct CommonConfig {
    pub method: Option<String>,
    pub scheme: Option<String>,
    pub authority: String,
    pub path: String,
    pub headers: Option<BTreeMap<String, String>>,
    pub use_early_data: Option<bool>,
}

pub struct TlsServerOptions {
    pub cert: PathBuf,
    pub key: PathBuf,
    pub alpn: Option<Vec<String>>,
}

pub struct TlsClientOptions {
    pub host: Option<String>,
    pub insecure: bool,
    pub alpn: Option<Vec<String>>,

    pub cert: Option<String>,
}

pub struct TrojanConfig {
    pub password: Option<String>,
    pub more: Option<Vec<String>>,
}

pub struct QuicServerConfig {
    pub key: String,
    pub cert: String,
    pub listen_addr: String,
    pub alpn: Option<Vec<String>>,
}

pub struct QuicClientConfig {
    pub server_addr: String,
    pub server_name: String,

    pub cert: Option<String>,
    pub alpn: Option<Vec<String>>,
    pub insecure: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone, EnumIter)]
#[serde(tag = "type")]
pub enum InMapConfig {
    Echo,
    Stdio(StdioConfig),
    Fileio(FileConfig),
    BindDialer(Box<BindDialerConfig>),
    Listener {
        listen_addr: String,
        ext: Option<Ext>,
    },

    TcpOptListener {
        listen_addr: String,
        sockopt: SockOpt,
        ext: Option<Ext>,
    },

    TproxyUdpListener {
        listen_addr: String,
        sockopt: SockOpt,
        ext: Option<Ext>,
    },

    TproxyTcpResolver(TproxyOptions),

    Adder {
        value: i8,
    },
    Counter,
    Recorder(RecorderConfig),
    TLS(TlsServerOptions),

    NativeTLS(TlsServerOptions),
    H2 {
        is_grpc: Option<bool>,
        http_config: Option<CommonConfig>,
    },

    Http(PlainTextPassSet),
    Socks5(PlainTextPassSet),
    Socks5Http(PlainTextPassSet),
    Trojan(TrojanConfig),
    HttpFilter(Option<CommonConfig>),
    WebSocket {
        http_config: Option<CommonConfig>,
    },
    Quic(QuicServerConfig),

    Stack,

    StackLwip,

    SPE1 {
        qa: Option<Vec<(String, String)>>,
    },

    Lua {
        file_name: String,
        handshake_function: String,
    },

    MITM(TlsServerOptions),

    Embedder {
        file_name: String,
    },
}

pub enum OutMapConfig {
    Blackhole,
    Direct(DirectConfig),
    Stdio(StdioConfig),
    Fileio(FileConfig),
    BindDialer(Box<BindDialerConfig>),
    Adder {
        value: i8,
    },
    Counter,
    Recorder(RecorderConfig),
    TLS(TlsClientOptions),

    OptDirect {
        sockopt: SockOpt,
        more_num_of_files: Option<bool>,
        dns_client: Option<DnsClientConfig>,
    },

    OptDialer(OptDialerOption),

    NativeTLS(TlsClientOptions),

    Http,
    Socks5(Socks5Out),
    Trojan(TrojanClientConfig),
    WebSocket(CommonConfig),
    H2Single {
        is_grpc: Option<bool>,

        http_config: Option<CommonConfig>,
    },
    H2Mux {
        is_grpc: Option<bool>,

        http_config: Option<CommonConfig>,
    },
    Quic(QuicClientConfig),

    SPE1 {
        qa: Option<Vec<(String, String)>>,
    },

    Lua {
        file_name: String,
        handshake_function: String,
    },

    Embedder {
        file_name: String,
    },
}
