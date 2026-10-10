import os
import sys

# Add the backend root to the path so `config` and `app` are importable
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv

load_dotenv()  # Load .env from the backend directory

from app import create_app

env = os.environ.get("FLASK_ENV", "development")
app = create_app(env)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=(env == "development"))
