import os
import instructor
from openai import AsyncOpenAI

client = None

def get_instructor_client():
    """
    Initializes and returns the Instructor-wrapped OpenAI client.
    Ensures environment variables are fetched dynamically at request time.
    """
    global client
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is missing. Please configure it in your environment.")
    
    # Initialize a fresh client each time to avoid caching issues
    openai_client = AsyncOpenAI(api_key=api_key)
    client = instructor.from_openai(openai_client)
    return client
