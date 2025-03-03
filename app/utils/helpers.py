"""
Utility functions for CenAI application
"""
import re
import uuid
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import hashlib
import secrets


def generate_conversation_title(first_message: str, max_length: int = 50) -> str:
    """Generate a conversation title from the first message"""
    
    # Clean the message
    title = re.sub(r'\s+', ' ', first_message.strip())
    
    # Remove common prompt starters
    starters = [
        "please", "can you", "could you", "help me", "i need", "how do", "what is", "explain"
    ]
    
    for starter in starters:
        if title.lower().startswith(starter):
            title = title[len(starter):].strip()
    
    # Capitalize first letter
    if title:
        title = title[0].upper() + title[1:]
    
    # Truncate if too long
    if len(title) > max_length:
        title = title[:max_length-3] + "..."
    
    return title or "New Conversation"


def calculate_tokens_estimate(text: str) -> int:
    """Rough estimate of tokens in text (1 token ≈ 4 characters)"""
    return max(1, len(text) // 4)


def calculate_cost_estimate(input_tokens: int, output_tokens: int, model_config: Dict[str, Any]) -> float:
    """Calculate estimated cost for a request"""
    
    input_cost = (input_tokens / 1000) * model_config.get("cost_per_1k_input", 0)
    output_cost = (output_tokens / 1000) * model_config.get("cost_per_1k_output", 0)
    
    return round(input_cost + output_cost, 6)


def format_currency(amount: float, currency: str = "USD") -> str:
    """Format currency amount"""
    
    if currency == "USD":
        return f"${amount:.4f}"
    else:
        return f"{amount:.4f} {currency}"


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # Remove leading/trailing spaces and dots
    filename = filename.strip(' .')
    
    # Ensure it's not too long
    if len(filename) > 200:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:190] + ('.' + ext if ext else '')
    
    return filename or "untitled"


def generate_session_id() -> str:
    """Generate a unique session ID"""
    return str(uuid.uuid4())


def generate_short_id(length: int = 8) -> str:
    """Generate a short random ID"""
    return secrets.token_urlsafe(length)[:length]


def hash_string(text: str) -> str:
    """Generate SHA-256 hash of a string"""
    return hashlib.sha256(text.encode()).hexdigest()


def parse_model_name(full_model_name: str) -> Dict[str, str]:
    """Parse model name to extract provider and model"""
    
    # Common patterns
    if "/" in full_model_name:
        # Format: provider/model (e.g., "openai/gpt-4")
        provider, model = full_model_name.split("/", 1)
        return {"provider": provider, "model": model}
    
    # Known prefixes
    prefixes = {
        "gpt-": "openai",
        "claude-": "anthropic",
        "gemini-": "google",
        "command": "cohere",
        "llama": "meta"
    }
    
    for prefix, provider in prefixes.items():
        if full_model_name.lower().startswith(prefix):
            return {"provider": provider, "model": full_model_name}
    
    # Default
    return {"provider": "unknown", "model": full_model_name}


def format_time_ago(dt: datetime) -> str:
    """Format datetime as 'time ago' string"""
    
    now = datetime.utcnow()
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=None)
        now = now.replace(tzinfo=None)
    
    diff = now - dt
    
    if diff.days > 7:
        return dt.strftime("%Y-%m-%d")
    elif diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def clean_json_string(json_str: str) -> str:
    """Clean and validate JSON string"""
    try:
        # Parse and re-serialize to clean up
        parsed = json.loads(json_str)
        return json.dumps(parsed)
    except json.JSONDecodeError:
        return "{}"


def extract_code_blocks(text: str) -> List[Dict[str, str]]:
    """Extract code blocks from markdown text"""
    
    # Pattern for code blocks with language
    pattern = r'```(\w+)?\n(.*?)\n```'
    matches = re.findall(pattern, text, re.DOTALL)
    
    code_blocks = []
    for match in matches:
        language = match[0] or "text"
        code = match[1].strip()
        code_blocks.append({
            "language": language,
            "code": code
        })
    
    return code_blocks


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def merge_dicts(dict1: Dict[str, Any], dict2: Dict[str, Any]) -> Dict[str, Any]:
    """Merge two dictionaries recursively"""
    result = dict1.copy()
    
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_dicts(result[key], value)
        else:
            result[key] = value
    
    return result


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return filename.split('.')[-1].lower() if '.' in filename else ""


def is_valid_url(url: str) -> bool:
    """Check if string is a valid URL"""
    pattern = r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$'
    return re.match(pattern, url) is not None


def batch_list(items: List[Any], batch_size: int) -> List[List[Any]]:
    """Split list into batches of specified size"""
    return [items[i:i + batch_size] for i in range(0, len(items), batch_size)]


def safe_get(dictionary: Dict[str, Any], key: str, default: Any = None) -> Any:
    """Safely get value from dictionary with dot notation"""
    keys = key.split('.')
    value = dictionary
    
    for k in keys:
        if isinstance(value, dict) and k in value:
            value = value[k]
        else:
            return default
    
    return value