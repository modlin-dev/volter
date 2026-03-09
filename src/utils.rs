use chrono::{DateTime, Utc};
use colored::Colorize;
use std::{
    env,
    fmt::{self, Debug, Display, Formatter},
    net::{IpAddr, Ipv4Addr, SocketAddr},
};

#[allow(dead_code)]
pub enum LogLevel {
    Info,
    Warn,
    Error,
    Fatal,
}

#[allow(dead_code)]
pub struct Log {
    pub level: LogLevel,
    pub message: String,
    pub created: DateTime<Utc>,
}

#[macro_export]
macro_rules! info {
    ($($arg:tt)*) => {{
        print!("{} {}{} ", Utc::now().to_timestamp().dimmed(), "info".blue().bold(), ":".dimmed());
        println!($($arg)*);
    }};
}

#[macro_export]
macro_rules! warn {
    ($($arg:tt)*) => {{
        print!("{}{} ", "warn".yellow().bold(), ":".dimmed());
        println!($($arg)*);
    }};
}

#[macro_export]
macro_rules! error {
    ($($arg:tt)*) => {{
        eprint!("{}{} ", "error".red().bold(), ":".dimmed());
        eprintln!($($arg)*);
    }};
}

#[macro_export]
macro_rules! fatal {
    ($($arg:tt)*) => {{
        eprint!("{}{} ", "fatal".purple().bold(), ":".dimmed());
        eprintln!($($arg)*);
    }};
}

pub enum Family {
    IPv4,
    IPv6,
}

impl Debug for Family {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Family::IPv4 => write!(f, "ipv4"),
            Family::IPv6 => write!(f, "ipv6"),
        }
    }
}

pub struct SocketAddress {
    pub address: String,
    pub port: u16,
    pub family: Family,
}

#[allow(dead_code)]
impl SocketAddress {
    pub fn from(addr: SocketAddr) -> SocketAddress {
        SocketAddress {
            address: addr.ip().to_string(),
            port: addr.port(),
            family: if addr.is_ipv4() {
                Family::IPv4
            } else {
                Family::IPv6
            },
        }
    }
    pub fn env() -> SocketAddress {
        dotenvy::dotenv().ok();

        SocketAddress {
            address: env::var("HOSTNAME").unwrap_or_else(|_| "127.0.0.1".to_string()),
            port: env::var("port")
                .ok()
                .and_then(|p| p.parse::<u16>().ok())
                .unwrap_or(3000),
            family: Family::IPv4,
        }
    }
    pub fn to_string(&self) -> String {
        format!("{}:{}", self.address, self.port)
    }
}

pub trait SocketAddrEnv {
    fn env() -> Self;
}

impl SocketAddrEnv for SocketAddr {
    fn env() -> Self {
        dotenvy::dotenv().ok();

        let ip: IpAddr = env::var("HOSTNAME")
            .unwrap_or_else(|_| "127.0.0.1".to_string())
            .parse()
            .unwrap_or_else(|_| IpAddr::V4(Ipv4Addr::LOCALHOST));
        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(3000);
        Self::new(ip, port)
    }
}

impl Display for SocketAddress {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{}:{}", self.address, self.port)
    }
}

impl Debug for SocketAddress {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        f.debug_struct("SocketAddress")
            .field("address", &format_args!("{}", self.address))
            .field("port", &self.port)
            .field("family", &self.family)
            .finish()
    }
}

#[allow(dead_code)]
pub enum StreamEventLevel {
    Open,
    Data,
    Close,
    Abort,
}
impl Display for StreamEventLevel {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            StreamEventLevel::Open => write!(f, "{}", "open".green()),
            StreamEventLevel::Data => write!(f, "{}", "data".blue()),
            StreamEventLevel::Close => write!(f, "{}", "close".yellow()),
            StreamEventLevel::Abort => write!(f, "{}", "abort".red()),
        }
    }
}

pub struct StreamEvent {
    pub level: StreamEventLevel,
    pub address: SocketAddr,
    pub created: DateTime<Utc>,
    pub updated: DateTime<Utc>,
}

#[allow(dead_code)]
impl StreamEvent {
    pub fn new(level: StreamEventLevel, addr: SocketAddr) -> Self {
        Self {
            level,
            address: addr,
            created: Utc::now(),
            updated: Utc::now(),
        }
    }
    pub fn from(addr: SocketAddr) -> Self {
        Self {
            level: StreamEventLevel::Open,
            address: addr,
            created: Utc::now(),
            updated: Utc::now(),
        }
    }
    pub fn open(&mut self) -> &Self {
        self.updated = Utc::now();
        self.level = StreamEventLevel::Open;
        self
    }
    pub fn data(&mut self) -> &Self {
        self.updated = Utc::now();
        self.level = StreamEventLevel::Data;
        self
    }
    pub fn close(&mut self) -> &Self {
        self.updated = Utc::now();
        self.level = StreamEventLevel::Close;
        self
    }
}

impl Display for StreamEvent {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{} {} {}",
            self.created.to_timestamp().dimmed(),
            self.level,
            self.address.to_string().red()
        )
    }
}

pub trait DateTimeExt {
    fn to_timestamp(&self) -> String;
}

impl<Tz: chrono::TimeZone> DateTimeExt for DateTime<Tz> {
    fn to_timestamp(&self) -> String {
        let x = self.to_rfc3339();
        format!("{}", &x[0..19].replace("T", " "))
    }
}

#[allow(dead_code)]
pub enum Socket {
    TCP,
    UDP,
    UDS,
    PIPE,
    RDMA,
}

#[allow(dead_code)]
pub fn set(byte: u8, n: u8) -> u8 {
    byte | (1 << n)
}
#[allow(dead_code)]
pub fn clear(byte: u8, n: u8) -> u8 {
    byte & !(1 << n)
}
#[allow(dead_code)]
pub fn toggle(byte: u8, n: u8) -> u8 {
    byte ^ (1 << n)
}
#[allow(dead_code)]
pub fn read(byte: u8, n: u8) -> u8 {
    (byte >> n) & 1
}
