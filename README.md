# Ruci WebUI Tauri

Ruci WebUI Tauri 是一个基于 React 和 TypeScript 的现代化 Web 用户界面项目。该项目使用了最新的前端技术栈，包括：

- React 18.3
- TypeScript
- Vite 6.0
- Material-UI (MUI) 6.3
- ReactFlow 11.11
- React Hook Form
- Tauri v2



![screenshot](screenshot.png)

## 功能特点

- 使用 Vite 构建，支持快速的开发体验和热模块替换（HMR）
- 基于 TypeScript 提供完整的类型支持
- 使用 Material-UI 组件库实现现代化的用户界面
- 集成 ReactFlow 用于可视化流程图和节点编辑
- ESLint 配置确保代码质量


## 环境要求

- Bun (包管理器)

## 安装依赖

```bash
bun i
```

ubuntu:

```
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

## 开发命令

```bash
# 启动 tauri app (debug+热更新)
bun run tauri dev

# 构建 tauri app (release)
bun run tauri build
```

构建的 macos 的 app 在
src-tauri/target/release/bundle/macos
dmg 在
src-tauri/target/release/bundle/dmg

windows 的 msi 在
src-tauri\target\release\bundle\msi
安装 exe 在
src-tauri\target\release\bundle\nsis

### 安卓

rustup target add aarch64-linux-android

配置 ANDROID_HOME, NDK_HOME, JAVA_HOME 环境变量(桌面环境安装 android studio后), 然后：

bun run tauri android init

bun run tauri android build
(默认会编译所有 cpu target 以生成 universal apk, 此时还要按提示安装其它 target , 如 
armv7-linux-androideabi , i686-linux-android , x86_64-linux-android
)

只编译 arm64:
bun run tauri android build --target aarch64


生成的 apk 在
src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk

签名：
keytool -genkey -v -keystore key1 -alias alias1 -keyalg RSA -keysize 2048 -validity 10000

apksigner sign --ks-key-alias alias1 --ks key1 app-universal-release-unsigned.apk

the password for "key1" is six 0.

提供了 scripts/sign_apk.sh, 它签名后，自动将其改名为 app-universal-release-signed.apk.


# github release 发布流程

项目配置了自动化的 GitHub Actions 工作流，可以在创建新标签时自动构建并发布到 GitHub Releases。

## 创建新版本

使用提供的脚本创建新版本：

```bash
# 创建新版本（例如 1.0.0）
./scripts/release.sh 1.0.0

# 推送更改和标签到 GitHub
git push && git push --tags
```

推送标签后，GitHub Actions 将自动：
1. 构建项目
2. 将 dist 目录打包为 tar.gz 文件
3. 创建 GitHub Release 并上传构建产物

# 代码

程序的入口点是 App.tsx

Map类型在 config/nodeTypes.ts 中的 NODE_TYPES 定义

将Map信息转换为 json 显示的功能是在 App.tsx 中的 getNodeChain 函数

all_ruci_config.rs 内含 ruci 配置的全部 rust 代码（已去除无用信息），用于为 nodeTypes.ts 作参考。



# License

This project is released under Unlicense License.
For more information, please refer to <http://unlicense.org/>