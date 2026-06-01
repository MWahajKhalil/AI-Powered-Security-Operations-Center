from mcp.server.fastmcp import FastMCP
import json
import re
import os
import math
import urllib.request
import time
from datetime import datetime, timedelta

# Initialize FastMCP Server for Log Analysis
mcp = FastMCP("Log-Analysis-Server")

DEFAULT_LOG_PATH = "/Users/mwahajkhalil/Learnings/MCP Project/database/auth.log"

def get_log_path(override_path: str = None) -> str:
    """Resolves log file path, falling back to absolute default workspace path."""
    if override_path and len(override_path.strip()) > 0:
        return override_path.strip()
    return DEFAULT_LOG_PATH

def parse_timestamp(ts_str: str) -> datetime:
    """Parses syslog timestamps (e.g. 'Jun  1 08:30:15') into datetime objects."""
    current_year = datetime.now().year
    # Normalize multiple whitespaces (e.g., 'Jun  1' -> 'Jun 1')
    normalized_ts = " ".join(ts_str.split())
    try:
        return datetime.strptime(f"{current_year} {normalized_ts}", "%Y %b %d %H:%M:%S")
    except Exception:
        # Safe fallback in case of formatting mismatch
        return datetime.now()

def parse_syslog_line(line: str):
    """Parses a single syslog authentication entry into a structured dictionary."""
    # Matches standard Syslog headers: Timestamp Host Process[PID]: Message
    syslog_regex = r"^([A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(\S+?):\s+(.*)$"
    match = re.match(syslog_regex, line.strip())
    if not match:
        return None
    
    timestamp_str, host, service, message = match.groups()
    
    status = "INFO"
    username = "unknown"
    ip = "127.0.0.1"
    
    # 1. SSH login failures
    failed_match = re.search(r"Failed password for (?:invalid user )?(\S+) from (\S+)", message)
    if failed_match:
        status = "FAILED"
        username = failed_match.group(1)
        ip = failed_match.group(2)
        
    # 2. SSH successful logins (password or publickey)
    elif "Accepted password for" in message or "Accepted publickey for" in message:
        accepted_match = re.search(r"Accepted (?:password|publickey) for (\S+) from (\S+)", message)
        if accepted_match:
            status = "SUCCESS"
            username = accepted_match.group(1)
            ip = accepted_match.group(2)
            
    # 3. pam_unix session status logging
    elif "session opened" in message:
        opened_match = re.search(r"session opened for user (\S+)", message)
        if opened_match:
            status = "SUCCESS"
            username = opened_match.group(1).split("(")[0] # clean username(0) -> username
            
    return {
        "timestamp": timestamp_str,
        "datetime": parse_timestamp(timestamp_str),
        "host": host,
        "service": service,
        "status": status,
        "username": username,
        "ip": ip,
        "message": message
    }

def get_geoip(ip: str):
    """Fetches GeoIP data live from keyless IP-API, with high-fidelity mock fallbacks."""
    # Exclude internal local loopbacks
    if ip.startswith("127.") or ip.startswith("192.168."):
        return {"latitude": 37.7749, "longitude": -122.4194, "country": "United States", "city": "San Francisco"}
        
    try:
        url = f"http://ip-api.com/json/{ip}"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (AI SOC Command Center)"}
        )
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data.get("status") == "success":
                return {
                    "latitude": data.get("lat", 0.0),
                    "longitude": data.get("lon", 0.0),
                    "country": data.get("country", "Unknown"),
                    "city": data.get("city", "Unknown")
                }
    except Exception:
        pass
    
    # Resilient local fallback coordinates to ensure offline stability
    fallbacks = {
        "8.8.8.8": {"latitude": 39.03, "longitude": -77.5, "country": "United States", "city": "Ashburn"},
        "1.1.1.1": {"latitude": -33.8688, "longitude": 151.2093, "country": "Australia", "city": "Sydney"},
        "203.0.113.80": {"latitude": 50.1107, "longitude": 8.6821, "country": "Germany", "city": "Frankfurt"},
        "198.51.100.42": {"latitude": 55.7558, "longitude": 37.6173, "country": "Russia", "city": "Moscow"}
    }
    return fallbacks.get(ip, {"latitude": 0.0, "longitude": 0.0, "country": "Unknown", "city": "Unknown"})

