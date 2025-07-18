from fastapi import FastAPI, WebSocket
from typing import Dict

active_ws_connections: Dict[str, WebSocket] = {}
