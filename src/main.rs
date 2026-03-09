mod utils;

use crate::utils::{DateTimeExt, Socket, SocketAddrEnv};
use chrono::Utc;
use colored::Colorize;
use std::{
    net::SocketAddr,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt, copy_bidirectional},
    net::{TcpListener, TcpStream, UdpSocket, windows::named_pipe::ClientOptions},
    spawn,
};

#[allow(dead_code)]
async fn process_tcp(mut stream: TcpStream) -> tokio::io::Result<()> {
    // info!("{}", StreamEvent::new(StreamEventLevel::Open, addr));
    let mut client = TcpStream::connect("127.0.0.1:843").await?;
    copy_bidirectional(&mut stream, &mut client).await?;
    // info!("{}", StreamEvent::new(StreamEventLevel::Close, addr));
    Ok(())
}

#[allow(dead_code)]
async fn process_udp(mut stream: TcpStream, target: &String) -> tokio::io::Result<()> {
    stream.set_nodelay(true)?;
    let datagram = UdpSocket::bind("0.0.0.0:0").await?;
    datagram.connect(target).await?;

    let mut buf = [0u8; 8192];

    let n = stream.read(&mut buf).await?;
    datagram.send(&buf[..n]).await?;

    let n = datagram.recv(&mut buf).await?;
    stream.write_all(&buf[..n]).await?;
    Ok(())
}

async fn process_raw(mut stream: TcpStream) -> tokio::io::Result<()> {
    stream.set_nodelay(true)?;
    stream
        .write_all("HTTP/1.1 200 OK\r\n\r\nHello, world!".as_bytes())
        .await?;
    stream.shutdown().await?;
    Ok(())
}

#[allow(dead_code)]
async fn process_pipe(mut stream: TcpStream) -> tokio::io::Result<()> {
    stream.set_nodelay(true)?;
    // info!("{}", StreamEvent::new(StreamEventLevel::Open, addr));
    let mut pipe = ClientOptions::new().open("//./pipe/socket")?;
    copy_bidirectional(&mut stream, &mut pipe).await?;

    /*
    let mut buf = [0; 1024];

    let n = stream.read(&mut buf).await?;
    pipe.write_all(&buf[..n]).await?;
    // info!("{}", StreamEvent::new(StreamEventLevel::Data, addr));

    let n = pipe.read(&mut buf).await?;
    stream.write_all(&buf[..n]).await?;
    */

    // info!("{}", StreamEvent::new(StreamEventLevel::Close, addr));
    Ok(())
}

#[allow(dead_code)]
async fn process_udp_select(mut stream: TcpStream) -> tokio::io::Result<()> {
    let datagram = UdpSocket::bind("0.0.0.0:0").await?;
    datagram.connect("127.0.0.1:843").await?;

    let mut req = [0u8; 8192];
    let mut res = [0u8; 8192];

    tokio::select! {
        // TCP -> UDP (Request)
        n = stream.read(&mut req) => {
            let n = n?;
            if n == 0 { () }
            datagram.send(&req[..n]).await?;
        }

        // UDP -> TCP (Response)
        n = datagram.recv(&mut res) => {
            let n = n?;
            // Note: UDP 0-byte packets are valid, so we just check for errors
            stream.write_all(&res[..n]).await?;
        }
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let address = SocketAddr::env();
    let listener = TcpListener::bind(address).await?;
    info!("Listening to {}...", address);

    let targets = vec!["127.0.0.1:3001".to_string(), "127.0.0.1:3002".to_string()];
    let targets = Arc::new(targets);
    let current_index = Arc::new(AtomicUsize::new(0));

    let connection = Socket::RDMA;

    match connection {
        Socket::TCP => loop {
            match listener.accept().await {
                Ok((stream, _addr)) => {
                    spawn(async move {
                        if let Err(e) = process_tcp(stream).await {
                            error!("{:?}", e)
                        }
                    });
                }
                Err(e) => error!("{:?}", e),
            }
        },
        Socket::UDP => loop {
            match listener.accept().await {
                Ok((stream, _addr)) => {
                    let targets = Arc::clone(&targets);
                    let index_ptr = Arc::clone(&current_index);
                    spawn(async move {
                        let idx = index_ptr.fetch_add(1, Ordering::Relaxed) % targets.len();
                        if let Err(e) = process_udp(stream, &targets[idx]).await {
                            error!("{:?}", e)
                        }
                    });
                }
                Err(e) => error!("{:?}", e),
            }
        },
        Socket::UDS => loop {
            match listener.accept().await {
                Ok((_stream, _addr)) => {}
                Err(e) => error!("{:?}", e),
            }
        },
        Socket::PIPE => loop {
            match listener.accept().await {
                Ok((stream, _addr)) => {
                    spawn(async move {
                        if let Err(e) = process_pipe(stream).await {
                            error!("{:?}", e)
                        }
                    });
                }
                Err(e) => error!("{:?}", e),
            }
        },
        Socket::RDMA => loop {
            match listener.accept().await {
                Ok((stream, _addr)) => {
                    spawn(async move {
                        if let Err(e) = process_raw(stream).await {
                            error!("{:?}", e)
                        }
                    });
                }
                Err(e) => error!("{:?}", e),
            }
        },
    }
}
