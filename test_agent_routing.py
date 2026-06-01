import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from agent_layer.agent import agent_orchestrator

async def test():
    available_tools = [
        {"name": "check_ssl_expiry", "description": "SSL scan"},
        {"name": "whois_lookup", "description": "WHOIS scan"},
        {"name": "analyze_file_hash", "description": "Hash scan"},
        {"name": "threat_feed_ticker", "description": "Feed scan"},
        {"name": "detect_privilege_escalation", "description": "Privilege scan"},
        {"name": "summarize_malicious_activities", "description": "Correlate scan"},
        {"name": "analyze_domain_reputation", "description": "Domain rep"},
        {"name": "analyze_ip_reputation", "description": "IP rep"}
    ]
    
    queries = [
        "Check SSL cert for google.com",
        "Lookup WHOIS for microsoft.com",
        "Scan file hash e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "Show live threat ticker",
        "Audit sudo logs",
        "Summarize malicious activity for IP 198.51.100.42"
    ]
    
    for q in queries:
        tool, args, explanation = await agent_orchestrator.decide_tool(q, available_tools)
        print(f"Query: {q}")
        print(f"  Tool: {tool}")
        print(f"  Args: {args}")
        print(f"  Explanation: {explanation}")
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(test())
