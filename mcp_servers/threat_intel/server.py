from mcp.server.fastmcp import FastMCP
import json
import random
import re

# Initialize FastMCP Server for Threat Intelligence
mcp = FastMCP("Threat-Intelligence-Server")

# Simple helper to validate IP formatting
def is_valid_ip(ip: str) -> bool:
    ipv4_pattern = r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
    return bool(re.match(ipv4_pattern, ip))

# Simple helper to validate domain formatting
def is_valid_domain(domain: str) -> bool:
    domain_pattern = r"^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(domain_pattern, domain))

@mcp.tool()
def analyze_ip_reputation(ip: str) -> str:
    """
    Check the security reputation of a specific IP address to see if it is associated with malicious activity.
    
    Args:
        ip: The target IPv4 address (e.g. '1.1.1.1' or '198.51.100.42').
    """
    if not is_valid_ip(ip):
        return json.dumps({"success": False, "error": f"Invalid IPv4 address format: {ip}"})

    # TEMPORARY/MOCK DATA: Simulated threat databases (representing API lookups to VirusTotal/AbuseIPDB)
    # Known simulated threat lists
    known_threats = {
        "198.51.100.42": {
            "is_malicious": True,
            "threat_score": 85,
            "category": "Botnet C2 / SSH Brute Forcing",
            "abuse_score": 92,
            "country": "Russia",
            "detections": "18 / 64 security engines flagged this IP"
        },
        "203.0.113.80": {
            "is_malicious": True,
            "threat_score": 68,
            "category": "Phishing Host / Malicious Ingress",
            "abuse_score": 75,
            "country": "China",
            "detections": "10 / 64 security engines flagged this IP"
        }
    }

    # Clean IP lists
    known_cleans = {
        "8.8.8.8": "Google Public DNS",
        "1.1.1.1": "Cloudflare DNS Resolver",
        "127.0.0.1": "Local Host Loopback"
    }

    # Determine reputation result
    if ip in known_threats:
        result = known_threats[ip]
    elif ip in known_cleans:
        result = {
            "is_malicious": False,
            "threat_score": 0,
            "category": "Clean / Trusted Infrastructure",
            "abuse_score": 0,
            "country": "United States",
            "detections": f"0 / 64 engines flagged this IP ({known_cleans[ip]})"
        }
    else:
        # Generates semi-realistic deterministic values for other IPs to simulate active API scanning
        last_octet = int(ip.split(".")[-1])
        is_suspicious = (last_octet % 7 == 0)
        score = random.randint(35, 75) if is_suspicious else random.randint(0, 15)
        
        result = {
            "is_malicious": is_suspicious,
            "threat_score": score,
            "category": "Suspicious Port Scanning" if is_suspicious else "Clean/Unclassified",
            "abuse_score": score + 5 if is_suspicious else 0,
            "country": random.choice(["United States", "Germany", "Japan", "Brazil", "India"]),
            "detections": f"{'4 / 64' if is_suspicious else '0 / 64'} engines flagged this IP"
        }

    # Add reference showing how real API integrations are structured
    result["integration_note"] = (
        "Production API: To query live data, replace this logic with standard HTTP client requests "
        "to 'https://api.abuseipdb.com/api/v2/check' or 'https://www.virustotal.com/api/v3/ip_addresses/{ip}' "
        "using authorization headers."
    )
    
    return json.dumps(result, indent=2)

@mcp.tool()
def analyze_domain_reputation(domain: str) -> str:
    """
    Check the security reputation of a domain to detect phishing, malvertising, or registration spikes.
    
    Args:
        domain: The domain name to analyze (e.g. 'secure-login-bank.com').
    """
    cleaned_domain = domain.lower().strip()
    if not is_valid_domain(cleaned_domain):
        return json.dumps({"success": False, "error": f"Invalid domain name format: {domain}"})

    # TEMPORARY/MOCK DATA: Simulated lookups (representing WHOIS and Cisco Talos APIs)
    suspicious_keywords = ["login", "bank", "secure", "verify", "update", "paypal", "crypto"]
    has_keyword = any(kw in cleaned_domain for kw in suspicious_keywords)
    
    known_malicious = {
        "malicious-tracker.xyz": 98,
        "suspicious-tracker.xyz": 82
    }

    if cleaned_domain in known_malicious:
        score = known_malicious[cleaned_domain]
        is_malicious = True
        status = "Blacklisted"
    elif has_keyword:
        score = random.randint(60, 89)
        is_malicious = True
        status = "Suspicious (High Phishing Risk)"
    else:
        score = random.randint(0, 10)
        is_malicious = False
        status = "Safe"

    result = {
        "domain": cleaned_domain,
        "is_malicious": is_malicious,
        "threat_score": score,
        "status": status,
        "registrar": "NameCheap Inc." if is_malicious else "GoDaddy LLC",
        "age_days": random.randint(1, 30) if is_malicious else random.randint(300, 5000),
        "integration_note": (
            "Production API: To fetch live domain metadata, connect to WHOIS scrapers "
            "or the VirusTotal Domain Intelligence endpoint 'https://www.virustotal.com/api/v3/domains/{domain}'."
        )
    }

    return json.dumps(result, indent=2)

@mcp.tool()
def geoip_lookup(ip: str) -> str:
    """
    Perform a GeoIP lookup to find the physical location, ISP, and timezone of a network address.
    
    Args:
        ip: The target IPv4 address to lookup (e.g. '8.8.8.8').
    """
    if not is_valid_ip(ip):
        return json.dumps({"success": False, "error": f"Invalid IPv4 address format: {ip}"})

    # Known standard addresses
    locations = {
        "8.8.8.8": {
            "country": "United States",
            "country_code": "US",
            "city": "Mountain View",
            "region": "California",
            "latitude": 37.4223,
            "longitude": -122.084,
            "isp": "Google LLC"
        },
        "1.1.1.1": {
            "country": "Australia",
            "country_code": "AU",
            "city": "Sydney",
            "region": "New South Wales",
            "latitude": -33.8688,
            "longitude": 151.2093,
            "isp": "Cloudflare Inc."
        }
    }

    if ip in locations:
        result = locations[ip]
    else:
        # Generates deterministic location based on IP segments to look completely realistic
        octets = [int(o) for o in ip.split(".")]
        lat = round(30.0 + (octets[2] % 20) - 10.0, 4)
        lon = round(10.0 + (octets[3] % 40) - 20.0, 4)
        
        result = {
            "country": "Germany" if octets[0] % 3 == 0 else "United States",
            "country_code": "DE" if octets[0] % 3 == 0 else "US",
            "city": "Frankfurt" if octets[0] % 3 == 0 else "Chicago",
            "region": "Hesse" if octets[0] % 3 == 0 else "Illinois",
            "latitude": lat,
            "longitude": lon,
            "isp": "Deutsche Telekom AG" if octets[0] % 3 == 0 else "Comcast Cable Communications"
        }

    result["query_ip"] = ip
    result["integration_note"] = (
        "Production API: To resolve live locations, utilize standard web services "
        "like MaxMind GeoIP2 databases, ipapi.co, or free-safe endpoints like 'http://ip-api.com/json/{ip}'."
    )

    return json.dumps(result, indent=2)

if __name__ == "__main__":
    mcp.run()
