mod utils;

use crate::utils::{Family, Socket, SocketAddress, StreamEvent, StreamEventLevel};
use colored::Colorize;
use std::env;
use tokio::io::copy_bidirectional;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream, UdpSocket, windows::named_pipe::ClientOptions};
use tokio::spawn;

async fn process_pipe(mut stream: TcpStream) -> tokio::io::Result<()> {
    // info!("{}", StreamEvent::new(StreamEventLevel::Open, addr));

    let mut pipe = ClientOptions::new().open("//./pipe/socket")?;
    // let mut client = TcpStream::connect("127.0.0.1:843").await?;

    copy_bidirectional(&mut stream, &mut pipe).await?;

    /*
    let mut buf = [0; 1024];

    let n = stream.read(&mut buf).await?;
    pipe.write_all(&buf[..n]).await?;
    // info!("{}", StreamEvent::new(StreamEventLevel::Data, addr));

    let n = pipe.read(&mut buf).await?;
    stream.write_all(&buf[..n]).await?;
    // info!("{}", StreamEvent::new(StreamEventLevel::Close, addr));
    */

    Ok(())
}
async fn process_udp(mut stream: TcpStream) -> tokio::io::Result<()> {
    let datagram = UdpSocket::bind("0.0.0.0:0").await?;
    datagram.connect("127.0.0.1:843").await?;

    let mut buf = [0u8; 1024];

    let n = stream.read(&mut buf).await?;
    datagram.send(&buf[..n]).await?;

    let n = datagram.recv(&mut buf).await?;
    stream.write_all(&buf[..n]).await?;
    Ok(())
}
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
            info!("write");
            let n = n?;
            // Note: UDP 0-byte packets are valid, so we just check for errors
            stream.write_all(&res[..n]).await?;
        }
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();

    let hostname = env::var("HOSTNAME").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("port")
        .ok()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or(3000);
    let address = SocketAddress {
        address: hostname,
        port: port,
        family: Family::IPv4,
    };

    let listener = TcpListener::bind(address.to_string()).await?;
    info!("Listening to http://{}/...", address);
    // let response = "HTTP/1.1 200 OK\r\n\r\nHello, world!";

    let connection = Socket::UDP;

    match connection {
        Socket::TCP => loop {
            match listener.accept().await {
                Ok((mut stream, addr)) => {
                    spawn(async move {
                        // info!("{}", StreamEvent::new(StreamEventLevel::Open, addr));

                        match TcpStream::connect("127.0.0.1:843").await {
                            Ok(mut server) => {
                                let _ = copy_bidirectional(&mut stream, &mut server).await;
                                // info!("{}", StreamEvent::new(StreamEventLevel::Close, addr));
                            }
                            Err(_) => {
                                error!("{}", StreamEvent::new(StreamEventLevel::Abort, addr));
                                return;
                            }
                        };
                    });
                }
                Err(e) => error!("{:?}", e),
            }
        },
        Socket::UDP => loop {
            match listener.accept().await {
                Ok((stream, _addr)) => {
                    spawn(async move {
                        match process_udp(stream).await {
                            Ok(()) => {}
                            Err(e) => error!("{:?}", e),
                        }
                    });
                }
                Err(e) => error!("{:?}", e),
            }
        },
        Socket::UDS => loop {
            match listener.accept().await {
                Ok((stream, _addr)) => {
                    spawn(async move {
                        match process_pipe(stream).await {
                            Ok(()) => {}
                            Err(e) => error!("{:?}", e),
                        }
                    });
                }
                Err(e) => error!("{:?}", e),
            }
        },
    }
}

/*
                        let _ = autofix(|| async {
                            // info!("{}", StreamEvent::new(StreamEventLevel::Open, addr));

                            // let mut client = ClientOptions::new().open("//./pipe/socket")?;
                            let mut client = TcpStream::connect("127.0.0.1:843").await?;

                            let mut buf = [0; 1024];

                            let n = stream.read(&mut buf).await?;
                            let _ = client.write_all(&buf[..n]).await;
                            // info!("{}", StreamEvent::new(StreamEventLevel::Data, addr));

                            let n = client.read(&mut buf).await?;
                            let _ = stream.write_all(&buf[..n]).await;

                            // info!("{}", StreamEvent::new(StreamEventLevel::Close, addr));
                            Ok(())
                        })
                        .await;
*/
