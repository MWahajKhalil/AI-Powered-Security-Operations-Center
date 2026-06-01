import os
import json
import re
from typing import Dict, Any, Tuple, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Try to resolve and load the .env file from multiple locations (root and backend directory)
env_paths = [
    os.path.join(os.path.dirname(__file__), "..", "backend", ".env"),
    os.path.join(os.path.dirname(__file__), ".env"),
    os.path.join(os.getcwd(), ".env"),
    os.path.join(os.getcwd(), "backend", ".env")
]
for path in env_paths:
    if os.path.exists(path):
        load_dotenv(dotenv_path=path)
        break
else:
    load_dotenv()

class SecurityAgentOrchestrator:
    def __init__(self):
        # Retrieve Gemini API key from environment
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.has_real_llm = False
        
        # Verify the key is populated and is not the default placeholder
        if self.api_key and self.api_key != "your_gemini_api_key_here" and len(self.api_key.strip()) > 0:
            try:
                genai.configure(api_key=self.api_key.strip())
                # Pass system_instruction explicitly in constructor to satisfy strict security linter rules
                self.model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=(
                        "You are an elite, expert AI Security Analyst operating in a Security Operations Center (SOC) dashboard. "
                        "You have access to specialized Model Context Protocol (MCP) tools to help query system states and threat vectors."
                    )
                )  # type: ignore
                self.has_real_llm = True
                print("[Agent Layer] Gemini API successfully configured. Real LLM Reasoning active.")
            except Exception as e:
                print(f"[Agent Layer] WARNING: Failed to configure Gemini client: {e}. Falling back to Rule-Based routing.")
        else:
            print("[Agent Layer] INFO: No GEMINI_API_KEY found in environment or key is a placeholder. Falling back to high-fidelity local semantic routing.")

    async def decide_tool(self, user_message: str, available_tools: list) -> Tuple[Optional[str], dict, str]:
        """
        Determines which tool to execute based on user message and list of available tools.
        Returns:
            chosen_tool: str or None
            arguments: dict
            explanation: str
        """
        # If API key is available, use Gemini to reason about intent
        if self.has_real_llm:
            try:
                return await self._call_gemini_reasoner(user_message, available_tools)
            except Exception as e:
                print(f"[Agent Layer] Gemini invocation failed: {e}. Falling back to rule-based routing.")

        # Fallback Rule-Based Semantic Routing (Simulated Agent Reasoning)
        return self._local_semantic_router(user_message, available_tools)

    async def _call_gemini_reasoner(self, user_message: str, available_tools: list) -> Tuple[Optional[str], dict, str]:
        # Formulate a schema representation of tools to feed into system prompt
        tool_definitions = []
        for tool in available_tools:
            tool_definitions.append({
                "name": tool["name"],
                "description": tool["description"],
                "parameters": tool.get("inputSchema", {})
            })

        system_instruction = (
            "You are an elite, expert AI Security Analyst operating in a Security Operations Center (SOC) dashboard. "
            "You have access to specialized Model Context Protocol (MCP) tools to help query system states and threat vectors.\n\n"
            f"AVAILABLE TOOLS:\n{json.dumps(tool_definitions, indent=2)}\n\n"
            "INSTRUCTIONS:\n"
            "1. Determine if the user message requires executing a live security tool (e.g. check IP, lookup DNS, scan logs).\n"
            "2. If a tool is required: set 'chosen_tool' to its name, fill 'arguments', and write a concise statement of intent in the 'explanation' field.\n"
            "3. If NO tool is required (e.g., theoretical queries like 'What is a brute force attack?', greetings, general security discussions, or explanations of security metrics): "
            "set 'chosen_tool' to null, 'arguments' to {}, and write a highly comprehensive, educational, executive-level security analyst response in the 'explanation' field. "
            "Use beautiful markdown styling, headers, lists, and threat-modeling theories to explain your answer. Do not write a dry, short robotic sentence! Prove your expertise."
        )

        prompt = f"User Request: \"{user_message}\"\n\nJSON Response (strictly formatted JSON, no markdown fences):"
        
        # Invoke Gemini 1.5 Flash with type safety ignores for generation_config dictionary structures
        response = self.model.generate_content(  # type: ignore
            contents=[
                {"role": "user", "parts": [system_instruction, prompt]}
            ],
            generation_config={"response_mime_type": "application/json"}
        )

        try:
            decision = json.loads(response.text.strip())
            chosen_tool = decision.get("chosen_tool")
            arguments = decision.get("arguments", {})
            explanation = decision.get("explanation", "Reasoning generated by Gemini LLM.")
            
            # Map clean 'null' or empty string responses to None
            if not chosen_tool or chosen_tool == "null":
                chosen_tool = None
                
            return chosen_tool, arguments, explanation
            
        except Exception as e:
            print(f"[Agent Layer] JSON Parsing of Gemini response failed: {e}. Raw response: {response.text}")
            raise e

    def _local_semantic_router(self, user_message: str, available_tools: list) -> Tuple[Optional[str], dict, str]:
        """
        [LOCAL SEMANTIC COGNITIVE ROUTER]: Matches user request to tool functions or
        delivers beautiful, highly educational, pre-rendered security reports.
        """
        msg = user_message.lower().strip()
        tool_names = [t["name"] for t in available_tools]
        
        # ============================================================================
        # A. CONVERSATIONAL & THEORETICAL SECURITY AUDITS (OFFLINE INTERVIEW PREP)
        # ============================================================================

        # 1. Explain Impossible Travel
        if "impossible travel" in msg and ("what is" in msg or "explain" in msg or "how does" in msg):
            explanation = """### ✈️ SecOps Threat Deep-Dive: Impossible Travel Anomalies

An **Impossible Travel Anomaly** represents a physics-defying authentication pattern where a single user account logs in from two distinct geographical locations in an unrealistically tight window.

#### 📐 The Mathematical Detection Pipeline
1. **GeoIP Ingress Mapping**: Standard system login logs record the source IP. The platform maps these IPs to spatial coordinates (Latitude & Longitude) using live GeoIP routing databases.
2. **Geographical Distance (Haversine Formula)**:
   We measure the shortest spherical distance across Earth's curvature between both session coordinates:
   $$d = 2R \\arcsin\\left(\\sqrt{\\sin^2\\left(\\frac{\\Delta \\text{lat}}{2}\\right) + \\cos(\\text{lat}_1)\\cos(\\text{lat}_2)\\sin^2\\left(\\frac{\\Delta \\text{lon}}{2}\\right)}\\right)$$
3. **Required Travel Velocity**:
   $$\\text{Velocity (km/h)} = \\frac{\\text{Spherical Distance (km)}}{\\text{Time Interval between sessions (hours)}}$$
4. **Anomalous Threshold**:
   If the required velocity exceeds **$900 \\text{ km/h}$** (average speed of a commercial jetliner), the system flags a **Critical Anomaly Alert**.

#### 🛡️ Mitigation Actions (SOAR Playbook)
*   **Active Quarantine**: Terminate all active administrative sessions for the flagged user immediately.
*   **Credential Revocation**: Expire all active OAuth tokens and session cookies.
*   **MFA Escalation**: Force a strict Multi-Factor Authentication reset before allowing any further ingress connections.
"""
            return None, {}, explanation

        # 2. Explain Brute Force
        if "brute force" in msg and ("what is" in msg or "explain" in msg or "how does" in msg or "brute-force" in msg):
            explanation = """### 🛡️ SecOps Threat Deep-Dive: SSH Brute Force Attacks

An **SSH Brute Force Attack** represents an automated credential stuffing attempt where a malicious bot systematically guesses thousands of username/password combinations to gain unauthorized Shell access to your backend servers.

#### 📐 The Detection Logic (Sliding Datetime Window)
1. **Regular Expression Parsing**: The Syslog scanner reads syslog files (e.g. `/var/log/auth.log`) to parse and filter standard `Failed password for invalid user` streams.
2. **Chronological Aggregation**: Attempts are grouped by source IP and sorted chronologically.
3. **Sliding Datetime Window**: The auditor executes a sliding check (typically $10 \\text{ minutes}$). For every failed login, it recursively counts preceding authentication failures from that same source IP within the window.
4. **Rate Threshold**: If the count matches or exceeds the configured limit (typically $\\ge 5$ attempts), the system triggers a **High Alert**.

#### 🛡️ Mitigation Actions (SOAR Playbook)
*   **Firewall Isolation**: Dynamically block the source IP on local firewalls (e.g., `iptables` or Cloudflare WAF).
*   **Enforce PublicKey-Only**: Restrict SSH authentication to secure, asymmetric public-private keypairs (`AuthorizedKeysOnly = yes`), completely disabling text password submissions.
*   **Deploy fail2ban**: Run active background intrusion detection services to automatically block suspicious actors.
"""
            return None, {}, explanation

        # 3. Help Command Overview
        if "help" in msg or "what can you do" in msg or "capabilities" in msg or "hello" in msg or "hi" in msg:
            explanation = """### 🛡️ SOC Command Center: Agent Capabilities Registry

Welcome, Analyst. I am your Tier-2 Incident Investigation Assistant. I orchestrate **three active FastMCP subprocess servers** representing standard security diagnostics layers:

#### 1. 📋 Log-Analysis-Server (Syslog Auditing)
*   **Tools**:
    *   `analyze_authentication_logs`: Structured JSON relational parser.
    *   `detect_brute_force`: Sliding-window SSH flooding auditor.
    *   `detect_impossible_travel`: Haversine spherical speed coordinate checker.
    *   `detect_off_hours_logins`: Identifies access during high-risk windows ($10 \\text{ PM} \\leftrightarrow 6 \\text{ AM}$).
*   **Resources**: Exposes raw syslog streams (`file://database/auth.log`) directly for direct agentic evaluation.
*   **Prompts**: Exposes threat investigation playbook guides (`threat-audit-playbook`).

#### 2. 🛡️ Threat-Intelligence-Server (Reputation Feeds)
*   **Tools**:
    *   `analyze_ip_reputation`: Connects to AbuseIPDB API to query threat scores.
    *   `analyze_domain_reputation`: Connects to VirusTotal API to scan phishing blacklists.
    *   `geoip_lookup`: Resolves location metrics, timezones, and ISPs.
*   **Resources**: Exposes localized Indicator of Compromise signature caches (`intel://blacklist`).

#### 3. 🌐 Network-Analysis-Server (Network Routing)
*   **Tools**:
    *   `dns_lookup`: Resolves DNS configurations.
    *   `ping_host`: Safe system subprocess ping reachability checking.
*   **Resources**: Exposes active local network interfaces (`network://interfaces`).

---
*Tip: Ask me to **'Run brute force scans'**, **'Check domain suspicious-tracker.xyz'**, or ask **'What is an impossible travel anomaly?'** for detailed reports!*
"""
            return None, {}, explanation

        # ============================================================================
        # B. DYNAMIC GEOGRAPHICAL & IP ROUTING ENGINE
        # ============================================================================

        # Resolve IP addresses dynamically
        ips = re.findall(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', msg)
        if ips:
            target_ip = ips[0]
            
            # 1. Full Malicious Dynamic Correlation Scan
            if any(k in msg for k in ["summarize", "correlate", "full audit", "aggregate", "audit ip", "profile"]):
                if "summarize_malicious_activities" in tool_names:
                    return "summarize_malicious_activities", {"ip": target_ip}, f"[Local Router] Running complete security correlation audit for IP '{target_ip}'."

            # 2. Ping Check
            if any(k in msg for k in ["ping", "reach", "alive", "active", "online"]):
                if "ping_host" in tool_names:
                    return "ping_host", {"host": target_ip}, f"[Local Router] Detected Ping command for IP '{target_ip}'."

            # 3. Location Check
            if any(k in msg for k in ["location", "geo", "locate", "where", "coordinates", "city", "country"]):
                if "geoip_lookup" in tool_names:
                    return "geoip_lookup", {"ip": target_ip}, f"[Local Router] Detected GeoIP query for IP '{target_ip}'."

            # 4. Reputation Scan (Default Fallback for IPs)
            if "analyze_ip_reputation" in tool_names:
                return "analyze_ip_reputation", {"ip": target_ip}, f"[Local Router] Initiating reputation threat assessment for IP '{target_ip}'."

        # ============================================================================
        # C. DYNAMIC DOMAIN ROUTING ENGINE
        # ============================================================================

        # Resolve Domain names dynamically
        domains = re.findall(r'\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', msg)
        # Filter out parsed IPs from matching standard domain formats
        domains = [d for d in domains if not re.match(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', d)]
        
        if domains:
            target_domain = domains[0]
            stop_words = ["dns", "ping", "lookup", "resolve", "domain", "reputation", "threat", "check", "malicious", "safe", "blacklist", "ssl", "cert", "expiry", "expire", "whois", "registrar", "registrant"]
            if target_domain not in stop_words:
                
                # 1. SSL/TLS Certificate Expiry Check
                if any(k in msg for k in ["ssl", "cert", "certificate", "expiry", "expire", "notafter"]):
                    if "check_ssl_expiry" in tool_names:
                        return "check_ssl_expiry", {"domain": target_domain}, f"[Local Router] Triggering live TLS certificate expiry check for domain '{target_domain}'."

                # 2. Domain WHOIS Registration Check
                if any(k in msg for k in ["whois", "registrar", "registrant", "created", "registration"]):
                    if "whois_lookup" in tool_names:
                        return "whois_lookup", {"domain": target_domain}, f"[Local Router] Running dynamic WHOIS protocol registration scan for domain '{target_domain}'."

                # 3. DNS Resolution Check
                if any(k in msg for k in ["dns", "resolve", "lookup", "dns_lookup"]):
                    if "dns_lookup" in tool_names:
                        return "dns_lookup", {"domain": target_domain}, f"[Local Router] Detected DNS Lookup resolution query for domain '{target_domain}'."

                # 4. Domain Reputation Scan (Default Fallback for Domains)
                if "analyze_domain_reputation" in tool_names:
                    return "analyze_domain_reputation", {"domain": target_domain}, f"[Local Router] Initiating malicious signature check for domain '{target_domain}'."

        # ============================================================================
        # D. SECURITY HASH SCANNING ENGINE
        # ============================================================================

        # Resolve Cryptographic File Hashes dynamically (MD5, SHA-1, SHA-256)
        hashes = re.findall(r'\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b', msg)
        if hashes:
            target_hash = hashes[0]
            if "analyze_file_hash" in tool_names:
                return "analyze_file_hash", {"file_hash": target_hash}, f"[Local Router] Triggering live VirusTotal cryptographic file hash scan for signature '{target_hash}'."

        # ============================================================================
        # E. SECURITY LOGS ACTION PARSERS
        # ============================================================================

        # 1. sudo privilege escalation log check
        if any(k in msg for k in ["sudo", "privilege", "escalation", "elevation", "root", "su"]):
            if "detect_privilege_escalation" in tool_names:
                return "detect_privilege_escalation", {}, "[Local Router] Scanning auth logs for sudo commands and administrative updates."

        # 2. Brute Force log check
        if any(k in msg for k in ["brute", "failed", "attack", "credential", "guessing", "guess", "failed_attempt"]):
            if "detect_brute_force" in tool_names:
                return "detect_brute_force", {}, "[Local Router] Detected brute force logs scanning intent."

        # 3. Impossible Travel log check
        if any(k in msg for k in ["travel", "impossible", "velocity", "speed", "anomaly"]):
            if "detect_impossible_travel" in tool_names:
                return "detect_impossible_travel", {}, "[Local Router] Detected impossible travel logs anomaly scan."

        # 4. Off-Hours log check
        if any(k in msg for k in ["hours", "night", "late", "evening", "off-hours"]):
            if "detect_off_hours_logins" in tool_names:
                return "detect_off_hours_logins", {}, "[Local Router] Detected off-hours logs administrative audit."

        # 5. General Log parsing command
        if any(k in msg for k in ["parse", "read", "syslog", "auth.log", "auth log", "logs"]):
            if "analyze_authentication_logs" in tool_names:
                return "analyze_authentication_logs", {}, "[Local Router] Parsing standard system auth logs."

        # ============================================================================
        # F. GLOBAL CYBER THREAT FEED TICKERS
        # ============================================================================
        if any(k in msg for k in ["ticker", "feed", "cisa", "advisory", "campaign", "cve", "threats"]):
            if "threat_feed_ticker" in tool_names:
                return "threat_feed_ticker", {}, "[Local Router] Live fetching cybersecurity advisories and campaign briefs."

        # No matching tool or predefined response found
        explanation = (
            "I parsed your request, but I could not find a suitable security tool or custom runbook response.\n"
            "Try asking me to **'Check SSL cert for google.com'**, **'Audit sudo logs'**, **'Show live threat ticker'**, or **'Summarize malicious coordinates for 8.8.8.8'**!"
        )
        if not self.api_key:
            explanation += "\n\n*(Tip: Set an active GEMINI_API_KEY in your backend .env file to enable dynamic AI reasoning!)*"
            
        return None, {}, explanation

    async def synthesize_response(self, user_message: str, tool_name: str, tool_arguments: dict, tool_output: str) -> str:
        """
        [RESPONSE SYNTHESIZER]: Converts raw JSON tool output logs into a highly readable,
        polished incident report. If GEMINI_API_KEY is configured, it leverages Gemini 
        for dynamic security writing. Otherwise, it triggers the built-in Semantic Renderer.
        """
        if self.has_real_llm:
            try:
                system_instruction = (
                    "You are an expert, elite SOC Tier-2 Incident Responder operating inside an active cybersecurity console.\n"
                    "You will receive the analyst's query, the specific MCP diagnostics tool executed, and the raw tool JSON results.\n\n"
                    "Generate a gorgeous, high-density markdown Incident Summary report based on the findings. "
                    "Do NOT copy-paste the raw JSON directly. Translate JSON metrics into clean bullet points. "
                    "Highlight high threat scores (red flags), coordinate distances, velocity anomalies, and brute force counts. "
                    "Conclude with specific, highly actionable security mitigations (blocking policies, venv configurations, firewall rules)."
                )
                prompt = (
                    f"Analyst Query: \"{user_message}\"\n"
                    f"Diagnostics Tool: {tool_name}\n"
                    f"Arguments Fed: {json.dumps(tool_arguments)}\n"
                    f"Raw Tool Outcome Output:\n{tool_output}\n\n"
                    f"SOC Incident Report:"
                )
                response = self.model.generate_content([system_instruction, prompt])  # type: ignore
                return response.text.strip()
            except Exception as e:
                print(f"[Agent Layer] Gemini synthesis failed: {e}. Triggering local renderer fallback.")

        # Trigger robust local rule-based parsing renderer
        return self._local_semantic_renderer(user_message, tool_name, tool_arguments, tool_output)

    def _local_semantic_renderer(self, user_message: str, tool_name: str, tool_arguments: dict, tool_output: str) -> str:
        """
        [LOCAL SEMANTIC RENDERER]: Safe, high-fidelity JSON parser that formats tool
        outcomes into structured monospace security reports. Ensures seamless UX without LLM latency.
        """
        try:
            data = json.loads(tool_output)
        except Exception:
            return f"### Tool Execution Output\n```\n{tool_output}\n```"

        # 1. GeoIP Lookup Renderer
        if tool_name == "geoip_lookup":
            return f"""### 🗺️ Geographical Scan Audit Report
We resolved the target location and network routing details for IP **{tool_arguments.get('ip', 'Target')}**:

*   **Location Coordinates**: {data.get('city', 'Unknown')}, {data.get('region', 'Unknown')}, {data.get('country', 'Unknown')}
*   **Geographical Mapping**: Latitude: `{data.get('latitude', 0.0)}`, Longitude: `{data.get('longitude', 0.0)}`
*   **Internet Provider (ISP)**: {data.get('isp', 'Unknown ISP')}
*   **Status Profile**: Operational baseline resolved.

🛡️ **SecOps Status**: Location resolved successfully. Query matches standard cloud routes.
"""

        # 2. IP Reputation Renderer
        elif tool_name == "analyze_ip_reputation":
            is_mal = data.get("is_malicious", False)
            score = data.get("threat_score", 0)
            status_pill = "🔴 CRITICAL THREAT FLAG" if is_mal else "🟢 SAFE - TRUSTED IP"
            return f"""### 🛡️ IP Security Reputation Audit
Security query performed for target IP **{tool_arguments.get('ip', 'Target')}**:

*   **Audit Evaluation**: **{status_pill}**
*   **Threat Confidence Score**: `{score} / 100`
*   **Scan Detections**: {data.get('detections', 'No detections')}
*   **Attributed Category**: {data.get('category', 'Clean')}
*   **Source Country**: {data.get('country', 'Unknown')}

⚠️ **Recommended Action**: {"Immediate blocking suggested. Update firewall WAF rules to reject all packets from this IP address." if is_mal else "No quarantine required. Host exhibits baseline safe transactions."}
"""

        # 3. Domain Reputation Renderer
        elif tool_name == "analyze_domain_reputation":
            is_mal = data.get("is_malicious", False)
            score = data.get("threat_score", 0)
            status_pill = "🔴 DANGEROUS Phishing DOMAIN" if is_mal else "🟢 SAFE REGISTERED DOMAIN"
            return f"""### 🌐 Domain Security Reputation Audit
Security scan completed for domain **{tool_arguments.get('domain', 'Target')}**:

*   **Audit Evaluation**: **{status_pill}**
*   **Threat Index Score**: `{score} / 100`
*   **Domain Age**: {data.get('age_days', 365)} days
*   **Registrar Attributed**: {data.get('registrar', 'Unknown')}
*   **Status Indicators**: {data.get('status', 'Safe')}

⚠️ **Incident Response Action**: {"Quarantine this domain on internal DNS configurations and reset active session cookies." if is_mal else "Domain is verified safe. Normal network routing allowed."}
"""

        # 4. Brute Force Detection Renderer
        elif tool_name == "detect_brute_force":
            detected = data.get("brute_force_detected", False)
            incidents = data.get("incidents", [])
            if not detected or not incidents:
                return f"""### 🛡️ SSH Authentication Brute-Force Check
The Syslog brute force auditor completed a scan across system logs.

*   **Evaluation Status**: **🟢 CLEAN - NO ATTACKS DETECTED**
*   **Scan Window**: 10 minutes sliding window checks
*   **Recommendation**: Continue routine logins audits. Enforce publickey authentication policies.
"""
            report = f"### ⚠️ CRITICAL ALERT: SSH BRUTE FORCE DETECTED\nThe log analyzer parsed the Syslog file and identified active credential flooding brute force attacks:\n\n"
            for inc in incidents:
                report += f"*   **Source IP**: `{inc.get('ip')}`\n"
                report += f"    *   **Failed Access Floods**: `{inc.get('failed_count')} password guesses`\n"
                report += f"    *   **Targeted Username**: Administrative account `{inc.get('target_username')}`\n"
                report += f"    *   **Attack Duration**: {inc.get('window_start')} to {inc.get('window_end')}\n\n"
            report += f"🛡️ **SOAR Action Required**: Immediately configure `fail2ban` thresholds or add local firewall blocking rules to drop packets from these IPs."
            return report

        # 5. Impossible Travel Anomaly Renderer
        elif tool_name == "detect_impossible_travel":
            detected = data.get("impossible_travel_detected", False)
            incidents = data.get("incidents", [])
            if not detected or not incidents:
                return f"""### ✈️ Geographical Impossible Travel Check
The Haversine travel velocity anomaly check completed:

*   **Evaluation Status**: **🟢 CLEAN - NORMAL SESSION VELOCITIES**
*   **Scan Details**: Analyzed concurrent user session coordinates.
*   **Recommendation**: Secure network baseline established. No account locking required.
"""
            report = f"### 🚨 CRITICAL THREAT: IMPOSSIBLE TRAVEL ANOMALY\nThe log parser resolved geographical coordinate distances and flagged impossible travel logins:\n\n"
            for inc in incidents:
                report += f"*   **Flagged Username**: `{inc.get('username')}`\n"
                report += f"    *   **Session 1**: {inc.get('session_1', {}).get('timestamp')} from **{inc.get('session_1', {}).get('location')}**\n"
                report += f"    *   **Session 2**: {inc.get('session_2', {}).get('timestamp')} from **{inc.get('session_2', {}).get('location')}**\n"
                report += f"    *   **Geographical Distance**: {inc.get('geographical_distance_km')} kilometers\n"
                report += f"    *   **Required Travel Velocity**: **{inc.get('required_velocity_kmh')} km/h** (Exceeds commercial jet speeds!)\n\n"
            report += f"🔒 **Incident Response Action**: Terminate all active sessions for flagged accounts immediately, revoke authentication tokens, and force password resets."
            return report

        # 6. Off-Hours Logins Renderer
        elif tool_name == "detect_off_hours_logins":
            incidents = data.get("incidents", [])
            if not incidents:
                return f"""### 🌃 Administrative Off-Hours Logins Check
The off-hours administrative access checks completed:

*   **Evaluation Status**: **🟢 CLEAN - NO OFF-HOURS ACCESS**
*   **Audit Scope**: Analyzed successful logins between 10 PM and 6 AM.
*   **Recommendation**: Access parameters stable.
"""
            report = f"### ⚠️ WARNING: OFF-HOURS ADMINISTRATIVE ACCESS\nThe log auditor flagged successful root administrative logins during non-business hours:\n\n"
            for inc in incidents:
                report += f"*   **Username**: `{inc.get('username')}`\n"
                report += f"    *   **Login Time**: {inc.get('timestamp')} ({inc.get('hour')} hour block)\n"
                report += f"    *   **Source IP**: `{inc.get('ip')}`\n"
                report += f"    *   **Syslog Entry**: *\"{inc.get('raw_message')}\"*\n\n"
            report += f"🛡️ **SecOps Recommendation**: Correlate logins timestamps with active maintenance logs or change requests to confirm authorization."
            return report

        # 7. Log Analysis Ingress Parser
        elif tool_name == "analyze_authentication_logs":
            return f"""### 📋 System Syslog Authentication Parse Report
Successfully parsed administrative log file:

*   **Database Target**: `{data.get('log_file')}`
*   **Relational Logs Extracted**: {data.get('total_parsed_lines')} syslog entries mapped.
*   **Ingress Audit Status**: Normal logs parameters listening.
"""

        # 8. SSL Certificate Expiry Renderer
        elif tool_name == "check_ssl_expiry":
            if not data.get("success", False):
                return f"### ❌ SSL Certificate Check Failed\n{data.get('error', 'Failed checking TLS certificate.')}"
            is_exp = data.get("is_expired", False)
            status_pill = "🔴 EXPIRED" if is_exp else "🟢 VALID & SECURE"
            return f"""### 🔒 SSL/TLS Certificate Expiry Audit
We retrieved the active SSL/TLS peer certificate details for domain **{data.get('domain')}**:

*   **Certificate Status**: **{status_pill}**
*   **Validity Remaining**: `{data.get('days_remaining')} days`
*   **Expiration Date**: `{data.get('expiry_date')}`
*   **Certificate Authority (Issuer)**: `{data.get('issuer')}`
*   **Serial Number**: `{data.get('serialNumber')}`

🛡️ **SecOps Advisory**: {"Immediate action required: The certificate is expired or expiring. Renew immediately to prevent site downtime or client warning indicators." if data.get('days_remaining', 365) < 15 else "The certificate is active, valid, and trusted. No security actions required."}
"""

        # 9. Domain WHOIS Registration Renderer
        elif tool_name == "whois_lookup":
            if not data.get("success", False):
                return f"### ❌ WHOIS Resolution Error\n{data.get('error', 'Failed executing WHOIS lookup.')}"
            return f"""### 📋 Domain WHOIS Registration Registry
We executed a raw socket WHOIS lookup on port 43 for domain **{data.get('domain')}**:

*   **Attributed Registrar**: `{data.get('registrar')}`
*   **Creation / Registration Date**: `{data.get('creation_date')}`
*   **Registry Expiration Date**: `{data.get('expiry_date')}`
*   **Authoritative Server**: `{data.get('authoritative_whois_server')}`

#### 🔍 Authoritative WHOIS Registry Raw Snippet
```
{data.get('raw_record_snippet')}
```

🛡️ **SecOps Status**: Domain lookup completed successfully. Review age and registrar to verify trust levels.
"""

        # 10. VirusTotal File Hash Reputation Renderer
        elif tool_name == "analyze_file_hash":
            if not data.get("success", False):
                return f"### ❌ VirusTotal Reputation Scan Failed\n{data.get('error', 'Cryptographic hash inspection failed.')}"
            if "message" in data:
                return f"""### 🛡️ File Hash Threat Reputation Scan
Security lookup completed for cryptographic signature **{data.get('hash')}**:

*   **Status Index**: **🟢 DETECTIONS NOT FOUND**
*   **Scan Database Message**: {data.get('message')}

🛡️ **SecOps Action**: This hash is not cataloged in VirusTotal. It could be a secure, custom-compiled local asset, or a highly targeted zero-day threat signature. Perform local sandboxing to verify.
"""
            is_mal = data.get("is_malicious", False)
            status_pill = "🔴 HIGH-RISK MALICIOUS ARTIFACT" if is_mal else "🟢 UNFLAGGED / SAFE BINARY"
            return f"""### 🛡️ File Hash Threat Reputation Scan
Live VirusTotal file intelligence query completed for signature **{data.get('hash')}**:

*   **Threat Assessment Evaluation**: **{status_pill}**
*   **Security Detections**: `{data.get('malicious_count')} / {data.get('total_engines')} antivirus engines flagged this file`
*   **Calculated Threat Index Score**: `{data.get('threat_score')} / 100`
*   **Reported Binary Filename**: `{data.get('meaningful_name')}`
*   **File Category & Format**: {data.get('file_type')} (`{data.get('file_size_bytes')} bytes`)

⚠️ **Incident Response Action**: {"Binary classified as malicious. Purge this file immediately from all endpoints, update Endpoint Detection WAF rules, and trigger full system scans." if is_mal else "The cryptographic signature is clean. Normal execution allowed."}
"""

        # 11. CISA Threat Feed Ticker Renderer
        elif tool_name == "threat_feed_ticker":
            if not data.get("success", False):
                return f"### ❌ Threat Feed Connection Error\n{data.get('error', 'Failed loading advisories.')}"
            
            advisories = data.get("advisories", [])
            if not advisories:
                return "### 📰 Global Cybersecurity Threat Feed\nLive feed fetched successfully. No critical alerts are reported in the active window."
                
            report = f"### 📰 Global Cybersecurity Threat Feed\nFetched active advisories from **{data.get('feed_source')}**:\n\n"
            for adv in advisories:
                report += f"#### ⚠️ {adv.get('title')}\n"
                report += f"*   **Published Date**: {adv.get('published')}\n"
                report += f"*   **Campaign Summary**: {adv.get('summary')}\n"
                if adv.get("link"):
                    report += f"*   **Official Advisory Details Link**: {adv.get('link')}\n"
                report += "\n"
            return report

        # 12. Log Privilege Escalation Renderer
        elif tool_name == "detect_privilege_escalation":
            if not data.get("success", False):
                return f"### ❌ Privilege Scan Error\n{data.get('error', 'Syslog privilege parsing failed.')}"
                
            incidents = data.get("incidents", [])
            if not incidents:
                return f"""### 🛡️ Administrative Privilege Escalation Scan
The Syslog privilege escalation auditor completed scanning:

*   **Evaluation Status**: **🟢 CLEAN - NO ADMINISTRATIVE ESCALATIONS**
*   **Audit Target Log**: `{data.get('log_file')}`
*   **Advisory**: Routine sudo executions are baseline secure.
"""
            report = f"### ⚠️ WARNING: ADMINISTRATIVE SUDO PRIVILEGE SHIFTS\nThe syslog parser resolved active administrative escalations in `{data.get('log_file')}`:\n\n"
            for inc in incidents:
                status = inc.get("status")
                status_pill = "🔴 FAILED" if status == "FAILED" else "🟡 SUCCESS"
                report += f"*   **Time Stamp**: `{inc.get('timestamp')}` on host `{inc.get('host')}`\n"
                report += f"    *   **User Action**: Account `{inc.get('user')}` attempted elevation to target user `{inc.get('target_user')}`\n"
                report += f"    *   **Authorization Status**: **{status_pill}** (Severity: {inc.get('severity')})\n"
                report += f"    *   **Binary Command Executed**: `{inc.get('command')}`\n\n"
            report += f"🛡️ **SecOps Recommended Action**: Verify authorization for successful elevations. Review all failed privilege elevations as they represent potential lateral movement attempts."
            return report

        # 13. Dynamic IP Correlation Audit Renderer
        elif tool_name == "summarize_malicious_activities":
            if not data.get("success", False):
                return f"### ❌ Malicious Audit Scan Failed\n{data.get('error', 'IP correlation audit failed.')}"
                
            gp = data.get("geoip_profile", {})
            ps = data.get("live_port_scan", {})
            tr = data.get("local_syslog_traces", {})
            risk = data.get("risk_index", "LOW")
            risk_pill = "🔴 HIGH RISK PROFILE" if risk == "HIGH" else "🟡 MEDIUM RISK PROFILE" if risk == "MEDIUM" else "🟢 LOW RISK PROFILE"
            
            report = f"""### 🚨 SOC Core Incident Report: Malicious IP Correlation Audit
We correlated live geographical coordinates, network interface port states, and local auth syslog traces for **{data.get('target_ip')}**:

*   **Risk Categorization**: **{risk_pill}**
*   **Geographical Coordinates**: {gp.get('city')}, {gp.get('country')} (`{gp.get('coordinates')}`)
*   **Live Open Port Scan**: Detected **{ps.get('open_ports_count')} open service ports** out of {len(ps.get('scanned_ports', []))} checked:
    *   `Open Ports: {', '.join(str(p) for p in ps.get('open_ports', [])) or 'None'}`
*   **Syslog Occurrences Trace**: Found **{tr.get('trace_count')} historical logon occurrences** in auth syslog logs.
"""
            if tr.get('occurrences'):
                report += "\n#### 📋 Local Syslog History Traces\n"
                for idx, occ in enumerate(tr.get('occurrences')[:5]):
                    report += f"*   `[{occ.get('timestamp')}]` status: **{occ.get('status')}** for user `{occ.get('username')}` (Service: `{occ.get('service')}`)\n"
                    
            report += f"\n🛡️ **Incident Mitigation Plan**: {data.get('mitigation_plan')}"
            return report

        # General Fallback
        return f"### {tool_name} Result\n{json.dumps(data, indent=2)}"

# App-wide singleton instance of the agent
agent_orchestrator = SecurityAgentOrchestrator()
