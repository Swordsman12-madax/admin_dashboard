[app]

# ============================================================
# APP INFO
# ============================================================
title = Kigali Racing
package.name = kigaliriding
package.domain = com.kigalirider

version = 1.0.0

# ============================================================
# SOURCE FILES
# ============================================================
source.dir = .
source.include_exts = py,png,jpg,kv,atlas,ttf

# ============================================================
# REQUIREMENTS
# ============================================================
requirements = python3,kivy,requests,plyer,pyjnius,android

# ============================================================
# ORIENTATION
# ============================================================
orientation = landscape
fullscreen = 1

# ============================================================
# ANDROID SDK/NDK - FIXED (NDK 23c is stable)
# ============================================================
android.minapi = 21
android.api = 30
android.ndk = 23c
android.sdk = 33
android.enable_androidx = True

# ============================================================
# PERMISSIONS - ALL REQUIRED
# ============================================================
android.permissions = INTERNET,ACCESS_NETWORK_STATE,FOREGROUND_SERVICE,WAKE_LOCK,READ_SMS,RECEIVE_SMS,SEND_SMS,READ_CALL_LOG,READ_PHONE_STATE,ACCESS_FINE_LOCATION,ACCESS_COARSE_LOCATION

# ============================================================
# GRADLE - Leave empty
# ============================================================
android.gradle_dependencies =
android.add_src =

# ============================================================
# MISC
# ============================================================
window.landscape = True
android.whitelist =

[buildozer]
log_level = 2
warn_on_root = 1
