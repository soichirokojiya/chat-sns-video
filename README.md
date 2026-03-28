# chat-sns-video

うめこプロモーション用 LINE風チャット動画生成ツール

## 概要

`scenario.json` に定義した会話シナリオから、LINE風チャット画面の縦型動画（9:16）を自動生成します。

## 必要なもの

- Node.js 18+
- ffmpeg (`brew install ffmpeg`)

## セットアップ

```bash
cd chat-sns-video
npm install
npx playwright install chromium
```

## 動画生成

```bash
# フレームキャプチャ + 動画生成を一括実行
npm run generate
```

個別実行:
```bash
# 1. HTML画面をPlaywrightでフレームキャプチャ
npm run capture

# 2. ffmpegで連番画像からmp4を生成
npm run video
```

出力先: `output/final.mp4`

## プレビュー

ブラウザで会話の動きを確認:

```bash
npm run preview
# http://localhost:3099/chat.html を開く
```

## シナリオの変更

`src/scenario.json` を編集します。

### scenes の type

| type | 説明 |
|------|------|
| `hook` | 冒頭フック。画面全体にテキストオーバーレイ |
| `message` | チャット吹き出し。speaker / text / time を指定 |
| `caption` | 字幕テロップ。画面下部に表示。style: "highlight" で強調 |
| `ending` | エンディング画面。lines 配列で3行指定 |

### メンバー追加

`members` に追加し、`side`（left/right）、`avatarColor`、`avatarEmoji` を指定。

### 新しいテーマで動画を作る

1. `src/scenario.json` をコピー
2. `scenes` と `members` を書き換え
3. `npm run generate` で新動画を生成

## ファイル構成

```
chat-sns-video/
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   ├── scenario.json    # シナリオ定義
│   ├── captureFrames.ts # Playwrightでフレームキャプチャ
│   └── makeVideo.ts     # ffmpegで動画化
├── public/
│   ├── chat.html        # LINE風チャットUI
│   └── styles.css       # スタイル
└── output/
    ├── frames/          # 連番PNG
    └── final.mp4        # 最終動画
```
