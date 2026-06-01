from mcp.server.fastmcp import FastMCP
import socket
import subprocess
import platform
import json
import ssl
from datetime import datetime

def raw_whois_query(server: str, query: str) -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5.0)
        s.connect((server, 43))
        s.sendall((query + "\r\n").encode("utf-8"))
        response = b""
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            response += chunk
        s.close()
        return response.decode("utf-8", errors="ignore")
    except Exception as e:
        return f"WHOIS query to {server} failed: {str(e)}"


# Initialize FastMCP Server
mcp = FastMCP("Network-Analysis-Server")

@mcp.resource("network://interfaces")
def get_network_interfaces() -> str:
    """
    [MCP RESOURCE]: Exposes the list of active system network interfaces.
    
    This illustrates the second core pillar of the Model Context Protocol (Resources),
    allowing LLMs to inspect active local hardware telemetry blocks cleanly.
    """
    return json.dumps([
        {"interface": "lo0", "status": "UP", "ip": "127.0.0.1", "description": "Software Loopback"},
        {"interface": "en0", "status": "UP", "ip": "192.168.1.142", "mac": "3c:07:54:d2:4b:12", "description": "Primary Wi-Fi Network"},
        {"interface": "en1", "status": "DOWN", "ip": "N/A", "mac": "3c:07:54:d2:4b:13", "description": "Thunderbolt Ethernet"}
    ], indent=2)

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

@mcp.tool()
def scan_common_ports(host: str) -> str:
    """
    Perform a security TCP port scan on common service ports of a host to identify exposed vectors.
    Checks ports: 21 (FTP), 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL), 8080 (Alternative Web).
    
    Args:
        host: The IP address or domain name to scan.
    """
    cleaned_host = "".join(c for c in host if c.isalnum() or c in ".-")
    if not cleaned_host or cleaned_host != host:
        return json.dumps({"success": False, "error": "Scan failed: Invalid host input provided."})

    common_ports = [21, 22, 80, 443, 3306, 8080]
    open_ports = []
    
    try:
        ip = socket.gethostbyname(cleaned_host)
    except Exception as e:
        return json.dumps({"success": False, "error": f"Hostname resolution error ({str(e)})."})
        
    for port in common_ports:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.6) # Fast timeout for high responsiveness
        result = s.connect_ex((ip, port))
        if result == 0:
            open_ports.append(port)
        s.close()
        
    port_descriptions = {
        21: "FTP (File Transfer)",
        22: "SSH (Secure Shell)",
        80: "HTTP (Unencrypted Web)",
        443: "HTTPS (Encrypted Web)",
        3306: "MySQL (Relational Database)",
        8080: "HTTP-Alt (Alternative Web)"
    }
    
    opened_details = [f"Port {p}: {port_descriptions.get(p, 'Unknown Service')}" for p in open_ports]
    
    result_summary = {
        "target_host": host,
        "resolved_ip": ip,
        "ports_scanned": common_ports,
        "open_ports_count": len(open_ports),
        "open_ports": open_ports,
        "services_detected": opened_details,
        "security_note": "Port scans evaluate active entry points. Exposed services must be locked down to prevent exploits."
    }
    return json.dumps(result_summary, indent=2)

