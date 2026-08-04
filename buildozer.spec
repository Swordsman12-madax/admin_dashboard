[app]
title = Kigali Racing
package.name = kigaliriding
package.domain = com.kigalirider

source.dir = .
source.include_exts = py,png,jpg,kv,atlas
version = 0.1

requirements = python3,kivy

orientation = landscape
fullscreen = 0

android.minapi = 21
android.api = 31
android.ndk = 25b
android.sdk = 33

android.permissions = INTERNET

[buildozer]
log_level = 2
warn_on_root = 1
