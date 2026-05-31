from mcp.server.fastmcp import FastMCP
import socket
import subprocess
import platform

# Initialize FastMCP Server
mcp = FastMCP("Network-Analysis-Server")

@mcp.tool()
def dns_lookup(domain: str) -> str:
    """
    Perform a DNS resolution for a given domain to find its IP addresses.
    
    Args:
        domain: The domain name (e.g., 'google.com') to lookup.
    """
    try:
        # REAL LOGIC: Query system DNS servers for hostname details
        ips = socket.gethostbyname_ex(domain)[2]
        return f"DNS Lookup for {domain}: Successful. IP Addresses: {', '.join(ips)}"
    except socket.gaierror as e:
        return f"DNS Lookup for {domain} failed: Hostname not resolved ({str(e)})."
    except Exception as e:
        return f"DNS Lookup for {domain} encountered an error: {str(e)}"

@mcp.tool()
def ping_host(host: str) -> str:
    """
    Check if a host is reachable using a standard network ping.
    
    Args:
        host: The IP address or domain name to ping.
    """
    # Safe validation of host input to prevent command injection
    # Only allow standard alphanumeric, dots, and hyphens (standard hostname format)
    cleaned_host = "".join(c for c in host if c.isalnum() or c in ".-")
    if not cleaned_host or cleaned_host != host:
        return "Ping failed: Invalid host input provided."

    # Determine ping arguments based on host OS
    is_windows = platform.system().lower() == "windows"
    param = "-n" if is_windows else "-c"
    
    # We specify a short timeout (-W 2 on Unix, -w 2000 on Windows) so the tool doesn't hang forever
    timeout_param = ["-w", "2000"] if is_windows else ["-W", "2"]
    
    command = ["ping", param, "1"] + timeout_param + [cleaned_host]
    
    try:
        # REAL LOGIC: Execute standard system ping safely using subprocess list
        # Passing command as a list rather than a single string prevents shell expansion injection.
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            return f"Ping to {host} successful:\n{result.stdout.strip()}"
        else:
            return f"Ping to {host} failed (Host unreachable or request timed out):\n{result.stderr.strip() or result.stdout.strip()}"
            
    except subprocess.TimeoutExpired:
        return f"Ping to {host} failed: Connection timed out."
    except Exception as e:
        return f"Ping to {host} failed due to execution error: {str(e)}"

if __name__ == "__main__":
    # Start the standard MCP server loop (handles standard IO streams)
    mcp.run()
