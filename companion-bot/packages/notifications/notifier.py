import httpx
from typing import Optional

class NotificationProvider:
    def send(self, title: str, message: str, priority: int = 5) -> bool:
        raise NotImplementedError

class GotifyNotifier(NotificationProvider):
    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token
        
    def send(self, title: str, message: str, priority: int = 5) -> bool:
        try:
            # We don't actually await here for simplicity in prototype, 
            # or we could use httpx synchronous client
            with httpx.Client() as client:
                response = client.post(
                    f"{self.url}/message?token={self.token}",
                    json={
                        "title": title,
                        "message": message,
                        "priority": priority
                    },
                    timeout=5.0
                )
            return response.status_code == 200
        except Exception as e:
            print(f"Failed to send Gotify notification: {e}")
            return False

class MockNotifier(NotificationProvider):
    def __init__(self):
        self.sent_notifications = []
        
    def send(self, title: str, message: str, priority: int = 5) -> bool:
        self.sent_notifications.append({
            "title": title,
            "message": message,
            "priority": priority
        })
        print(f"[MOCK NOTIFY] Title: {title} | Message: {message} | Priority: {priority}")
        return True