def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Calculates geographical distance in kilometers between two points using Haversine formula."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2)**2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@mcp.tool()
def analyze_authentication_logs(log_file_path: str = None) -> str:
    """
    Parses SSH/system authentication syslog records and converts raw logs into structured JSON audits.
    
    Args:
        log_file_path: Optional path to the log file (defaults to standard database/auth.log).
    """
    target_path = get_log_path(log_file_path)
    if not os.path.exists(target_path):
        return json.dumps({"success": False, "error": f"Log file not found: {target_path}"})
        
    parsed_entries = []
    with open(target_path, "r") as f:
        for line in f:
            parsed = parse_syslog_line(line)
            if parsed:
                # Remove datetime object for JSON serialization
                parsed.pop("datetime", None)
                parsed_entries.append(parsed)
                
    result = {
        "log_file": target_path,
        "total_parsed_lines": len(parsed_entries),
        "logs": parsed_entries,
        "integration_note": "Log Analysis: Successfully parsed syslog text stream into relational dictionaries."
    }
    return json.dumps(result, indent=2)

@mcp.tool()
def detect_brute_force(log_file_path: str = None, threshold: int = 5, window_minutes: int = 10) -> str:
    """
    Scans auth logs to detect brute-force attacks where a single IP has multiple failed logins in a tight window.
    
    Args:
        log_file_path: Optional path to log file (defaults to database/auth.log).
        threshold: The minimum failed password attempts to trigger alert (default is 5).
        window_minutes: The sliding time window in minutes (default is 10).
    """
    target_path = get_log_path(log_file_path)
    if not os.path.exists(target_path):
        return json.dumps({"success": False, "error": f"Log file not found: {target_path}"})
        
    failed_attempts = []
    with open(target_path, "r") as f:
        for line in f:
            parsed = parse_syslog_line(line)
            if parsed and parsed["status"] == "FAILED":
                failed_attempts.append(parsed)
                
    # Sort failed attempts by IP and time
    failed_attempts.sort(key=lambda x: (x["ip"], x["datetime"]))
    
    flagged_ips = {}
    
    # Sliding window brute-force analysis
    for i, attempt in enumerate(failed_attempts):
        ip = attempt["ip"]
        dt = attempt["datetime"]
        
        # Count preceding failed attempts from same IP within the window_minutes
        current_window = [attempt]
        for prev_attempt in failed_attempts[:i]:
            if prev_attempt["ip"] == ip:
                time_diff = dt - prev_attempt["datetime"]
                if time_diff >= timedelta(0) and time_diff <= timedelta(minutes=window_minutes):
                    current_window.append(prev_attempt)
                    
        if len(current_window) >= threshold:
            if ip not in flagged_ips or len(current_window) > flagged_ips[ip]["failed_count"]:
                flagged_ips[ip] = {
                    "ip": ip,
                    "target_username": attempt["username"],
                    "failed_count": len(current_window),
                    "window_start": min(c["timestamp"] for c in current_window),
                    "window_end": max(c["timestamp"] for c in current_window),
                    "alert": "HIGH - SSH BRUTE FORCE DETECTED"
                }
                
    result = {
        "log_file": target_path,
        "brute_force_detected": len(flagged_ips) > 0,
        "incidents": list(flagged_ips.values()),
        "security_recommendation": "Configure iptables/fail2ban, block flagged IPs, and enforce publickey-only logins."
    }
    return json.dumps(result, indent=2)

@mcp.tool()
def detect_off_hours_logins(log_file_path: str = None, start_hour: int = 22, end_hour: int = 6) -> str:
    """
    Identifies successful user logins occurring during non-standard business hours (e.g. 10 PM to 6 AM).
    
    Args:
        log_file_path: Optional path to log file (defaults to database/auth.log).
        start_hour: Start of off-hours window (24h format, default 22).
        end_hour: End of off-hours window (24h format, default 6).
    """
    target_path = get_log_path(log_file_path)
    if not os.path.exists(target_path):
        return json.dumps({"success": False, "error": f"Log file not found: {target_path}"})
        
    off_hours_logins = []
    with open(target_path, "r") as f:
        for line in f:
            parsed = parse_syslog_line(line)
            # We only track successful logins
            if parsed and parsed["status"] == "SUCCESS" and "session opened" not in parsed["message"]:
                dt = parsed["datetime"]
                hour = dt.hour
                
                # Check if hour is in off-hours (e.g. >= 22 or <= 6)
                is_off_hour = False
                if start_hour > end_hour: # Crosses midnight (e.g. 22 to 6)
                    is_off_hour = (hour >= start_hour or hour <= end_hour)
                else: # Standard window (e.g. 1 to 5)
                    is_off_hour = (start_hour <= hour <= end_hour)
                    
                if is_off_hour:
                    off_hours_logins.append({
                        "timestamp": parsed["timestamp"],
                        "username": parsed["username"],
                        "ip": parsed["ip"],
                        "hour": f"{hour:02d}:00",
                        "raw_message": parsed["message"],
                        "alert": "MEDIUM - OFF-HOURS SYSTEM ACCESS ACCESS DETECTED"
                    })
                    
    result = {
        "log_file": target_path,
        "suspicious_logins_found": len(off_hours_logins),
        "incidents": off_hours_logins,
        "security_recommendation": "Correlate flagged usernames with active change requests or scheduled maintenance logs."
    }
    return json.dumps(result, indent=2)

