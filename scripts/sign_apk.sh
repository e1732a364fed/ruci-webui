set -e
apksigner sign --ks-key-alias alias1 --ks key1 --ks-pass pass:000000 src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk
mv src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk src-tauri/gen/android/app/build/outputs/apk/universal/release/ruci-gui-universal-release-signed.apk