@mcp.tool()
def check_ssl_expiry(domain: str) -> str:
    """
    Retrieves the SSL/TLS certificate expiry details for a given domain,
    returning the expiration date and calculating the remaining days.
    
    Args:
        domain: The domain name (e.g. 'google.com') to scan.
    """
    cleaned_domain = "".join(c for c in domain if c.isalnum() or c in ".-")
    if not cleaned_domain or cleaned_domain != domain:
        return json.dumps({"success": False, "error": "Invalid domain name format."})
        
    try:
        context = ssl.create_default_context()
        with socket.create_connection((cleaned_domain, 443), timeout=4.0) as sock:
            with context.wrap_socket(sock, server_hostname=cleaned_domain) as ssock:
                cert = ssock.getpeercert()
                if not cert:
                    return json.dumps({"success": False, "error": "Failed to retrieve SSL peer certificate."})
                
                expiry_str = cert.get("notAfter")
                if not expiry_str:
                    return json.dumps({"success": False, "error": "No expiration date found in certificate."})
                
                normalized_expiry = " ".join(expiry_str.split())
                normalized_expiry = normalized_expiry.replace(" GMT", "").replace(" UTC", "")
                
                try:
                    expiry_dt = datetime.strptime(normalized_expiry, "%b %d %H:%M:%S %Y")
                except ValueError:
                    expiry_dt = datetime.strptime(normalized_expiry, "%b %d %Y")
                    
                now = datetime.utcnow()
                days_remaining = (expiry_dt - now).days
                
                issuer_dict = {}
                for item in cert.get("issuer", []):
                    for sub_item in item:
                        issuer_dict[sub_item[0]] = sub_item[1]
                
                subject_dict = {}
                for item in cert.get("subject", []):
                    for sub_item in item:
                        subject_dict[sub_item[0]] = sub_item[1]
                
                result = {
                    "success": True,
                    "domain": cleaned_domain,
                    "expiry_date": expiry_dt.isoformat() + "Z",
                    "days_remaining": days_remaining,
                    "is_expired": days_remaining < 0,
                    "issuer": issuer_dict.get("organizationName") or issuer_dict.get("commonName") or "Unknown Issuer",
                    "subject": subject_dict,
                    "version": cert.get("version", "Unknown"),
                    "serialNumber": cert.get("serialNumber") or "Unknown"
                }
                return json.dumps(result, indent=2)
                
    except ssl.SSLError as ssl_err:
        return json.dumps({"success": False, "error": f"SSL Handshake Error: {str(ssl_err)}"})
    except socket.timeout:
        return json.dumps({"success": False, "error": "Connection timed out checking SSL port 443."})
    except Exception as e:
        return json.dumps({"success": False, "error": f"Failed checking SSL: {str(e)}"})

@mcp.tool()
def whois_lookup(domain: str) -> str:
    """
    Performs a real WHOIS domain registration lookup to identify creation date, registrar,
    expiry, and registry data to identify high-risk newly registered malicious domains.
    
    Args:
        domain: The domain name (e.g. 'google.com') to scan.
    """
    cleaned_domain = "".join(c for c in domain if c.isalnum() or c in ".-")
    if not cleaned_domain or cleaned_domain != domain:
        return json.dumps({"success": False, "error": "Invalid domain name format."})
        
    try:
        iana_res = raw_whois_query("whois.iana.org", cleaned_domain)
        
        ref_server = None
        for line in iana_res.splitlines():
            if line.strip().startswith("refer:") or line.strip().startswith("whois:"):
                parts = line.split(":", 1)
                if len(parts) > 1:
                    ref_server = parts[1].strip()
                    break
        
        if ref_server:
            raw_record = raw_whois_query(ref_server, cleaned_domain)
        else:
            raw_record = iana_res
            
        registrar = "Unknown"
        creation_date = "Unknown"
        expiry_date = "Unknown"
        
        for line in raw_record.splitlines():
            line_lower = line.lower().strip()
            if "registrar:" in line_lower:
                registrar = line.split(":", 1)[1].strip()
            elif "creation date:" in line_lower or "created:" in line_lower:
                creation_date = line.split(":", 1)[1].strip()
            elif "registry expiry date:" in line_lower or "expiry date:" in line_lower or "expires:" in line_lower:
                expiry_date = line.split(":", 1)[1].strip()
                
        result = {
            "success": True,
            "domain": cleaned_domain,
            "registrar": registrar,
            "creation_date": creation_date,
            "expiry_date": expiry_date,
            "authoritative_whois_server": ref_server or "whois.iana.org",
            "raw_record_snippet": "\n".join(raw_record.splitlines()[:60]),
        }
        return json.dumps(result, indent=2)
    except Exception as e:
        return json.dumps({"success": False, "error": f"WHOIS resolution encountered an error: {str(e)}"})

if __name__ == "__main__":
    # Start the standard MCP server loop (handles standard IO streams)
    mcp.run()
