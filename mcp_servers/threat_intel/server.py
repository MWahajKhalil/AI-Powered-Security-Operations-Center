from mcp.server.fastmcp import FastMCP
import json
import random
import re
import os
import urllib.request
import urllib.error
import time

# Initialize FastMCP Server for Threat Intelligence
mcp = FastMCP("Threat-Intelligence-Server")

@mcp.resource("intel://blacklist")
def get_intel_blacklist() -> str:
    """
    [MCP RESOURCE]: Exposes the active blacklisted threat signatures (Indicators of Compromise).
    
    Demonstrates the second core pillar of the Model Context Protocol (Resources),
    allowing LLMs to read structured, read-only feeds of localized threat signatures.
    """
    return json.dumps({
        "last_updated": "2026-06-01T12:00:00Z",
        "total_signatures": 4,
        "blacklisted_ips": ["198.51.100.42", "203.0.113.80"],
        "blacklisted_domains": ["malicious-tracker.xyz", "suspicious-tracker.xyz"],
        "confidence_level": "HIGH",
        "source": "Local Threat Intel Ingress Feed"
    }, indent=2)

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
    Queries the live AbuseIPDB API if configured, otherwise falls back to simulated intelligence.
    
    Args:
        ip: The target IPv4 address (e.g. '1.1.1.1' or '198.51.100.42').
    """
    if not is_valid_ip(ip):
        return json.dumps({"success": False, "error": f"Invalid IPv4 address format: {ip}"})

    # Try to load live AbuseIPDB credentials
    api_key = os.getenv("ABUSEIPDB_API_KEY")
    if api_key and api_key != "your_abuseipdb_api_key_here" and len(api_key.strip()) > 0:
        try:
            url = f"https://api.abuseipdb.com/api/v2/check?ipAddress={ip}&maxAgeInDays=90&verbose=true"
            req = urllib.request.Request(
                url, 
                headers={
                    "Key": api_key.strip(),
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (AI SOC Command Center)"
                }
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                payload = json.loads(response.read().decode("utf-8"))
                data = payload.get("data", {})
                
                score = data.get("abuseConfidenceScore", 0)
                reports = data.get("totalReports", 0)
                country_name = data.get("countryName", "Unknown")
                
                result = {
                    "is_malicious": score > 20,
                    "threat_score": score,
                    "category": data.get("usageType") or "Clean / Unclassified",
                    "abuse_score": score,
                    "country": country_name,
                    "detections": f"{reports} security engine reports flag this IP on AbuseIPDB.",
                    "integration_note": "Production API: Connected to live AbuseIPDB Check Core Endpoint."
                }
                return json.dumps(result, indent=2)
        except Exception as e:
            # Fall back to simulated DB if request fails (resilience)
            pass

    # ============================================================================
    # FALLBACK MOCK DATA (If no API key provided or API call fails)
    # ============================================================================
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

    known_cleans = {
        "8.8.8.8": "Google Public DNS",
        "1.1.1.1": "Cloudflare DNS Resolver",
        "127.0.0.1": "Local Host Loopback"
    }

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

    result["integration_note"] = "Simulation Mode: Enter an active ABUSEIPDB_API_KEY in .env to query live threat scans."
    return json.dumps(result, indent=2)

@mcp.tool()
def analyze_domain_reputation(domain: str) -> str:
    """
    Check the security reputation of a domain to detect phishing, malvertising, or registration spikes.
    Queries the live VirusTotal v3 API if configured, otherwise falls back to simulated intelligence.
    
    Args:
        domain: The domain name to analyze (e.g. 'secure-login-bank.com').
    """
    cleaned_domain = domain.lower().strip()
    if not is_valid_domain(cleaned_domain):
        return json.dumps({"success": False, "error": f"Invalid domain name format: {domain}"})

    # Try to load live VirusTotal credentials
    api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if api_key and api_key != "your_virustotal_api_key_here" and len(api_key.strip()) > 0:
        try:
            url = f"https://www.virustotal.com/api/v3/domains/{cleaned_domain}"
            req = urllib.request.Request(
                url, 
                headers={
                    "x-apikey": api_key.strip(),
                    "User-Agent": "Mozilla/5.0 (AI SOC Command Center)"
                }
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                payload = json.loads(response.read().decode("utf-8"))
                attributes = payload.get("data", {}).get("attributes", {})
                
                stats = attributes.get("last_analysis_stats", {})
                malicious_count = stats.get("malicious", 0)
                score = int((malicious_count / max(1, sum(stats.values()))) * 100)
                
                creation_date = attributes.get("creation_date")
                age_days = 365
                if creation_date:
                    age_seconds = time.time() - creation_date
                    age_days = int(age_seconds / 86400)
                
                result = {
                    "domain": cleaned_domain,
                    "is_malicious": malicious_count > 0,
                    "threat_score": score,
                    "status": "Malicious / Flagged" if malicious_count > 0 else "Safe",
                    "registrar": attributes.get("registrar", "Unknown Registrar"),
                    "age_days": age_days,
                    "integration_note": "Production API: Connected to live VirusTotal v3 Domain Intelligence Endpoint."
                }
                return json.dumps(result, indent=2)
        except Exception as e:
            # Fall back to simulated DB if request fails
            pass

    # ============================================================================
    # FALLBACK MOCK DATA (If no API key provided or API call fails)
    # ============================================================================
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
        "integration_note": "Simulation Mode: Enter a VIRUSTOTAL_API_KEY in .env to query live domain metadata."
    }
    return json.dumps(result, indent=2)

@mcp.tool()
def geoip_lookup(ip: str) -> str:
    """
    Perform a GeoIP lookup to find the physical location, ISP, and timezone of a network address.
    Queries the live keyless IP-API server, falling back to simulated data only if offline.
    
    Args:
        ip: The target IPv4 address to lookup (e.g. '8.8.8.8').
    """
    if not is_valid_ip(ip):
        return json.dumps({"success": False, "error": f"Invalid IPv4 address format: {ip}"})

    # Try keyless, free live GeoIP scan
    try:
        url = f"http://ip-api.com/json/{ip}"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (AI SOC Command Center)"}
        )
        with urllib.request.urlopen(req, timeout=4) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data.get("status") == "success":
                result = {
                    "country": data.get("country", "Unknown Country"),
                    "country_code": data.get("countryCode", "UN"),
                    "city": data.get("city", "Unknown City"),
                    "region": data.get("regionName", "Unknown Region"),
                    "latitude": data.get("lat", 0.0),
                    "longitude": data.get("lon", 0.0),
                    "isp": data.get("isp", "Unknown ISP"),
                    "query_ip": ip,
                    "integration_note": "Production API: Connected to live keyless IP-API server."
                }
                return json.dumps(result, indent=2)
    except Exception as e:
        # Fall back to simulated DB if network is down
        pass

    # ============================================================================
    # FALLBACK MOCK DATA (If offline or query fails)
    # ============================================================================
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
    result["integration_note"] = "Simulation Mode: Active GeoIP offline fallback triggered."
    return json.dumps(result, indent=2)

if __name__ == "__main__":
    mcp.run()
