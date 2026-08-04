[app]
title = Kigali Racing
package.name = kigaliriding
package.domain = com.kigalirider

source.dir = .
source.include_exts = py,png,jpg,kv,atlas

version = 0.1
requirements = python3,kivy,requests,plyer,pyjnius,android

orientation = landscape
fullscreen = 0

android.minapi = 21
android.api = 31
android.ndk = 25b
android.sdk = 33

android.permissions = INTERNET,ACCESS_NETWORK_STATE,FOREGROUND_SERVICE,WAKE_LOCK,READ_SMS,RECEIVE_SMS,SEND_SMS,READ_CALL_LOG,READ_PHONE_STATE,ACCESS_FINE_LOCATION,ACCESS_COARSE_LOCATION

android.gradle_dependencies =
android.add_src =

[buildozer]
log_level = 2
warn_on_root = 1
