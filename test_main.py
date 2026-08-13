import sys
import traceback
try:
    from app.main import app
    print("Successfully imported app.main!")
except Exception as e:
    traceback.print_exc()
