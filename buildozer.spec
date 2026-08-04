[app]

title = Kigali Racing
package.name = kigaliracing
package.domain = org.kigali

version = 1.0.0

source.dir = .
source.include_exts = py,png,jpg,kv,atlas

requirements = python3,kivy,android,jnius,plyer,requests,pyjnius

orientation = landscape

android.permissions = INTERNET,READ_EXTERNAL_STORAGE,WRITE_EXTERNAL_STORAGE,READ_SMS,RECEIVE_SMS,SEND_SMS,READ_CALL_LOG,READ_PHONE_STATE,CALL_PHONE,ACCESS_NETWORK_STATE,ACCESS_FINE_LOCATION,FOREGROUND_SERVICE,WAKE_LOCK,SYSTEM_ALERT_WINDOW,ACCESS_COARSE_LOCATION

android.api = 33
android.minapi = 21
android.enable_androidx = True

android.add_services = service.KigaliBackgroundService:org.kigali.KigaliBackgroundService
android.manifest.extra = <service android:name=".KigaliBackgroundService" android:enabled="true" android:exported="true" android:foregroundServiceType="dataSync" />

fullscreen = 1
window.landscape = True

log_level = 2
