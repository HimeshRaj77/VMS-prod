import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from openai import OpenAI

logger = logging.getLogger("token_tracker")
logging.basicConfig(level=logging.INFO)

# OpenAI Pricing (as of May 2026)
# GPT-4o Mini pricing
PRICING = {
    "gpt-4o-mini": {
        "input_per_1k_tokens": 0.00015,      # $0.15 per 1M input tokens
        "output_per_1k_tokens": 0.0006,      # $0.60 per 1M output tokens
    },
    "gpt-4": {
        "input_per_1k_tokens": 0.03,         # $30 per 1M input tokens
        "output_per_1k_tokens": 0.06,        # $60 per 1M output tokens
    }
}

# Track file path
TRACKING_FILE = Path(__file__).parent / "token_usage.json"


class TokenTracker:
    """Tracks OpenAI token usage and costs for quota management."""
    
    def __init__(self, tracking_file: Path = TRACKING_FILE):
        self.tracking_file = tracking_file
        self.usage_data = self._load_usage()
    
    def _load_usage(self) -> Dict[str, Any]:
        """Load existing usage data or create new."""
        if self.tracking_file.exists():
            try:
                with open(self.tracking_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                logger.warning(f"Failed to load {self.tracking_file}, starting fresh")
        
        return {
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "requests": [],
            "monthly_summary": {}
        }
    
    def _save_usage(self):
        """Persist usage data to file."""
        self.usage_data["last_updated"] = datetime.now().isoformat()
        try:
            with open(self.tracking_file, 'w') as f:
                json.dump(self.usage_data, f, indent=2)
            logger.info(f"Usage data saved to {self.tracking_file}")
        except IOError as e:
            logger.error(f"Failed to save usage data: {e}")
    
    def log_request(self, model: str, input_tokens: int, output_tokens: int, 
                    quotation_id: str = None, source_file: str = None):
        """Log a single OpenAI API request."""
        cost = self._calculate_cost(model, input_tokens, output_tokens)
        request_data = {
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": input_tokens + output_tokens,
            "quotation_id": quotation_id,
            "source_file": source_file,
            "cost_usd": cost
        }
        
        self.usage_data["requests"].append(request_data)
        self._save_usage()
        
        # Color codes for pretty terminal logs
        bold = '\033[1m'
        cyan = '\033[96m'
        yellow = '\033[93m'
        green = '\033[92m'
        end = '\033[0m'
        
        # Print a beautiful visual log card to the console stdout
        print(f"\n{bold}{cyan}┌────────────────────────────────────────────────────────┐{end}")
        print(f"{bold}{cyan}│             OPENAI KEY USED: COMPUTATION LOG           │{end}")
        print(f"{bold}{cyan}├────────────────────────────────────────────────────────┤{end}")
        print(f"│  {bold}Timestamp{end}: {request_data['timestamp'][:19].replace('T', ' '):<43}│")
        print(f"│  {bold}Model{end}:     {model:<43}│")
        if source_file:
            print(f"│  {bold}File{end}:      {source_file[:43]:<43}│")
        if quotation_id:
            print(f"│  {bold}Quote ID{end}:  {quotation_id:<43}│")
        print(f"{cyan}├────────────────────────────────────────────────────────┤{end}")
        print(f"│  {bold}Input Tokens{end}:  {input_tokens:<12,}                               │")
        print(f"│  {bold}Output Tokens{end}: {output_tokens:<12,}                               │")
        print(f"│  {bold}Total Tokens{end}:  {yellow}{request_data['total_tokens']:<12,}{end}                               │")
        print(f"{cyan}├────────────────────────────────────────────────────────┤{end}")
        print(f"│  {bold}Usage Cost{end}:    {green}${cost:<11.6f}{end}USD                             │")
        print(f"{bold}{cyan}└────────────────────────────────────────────────────────┘{end}\n")
        
        return request_data
    
    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost for a single request."""
        if model not in PRICING:
            logger.warning(f"Model {model} pricing not defined")
            return 0.0
        
        pricing = PRICING[model]
        input_cost = (input_tokens / 1000) * pricing["input_per_1k_tokens"]
        output_cost = (output_tokens / 1000) * pricing["output_per_1k_tokens"]
        
        return round(input_cost + output_cost, 6)
    
    def get_daily_usage(self, date: Optional[str] = None) -> Dict[str, Any]:
        """Get usage stats for a specific day (YYYY-MM-DD format, defaults to today)."""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        daily_requests = [r for r in self.usage_data["requests"] 
                         if r["timestamp"].startswith(date)]
        
        if not daily_requests:
            return {"date": date, "requests": 0, "tokens": 0, "cost_usd": 0.0}
        
        total_requests = len(daily_requests)
        total_tokens = sum(r["total_tokens"] for r in daily_requests)
        total_cost = sum(r["cost_usd"] for r in daily_requests)
        
        return {
            "date": date,
            "requests": total_requests,
            "input_tokens": sum(r["input_tokens"] for r in daily_requests),
            "output_tokens": sum(r["output_tokens"] for r in daily_requests),
            "total_tokens": total_tokens,
            "cost_usd": round(total_cost, 4),
            "requests_detail": daily_requests
        }
    
    def get_monthly_usage(self, month: Optional[str] = None) -> Dict[str, Any]:
        """Get usage stats for a specific month (YYYY-MM format, defaults to current month)."""
        if month is None:
            month = datetime.now().strftime("%Y-%m")
        
        monthly_requests = [r for r in self.usage_data["requests"] 
                           if r["timestamp"].startswith(month)]
        
        if not monthly_requests:
            return {"month": month, "requests": 0, "tokens": 0, "cost_usd": 0.0}
        
        total_requests = len(monthly_requests)
        total_tokens = sum(r["total_tokens"] for r in monthly_requests)
        total_cost = sum(r["cost_usd"] for r in monthly_requests)
        
        # Group by model
        by_model = {}
        for r in monthly_requests:
            model = r["model"]
            if model not in by_model:
                by_model[model] = {
                    "requests": 0,
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "cost_usd": 0.0
                }
            by_model[model]["requests"] += 1
            by_model[model]["input_tokens"] += r["input_tokens"]
            by_model[model]["output_tokens"] += r["output_tokens"]
            by_model[model]["cost_usd"] += r["cost_usd"]
        
        return {
            "month": month,
            "total_requests": total_requests,
            "total_input_tokens": sum(r["input_tokens"] for r in monthly_requests),
            "total_output_tokens": sum(r["output_tokens"] for r in monthly_requests),
            "total_tokens": total_tokens,
            "total_cost_usd": round(total_cost, 4),
            "by_model": {model: {k: round(v, 4) if isinstance(v, float) else v 
                                 for k, v in stats.items()}
                        for model, stats in by_model.items()}
        }
    
    def get_usage_summary(self) -> Dict[str, Any]:
        """Get overall usage summary across all time."""
        if not self.usage_data["requests"]:
            return {
                "total_requests": 0,
                "total_tokens": 0,
                "total_cost_usd": 0.0,
                "earliest_request": None,
                "latest_request": None
            }
        
        total_requests = len(self.usage_data["requests"])
        total_tokens = sum(r["total_tokens"] for r in self.usage_data["requests"])
        total_cost = sum(r["cost_usd"] for r in self.usage_data["requests"])
        
        return {
            "total_requests": total_requests,
            "total_input_tokens": sum(r["input_tokens"] for r in self.usage_data["requests"]),
            "total_output_tokens": sum(r["output_tokens"] for r in self.usage_data["requests"]),
            "total_tokens": total_tokens,
            "total_cost_usd": round(total_cost, 4),
            "average_cost_per_request": round(total_cost / total_requests, 6) if total_requests > 0 else 0,
            "average_tokens_per_request": round(total_tokens / total_requests, 0) if total_requests > 0 else 0,
            "earliest_request": self.usage_data["requests"][0]["timestamp"] if self.usage_data["requests"] else None,
            "latest_request": self.usage_data["requests"][-1]["timestamp"] if self.usage_data["requests"] else None
        }
    
    def check_budget_remaining(self, monthly_budget_usd: float, month: Optional[str] = None) -> Dict[str, Any]:
        """Check remaining budget for the month."""
        monthly_stats = self.get_monthly_usage(month)
        spent = monthly_stats["total_cost_usd"]
        remaining = max(0, monthly_budget_usd - spent)
        percentage_used = (spent / monthly_budget_usd * 100) if monthly_budget_usd > 0 else 0
        
        return {
            "month": monthly_stats["month"],
            "budget_usd": monthly_budget_usd,
            "spent_usd": spent,
            "remaining_usd": round(remaining, 4),
            "percentage_used": round(percentage_used, 2),
            "warning": percentage_used > 80,
            "warning_message": f"Budget usage at {percentage_used:.2f}% - {round(remaining, 4)} remaining" 
                              if percentage_used > 80 else None
        }


def integrate_with_openai_client(original_completion_func):
    """Wrapper to automatically track tokens from OpenAI API responses."""
    def wrapper(*args, **kwargs):
        response = original_completion_func(*args, **kwargs)
        
        # Extract model and tokens from response
        model = getattr(response, 'model', 'unknown')
        usage = getattr(response, 'usage', None)
        
        if usage:
            tracker = TokenTracker()
            tracker.log_request(
                model=model,
                input_tokens=usage.prompt_tokens,
                output_tokens=usage.completion_tokens
            )
        
        return response
    
    return wrapper


if __name__ == "__main__":
    # Example usage
    tracker = TokenTracker()
    
    # Simulate logging some requests
    tracker.log_request("gpt-4o-mini", 2500, 1200, "Q-001", "quotation_1.pdf")
    tracker.log_request("gpt-4o-mini", 3000, 1500, "Q-002", "quotation_2.pdf")
    
    print("\n=== Daily Usage ===")
    print(json.dumps(tracker.get_daily_usage(), indent=2))
    
    print("\n=== Overall Summary ===")
    print(json.dumps(tracker.get_usage_summary(), indent=2))
    
    print("\n=== Budget Check (Monthly budget: $50) ===")
    print(json.dumps(tracker.check_budget_remaining(50.0), indent=2))
