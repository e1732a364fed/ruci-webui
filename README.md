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

## 使用说明

从 github release 上下载的 mac的 dmg中的 app 打开可能报错说damaged, 此时要运行

    xattr -c ruci-gui.app


## 功能特点

- 使用 Vite 构建，支持快速的开发体验和热模块替换（HMR）
- 基于 TypeScript 提供完整的类型支持
- 使用 Material-UI 组件库实现现代化的用户界面
- 集成 ReactFlow 用于可视化流程图和节点编辑
- ESLint 配置确保代码质量


## 环境要求

- Bun (包管理器)

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


## 安装依赖

```bash
bun i
```


## 开发命令

```bash
# 启动 tauri app (debug+热更新)
bun run tauri dev

# 构建 tauri app (release)
bun run tauri build
```

### mac

构建的 macos 的 app 在

    src-tauri/target/release/bundle/macos

dmg 在

    src-tauri/target/release/bundle/dmg

有时编译 release 会报错 `failed to bundle project: error running bundle_dmg.sh`

https://github.com/tauri-apps/tauri/issues/3055

似乎只能重新尝试编译以解决 (不过 .app是已编译好了的)

### windows

windows 的 
可执行文件在

    src-tauri\target\release\ruci_gui.exe

msi 在

    src-tauri\target\release\bundle\msi

安装 exe 在

    src-tauri\target\release\bundle\nsis

### linux

linux 会生成多个bundle,在
 `src-tauri\target\release\bundle`下的
 appimage, deb, rpm 这三个文件夹中


### ios

```
brew install cocoapods
bun run tauri ios init
bunx tauri icon
bun run tauri ios dev
```

release:
打开 `src-tauri/gen/apple` 中的 xcode 项目, 配置team, 然后：

    bun run tauri ios build

会生成 ipa 文件

不过ios中目前大概率会有异步问题, 导致打开app后卡住。可能为 tauri 的bug

### 安卓


配置 ANDROID_HOME, NDK_HOME, JAVA_HOME 环境变量(桌面环境安装 android studio后), 然后：

```
bun run tauri android init
bunx tauri icon
```

debug:

    bun run tauri android dev 

该命令会自动打开安卓模拟器, ruci 的日志也会显示在控制台. 连上安卓设备后，运行后它会让您选择一个运行的设备（从真机/模拟器 中选择, 输入0就行)

release:

    bun run tauri android build

(默认会编译所有 cpu target 以生成 universal apk, 若未运行 android init, 此时还要按提示 rustup target add 其它 target , 一共有
aarch64-linux-android, armv7-linux-androideabi , i686-linux-android , x86_64-linux-android
)

只编译 arm64:

    bun run tauri android build --target aarch64


生成的 apk 在

    src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk

签名：

```sh
keytool -genkey -v -keystore key1 -alias alias1 -keyalg RSA -keysize 2048 -validity 10000

apksigner sign --ks-key-alias alias1 --ks key1 app-universal-release-unsigned.apk
```

the password for "key1" is six 0.

提供了 scripts/sign_apk.sh, 它签名后，自动将其改名为 ruci-gui-universal-release-signed.apk.


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

推送标签后, GitHub Actions 将自动：
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