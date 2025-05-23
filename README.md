# My World Atlas

インタラクティブな世界地図アプリケーション - 訪れた国や地域を記録・可視化

## 概要

"My World Atlas" は、ユーザーが訪れた国・都道府県・州などの主要な行政単位をインタラクティブな地図上で記録し、可視化できるシンプルで美しいWebアプリケーションです。GitHub Pages上で動作し、データはブラウザのローカルストレージに保存されます。

## 機能

- **インタラクティブな世界地図表示**
  - ズーム・パン操作
  - 国・地域の選択と訪問記録
  - 訪問済みの地域は色付きで表示
  - **タッチ・ホバー時のハイライト表示**

- **訪問記録の一覧表示**
  - 名前、行政レベル、日付でのソート
  - 検索フィルタリング
  - 記録の削除

- **データ管理**
  - CSV形式でのエクスポート
  - CSV形式でのインポート
  - ブラウザのIndexedDBに保存

## 技術スタック

- React
- Vite
- React Router
- Zustand (状態管理)
- MapLibre GL JS (地図表示)
- IndexedDB (データ永続化)
- PapaParse (CSV処理)

## 使い方

1. **地図画面**
   - 国や地域をクリックして選択
   - 「訪問済みにする」をクリックして記録
   - タッチやマウスホバーで国をハイライト表示
   - 右上の「エクスポート」「インポート」ボタンでデータの保存・復元

2. **一覧画面**
   - 訪問済みの地域を一覧表示
   - ヘッダーをクリックしてソート順を変更
   - 検索ボックスで名前によるフィルタリング
   - 行をクリックして地図へジャンプ（実装予定）

## 最近の改善点

### 位置情報取得の堅牢性向上 (2025年3月)

- **位置情報エラー処理の改善**
  - 位置情報の権限が拒否された場合のわかりやすいエラー表示
  - 位置情報取得失敗時のユーザーへの適切なフィードバック
  - デフォルト位置へのフォールバック処理の強化

- **ユーザーエクスペリエンスの向上**
  - 位置情報の設定方法を説明するモーダルの追加
  - 現在地ボタンのビジュアルフィードバック強化
  - 位置情報エラーの永続化（過剰な通知防止）

- **エラーハンドリング全般の改善**
  - より詳細なエラーログ
  - ユーザーフレンドリーなエラーメッセージ
  - 障害からの復旧方法の明示

## 開発方法

```bash
# リポジトリのクローン
git clone https://github.com/20m61/my-world-atlas-fixed.git
cd my-world-atlas-fixed

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# GitHub Pagesへのデプロイ
npm run deploy
```

## 将来の機能拡張予定

- 色のカスタマイズ
- メモ・写真・訪問回数などの付与
- 統計ダッシュボード
- クラウド同期
- より細かい地域対応（市区町村レベル）
- 複数プロフィール管理

## モバイル対応

- タッチデバイスでの操作性を向上
- タッチ時の国ハイライト機能
- タッチスクロールのなめらかさ改善
- 位置情報のモバイル向け対応強化

## ライセンス

MIT License