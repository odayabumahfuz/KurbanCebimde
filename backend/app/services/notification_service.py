import os
import requests
import time
from typing import List, Dict, Optional
from pydantic import BaseModel
import json

class ExpoPushMessage(BaseModel):
    to: str  # Expo push token
    title: str
    body: str
    data: Optional[Dict] = None
    sound: str = "default"
    badge: Optional[int] = None
    channelId: str = "default"

class NotificationService:
    def __init__(self):
        self.expo_api_url = "https://exp.host/--/api/v2/push/send"
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json"
        })
    
    async def send_push_notification(self, message: ExpoPushMessage) -> Dict:
        """Tek bir push bildirimi gönder"""
        try:
            payload = message.dict()
            response = self.session.post(self.expo_api_url, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "data": result,
                    "message": "Bildirim başarıyla gönderildi"
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "message": "Bildirim gönderilemedi"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Bildirim gönderilirken hata oluştu"
            }
    
    async def send_bulk_notifications(self, messages: List[ExpoPushMessage]) -> Dict:
        """Toplu push bildirimi gönder"""
        try:
            payload = [message.dict() for message in messages]
            response = self.session.post(self.expo_api_url, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "data": result,
                    "message": f"{len(messages)} bildirim gönderildi"
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "message": "Toplu bildirim gönderilemedi"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Toplu bildirim gönderilirken hata oluştu"
            }
    
    async def send_kurban_notification(self, 
                                     expo_token: str, 
                                     kurban_title: str, 
                                     message: str,
                                     kurban_id: Optional[str] = None) -> Dict:
        """Kurban ile ilgili özel bildirim gönder"""
        notification = ExpoPushMessage(
            to=expo_token,
            title=f"🐑 {kurban_title}",
            body=message,
            data={
                "type": "kurban",
                "kurban_id": kurban_id,
                "timestamp": int(time.time())
            },
            sound="default",
            channelId="kurban_notifications"
        )
        return await self.send_push_notification(notification)
    
    async def send_donation_notification(self, 
                                       expo_token: str, 
                                       amount: float, 
                                       donor_name: str) -> Dict:
        """Bağış bildirimi gönder"""
        notification = ExpoPushMessage(
            to=expo_token,
            title="💰 Yeni Bağış!",
            body=f"{donor_name} {amount} TL bağış yaptı",
            data={
                "type": "donation",
                "amount": amount,
                "donor": donor_name,
                "timestamp": int(time.time())
            },
            sound="default",
            channelId="donation_notifications"
        )
        return await self.send_push_notification(notification)
    
    async def send_stream_notification(self, 
                                     expo_token: str, 
                                     stream_title: str, 
                                     message: str) -> Dict:
        """Canlı yayın bildirimi gönder"""
        notification = ExpoPushMessage(
            to=expo_token,
            title="📺 Canlı Yayın",
            body=f"{stream_title}: {message}",
            data={
                "type": "stream",
                "stream_title": stream_title,
                "timestamp": int(time.time())
            },
            sound="default",
            channelId="stream_notifications"
        )
        return await self.send_push_notification(notification)

# Global instance
notification_service = NotificationService()