@mcp.tool()
def detect_impossible_travel(log_file_path: str = None) -> str:
    """
    Scans logs for identical users logging in from different geographical areas within unrealistic travel timeframes.
    
    Args:
        log_file_path: Optional path to log file (defaults to database/auth.log).
    """
    target_path = get_log_path(log_file_path)
    if not os.path.exists(target_path):
        return json.dumps({"success": False, "error": f"Log file not found: {target_path}"})
        
    successful_logins = []
    with open(target_path, "r") as f:
        for line in f:
            parsed = parse_syslog_line(line)
            # Track accepted passwords or keys (actual interactive sessions)
            if parsed and parsed["status"] == "SUCCESS" and "session opened" not in parsed["message"]:
                successful_logins.append(parsed)
                
    # Group logins by username
    user_logins = {}
    for login in successful_logins:
        username = login["username"]
        if username not in user_logins:
            user_logins[username] = []
        user_logins[username].append(login)
        
    incidents = []
    geoip_cache = {} # Cache lookups to avoid rate limiting
    
    for username, logins in user_logins.items():
        # Sort logins chronologically
        logins.sort(key=lambda x: x["datetime"])
        
        for i in range(len(logins) - 1):
            login_1 = logins[i]
            login_2 = logins[i+1]
            
            ip_1 = login_1["ip"]
            ip_2 = login_2["ip"]
            
            # Skip if same IP
            if ip_1 == ip_2:
                continue
                
            # Fetch locations (use cache if possible)
            if ip_1 not in geoip_cache:
                geoip_cache[ip_1] = get_geoip(ip_1)
            if ip_2 not in geoip_cache:
                geoip_cache[ip_2] = get_geoip(ip_2)
                
            loc_1 = geoip_cache[ip_1]
            loc_2 = geoip_cache[ip_2]
            
            # Calculate distance using Haversine
            dist_km = haversine_distance(
                loc_1["latitude"], loc_1["longitude"],
                loc_2["latitude"], loc_2["longitude"]
            )
            
            # Calculate time difference in hours
            time_diff = login_2["datetime"] - login_1["datetime"]
            time_diff_hours = time_diff.total_seconds() / 3600.0
            
            if time_diff_hours <= 0:
                continue
                
            # Calculate velocity in km/h
            velocity_kmh = dist_km / time_diff_hours
            
            # If speed is physically impossible (e.g. > 900 km/h for a commercial jet flight)
            if velocity_kmh > 900.0:
                incidents.append({
                    "username": username,
                    "session_1": {
                        "timestamp": login_1["timestamp"],
                        "ip": ip_1,
                        "location": f"{loc_1['city']}, {loc_1['country']}",
                        "coordinates": f"{loc_1['latitude']}, {loc_1['longitude']}"
                    },
                    "session_2": {
                        "timestamp": login_2["timestamp"],
                        "ip": ip_2,
                        "location": f"{loc_2['city']}, {loc_2['country']}",
                        "coordinates": f"{loc_2['latitude']}, {loc_2['longitude']}"
                    },
                    "geographical_distance_km": round(dist_km, 2),
                    "time_interval_minutes": round(time_diff_hours * 60, 2),
                    "required_velocity_kmh": round(velocity_kmh, 2),
                    "alert": "CRITICAL - IMPOSSIBLE TRAVEL ANOMALY DETECTED"
                })
                
    result = {
        "log_file": target_path,
        "impossible_travel_detected": len(incidents) > 0,
        "incidents": incidents,
        "security_recommendation": "Immediately terminate all active sessions for flagged users and force multi-factor authentication resets."
    }
    return json.dumps(result, indent=2)

if __name__ == "__main__":
    mcp.run()
