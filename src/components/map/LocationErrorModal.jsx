import React from 'react';
import './LocationErrorModal.css';

/**
 * 位置情報の問題を示すモーダルコンポーネント
 * 
 * @param {boolean} isOpen - モーダルの表示状態
 * @param {Error} error - 位置情報エラーオブジェクト
 * @param {Function} onClose - モーダルを閉じる関数
 */
const LocationErrorModal = ({ isOpen, error, onClose }) => {
  if (!isOpen) return null;
  
  // 位置情報のエラーコードに応じたメッセージとヘルプ情報を取得
  const getErrorInfo = () => {
    if (!error) return { title: 'エラーが発生しました', message: '位置情報の取得中に問題が発生しました。' };
    
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        return {
          title: '位置情報へのアクセスが拒否されました',
          message: 'ブラウザの設定で位置情報へのアクセスが拒否されています。現在地機能を利用するには、ブラウザの設定から位置情報の許可が必要です。',
          help: [
            'Chromeの場合: アドレスバーの左側にある🔒アイコンをクリック → 「サイトの設定」 → 「位置情報」で「許可」を選択',
            'Safariの場合: 「Safari」メニュー → 「このWebサイトの設定」 → 「位置情報」で「許可」を選択',
            'iOSの場合: 「設定」アプリ → 「プライバシー」→ 「位置情報サービス」で該当ブラウザの権限を確認'
          ]
        };
      case 2: // POSITION_UNAVAILABLE
        return {
          title: '位置情報を取得できません',
          message: 'お使いのデバイスで位置情報を取得できませんでした。GPS信号が弱い場所にいるか、位置情報サービスに問題が発生している可能性があります。',
          help: [
            'Wi-Fiをオンにすると位置情報の精度が向上することがあります',
            '屋外や窓の近くなど、GPS信号が届きやすい場所に移動してみてください',
            'デバイスの位置情報サービスがオンになっていることを確認してください'
          ]
        };
      case 3: // TIMEOUT
        return {
          title: '位置情報の取得がタイムアウトしました',
          message: '位置情報の取得に時間がかかりすぎています。ネットワーク接続を確認するか、後ほど再試行してください。',
          help: [
            'インターネット接続を確認してください',
            '電波状況の良い場所に移動してみてください',
            'ページを再読み込みして再試行してください'
          ]
        };
      default:
        return {
          title: '未知のエラーが発生しました',
          message: `位置情報の取得中に問題が発生しました: ${error.message || '不明なエラー'}`,
          help: [
            'ブラウザを最新バージョンに更新してみてください',
            'ページを再読み込みして再試行してください',
            '別のブラウザでお試しください'
          ]
        };
    }
  };
  
  const { title, message, help } = getErrorInfo();
  
  return (
    <div className="location-error-overlay" role="dialog" aria-modal="true" aria-labelledby="location-error-title">
      <div className="location-error-modal">
        <div className="location-error-header">
          <h3 id="location-error-title">{title}</h3>
          <button className="close-button" onClick={onClose} aria-label="閉じる">×</button>
        </div>
        
        <div className="location-error-body">
          <p className="error-message">{message}</p>
          
          {help && (
            <>
              <h4>対処方法:</h4>
              <ul className="help-list">
                {help.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}
          
          <p className="note">
            注: 位置情報を取得できなくても、アプリケーションの主要な機能は使用できます。
            現在地を使用しない場合は、この通知を閉じて続行できます。
          </p>
        </div>
        
        <div className="location-error-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            閉じる
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              window.location.reload();
              onClose();
            }}
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationErrorModal;