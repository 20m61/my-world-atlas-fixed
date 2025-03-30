/**
 * 位置情報に関するユーティリティ関数
 */

import { logError } from './errorHandling';

/**
 * ユーザーの現在地を取得する（エラーハンドリング強化版）
 * @param {Function} onSuccess - 成功時のコールバック関数 (coordinates) => {}
 * @param {Function} onError - エラー時のコールバック関数 (error, defaultCoords) => {}
 * @param {Array} defaultCoords - デフォルトの座標 [longitude, latitude]
 */
export const getUserLocation = (
  onSuccess, 
  onError = null, 
  defaultCoords = [139.7528, 35.6852] // 東京都千代田区
) => {
  // ブラウザが位置情報APIをサポートしているか確認
  if (!('geolocation' in navigator)) {
    console.log('お使いのブラウザは位置情報をサポートしていません。デフォルト位置を使用します。');
    
    if (onError) {
      onError(new Error('Geolocation not supported'), defaultCoords);
    }
    
    return;
  }
  
  // 成功時の処理
  const handleSuccess = (position) => {
    const { longitude, latitude, accuracy } = position.coords;
    console.log('現在地を取得しました', { longitude, latitude, accuracy: `${accuracy}m` });
    
    // 精度が著しく低い場合は警告
    if (accuracy > 5000) { // 5km以上の誤差
      console.warn('位置情報の精度が低いです:', accuracy);
    }
    
    onSuccess([longitude, latitude]);
  };
  
  // エラー時の処理
  const handleError = (error) => {
    logError(error, { action: 'getUserLocation' });
    
    // エラーコードに応じたメッセージを表示
    let errorMessage = '位置情報の取得に失敗しました。';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = '位置情報へのアクセスが拒否されました。設定からアクセスを許可するか、デフォルト位置を使用します。';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = '現在地を特定できませんでした。デフォルト位置を使用します。';
        break;
      case error.TIMEOUT:
        errorMessage = '位置情報の取得がタイムアウトしました。デフォルト位置を使用します。';
        break;
      default:
        errorMessage = '未知のエラーが発生しました。デフォルト位置を使用します。';
    }
    
    console.log(errorMessage);
    
    if (onError) {
      onError(error, defaultCoords);
    }
  };
  
  // 位置情報取得オプション
  const options = {
    enableHighAccuracy: false, // 高精度モードはオフにして、電力消費を抑える
    timeout: 10000,            // 10秒でタイムアウト
    maximumAge: 300000         // 5分間キャッシュを有効にする
  };
  
  try {
    console.log('位置情報を取得しています...');
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  } catch (e) {
    console.error('位置情報の取得中に予期せぬエラーが発生しました:', e);
    if (onError) {
      onError(e, defaultCoords);
    }
  }
};

/**
 * 2点間の距離を計算（ハーバーサイン公式）
 * @param {Array} coords1 - 始点の座標 [longitude, latitude]
 * @param {Array} coords2 - 終点の座標 [longitude, latitude]
 * @returns {Number} - 距離（km）
 */
export const calculateDistance = (coords1, coords2) => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  const R = 6371; // 地球の半径（km）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};
