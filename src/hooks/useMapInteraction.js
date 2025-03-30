import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import useAtlasStore from '../store/useAtlasStore';
import { getUserLocation } from '../utils/locationUtils';
import { logError } from '../utils/errorHandling';

/**
 * 地図操作と地図データのインタラクションを管理するカスタムフック
 * @param {Object} containerRef - 地図を表示するDOM要素のref
 * @returns {Object} - 地図関連の状態と関数
 */
const useMapInteraction = (containerRef) => {
  const map = useRef(null);
  const popup = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hoveredCountryId, setHoveredCountryId] = useState(null); // ホバー/タッチ中の国のID
  const [isMapReady, setIsMapReady] = useState(false); // 地図のロード状態を追跡
  const [locationError, setLocationError] = useState(null); // 位置情報取得エラー

  const { 
    visitedPlaces, 
    markPlaceAsVisited, 
    initializeStore,
    showToast
  } = useAtlasStore();

  // ポップアップからの訪問登録処理
  const handleVisitButtonClick = useCallback((placeInfo) => {
    console.log('訪問登録ボタンがクリックされました', placeInfo);
    markPlaceAsVisited(placeInfo);
    if (popup.current) {
      popup.current.remove();
    }
  }, [markPlaceAsVisited]);

  // 初期化
  useEffect(() => {
    console.log('ストアを初期化します');
    initializeStore();
    
    // 現在地の取得（改善版）
    getUserLocation(
      // 成功時のコールバック
      (coordinates) => {
        setUserLocation(coordinates);
        setLocationError(null);
      },
      // エラー時のコールバック
      (error, defaultCoords) => {
        console.warn('位置情報エラー:', error.message);
        setUserLocation(defaultCoords);
        setLocationError(error);
        
        // エラーがPERMISSION_DENIEDの場合のみ、ユーザーに通知
        if (error.code === 1) {
          showToast(
            '位置情報へのアクセスが許可されていないため、初期位置を使用します。地図の右側にある「現在地」ボタンは機能しません。',
            'warning'
          );
        }
      }
    );
  }, [initializeStore, showToast]);
  
  // ハイライト表示のハンドラー
  const handleCountryHighlight = useCallback((e) => {
    if (!map.current || !isMapReady) return;
    if (!e.features || e.features.length === 0) return;
    
    const feature = e.features[0];
    const countryId = feature.properties.ISO_A2;
    
    // 以前と同じ国なら何もしない
    if (hoveredCountryId === countryId) return;
    
    // 以前ハイライトされた国があれば、そのハイライトを削除
    if (hoveredCountryId) {
      try {
        map.current.setFeatureState(
          { source: 'countries', sourceLayer: '', id: hoveredCountryId },
          { hover: false }
        );
      } catch (err) {
        console.error('ハイライト除去エラー:', err);
      }
    }
    
    // 新しい国をハイライト
    try {
      map.current.setFeatureState(
        { source: 'countries', sourceLayer: '', id: countryId },
        { hover: true }
      );
      console.log(`国 ${countryId} をハイライトしました`);
    } catch (err) {
      console.error('ハイライト設定エラー:', err);
    }
    
    setHoveredCountryId(countryId);
  }, [hoveredCountryId, isMapReady]);
  
  // ハイライト解除のハンドラー
  const handleCountryUnhighlight = useCallback(() => {
    if (!map.current || !isMapReady || !hoveredCountryId) return;
    
    try {
      map.current.setFeatureState(
        { source: 'countries', sourceLayer: '', id: hoveredCountryId },
        { hover: false }
      );
      console.log(`国 ${hoveredCountryId} のハイライトを除去しました`);
    } catch (err) {
      console.error('ハイライト解除エラー:', err);
    }
    
    setHoveredCountryId(null);
  }, [hoveredCountryId, isMapReady]);
  
  // 地図クリック・タッチイベントハンドラー
  const handleCountryClick = useCallback((e) => {
    if (!map.current || !isMapReady) return;
    if (!e.features || e.features.length === 0) return;
    
    const feature = e.features[0];
    const properties = feature.properties;
    
    console.log('国がクリックされました:', properties.ADMIN);
    
    // 選択地域の情報
    const placeInfo = {
      uniqueId: properties.ISO_A2,
      placeName: properties.ADMIN,
      adminLevel: 'Country',
      countryCodeISO: properties.ISO_A2
    };
    
    setSelectedFeature(placeInfo);
    
    // 地域名をポップアップ表示 - カスタムHTMLを使用
    const popupHTML = `
      <div class="map-popup">
        <h3>${properties.ADMIN}</h3>
        <button class="mark-visited-btn" id="mark-visited-${properties.ISO_A2}">訪問済みにする</button>
      </div>
    `;
    
    popup.current
      .setLngLat(e.lngLat)
      .setHTML(popupHTML)
      .addTo(map.current);
    
    // ポップアップ表示後にボタンにイベントを追加 
    setTimeout(() => {
      const markBtn = document.getElementById(`mark-visited-${properties.ISO_A2}`);
      if (markBtn) {
        markBtn.addEventListener('click', () => {
          console.log('訪問済みボタンがクリックされました:', placeInfo);
          handleVisitButtonClick(placeInfo);
        });
      } else {
        console.error('訪問済みボタンが見つかりません');
      }
    }, 100);
  }, [handleVisitButtonClick, isMapReady]);
  
  // 地図初期化
  useEffect(() => {
    if (map.current || !containerRef.current) return;
    
    console.log('地図を初期化します');
    
    // 初期座標（ユーザーの位置情報がまだない場合は日本）
    const initialCenter = userLocation || [139, 35];
    
    try {
      map.current = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: initialCenter,
        zoom: 3,
        touchZoomRotate: true,
        dragPan: true,
        doubleClickZoom: true,
        touchPitch: true,
        failIfMajorPerformanceCaveat: false, // パフォーマンス問題があっても地図を表示
        attributionControl: true
      });
      
      // タッチ操作を有効化
      map.current.touchZoomRotate.enable();
      map.current.dragPan.enable();
      
      // ポップアップ作成
      popup.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: true,
        maxWidth: '300px'
      });
      
      // エラーハンドリング追加
      map.current.on('error', (e) => {
        logError(e.error, { component: 'MapView', action: 'mapLoad' });
        console.error('マップエラー:', e.error);
        
        // 重大なエラーのみユーザーに通知
        if (e.error && e.error.status >= 500) {
          showToast('地図の読み込み中に問題が発生しました。ページを再読み込みしてください。', 'error');
        }
      });
    } catch (error) {
      logError(error, { component: 'MapView', action: 'mapInitialization' });
      console.error('地図の初期化に失敗しました:', error);
      showToast('地図の初期化に失敗しました。ブラウザを更新してお試しください。', 'error');
      return;
    }
    
    // 地図読み込み完了
    map.current.on('load', () => {
      console.log('地図が読み込まれました');
      
      try {
        // 国境データの追加
        map.current.addSource('countries', {
          type: 'geojson',
          data: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
          generateId: true // 自動的にIDを生成し、フィーチャーステートを使用可能にする
        });
        
        // 訪問済みの国リストを生成
        const visitedCountryCodes = visitedPlaces
          .filter(place => place.countryCodeISO)
          .map(place => place.countryCodeISO);
          
        console.log('訪問済みの国リスト:', visitedCountryCodes);
        
        // 国の塗りつぶしレイヤー
        map.current.addLayer({
          id: 'countries-fill',
          type: 'fill',
          source: 'countries',
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#69b3dd', // ホバー時の色
              [
                'case',
                ['in', ['get', 'ISO_A2'], ['literal', visitedCountryCodes]],
                '#ADD8E6', // 訪問済み
                'rgba(0, 0, 0, 0)' // デフォルト（透明）
              ]
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.9, // ホバー時の不透明度
              0.7  // 通常時の不透明度
            ]
          }
        });
        
        // 国境線レイヤー
        map.current.addLayer({
          id: 'countries-outline',
          type: 'line',
          source: 'countries',
          paint: {
            'line-color': '#627BC1',
            'line-width': 1
          }
        });
        
        // マウスイベントハンドラーを追加
        map.current.on('mousemove', 'countries-fill', handleCountryHighlight);
        map.current.on('mouseleave', 'countries-fill', handleCountryUnhighlight);
        
        // タッチイベントハンドラーを追加
        map.current.on('touchstart', 'countries-fill', handleCountryHighlight);
        map.current.on('touchend', 'countries-fill', (e) => {
          // タッチ終了後にハイライトを暑く維持する
          setTimeout(handleCountryUnhighlight, 1000);
        });
        
        // クリック/タップイベントハンドラーを追加
        map.current.on('click', 'countries-fill', handleCountryClick);
        
        // カーソルスタイル変更
        map.current.on('mouseenter', 'countries-fill', () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });
        
        map.current.on('mouseleave', 'countries-fill', () => {
          map.current.getCanvas().style.cursor = '';
        });
        
        // 現在地に移動（データが読み込まれた後）
        if (userLocation) {
          map.current.flyTo({
            center: userLocation,
            zoom: 5,
            speed: 1.5,
            curve: 1.5
          });
          
          // 現在地のマーカー
          new maplibregl.Marker({
            color: '#e74c3c'
          })
            .setLngLat(userLocation)
            .addTo(map.current);
        }
        
        // 地図の準備完了をマーク
        setIsMapReady(true);
      } catch (error) {
        logError(error, { component: 'MapView', action: 'addLayers' });
        console.error('地図レイヤーの追加に失敗しました:', error);
        showToast('地図データの読み込みに失敗しました。ページを再読み込みしてください。', 'error');
      }
    });
    
    // クリーンアップ関数
    return () => {
      if (map.current) {
        // イベントリスナーをクリーンアップ
        if (map.current.getLayer('countries-fill')) {
          map.current.off('mousemove', 'countries-fill', handleCountryHighlight);
          map.current.off('mouseleave', 'countries-fill', handleCountryUnhighlight);
          map.current.off('touchstart', 'countries-fill', handleCountryHighlight);
          map.current.off('touchend', 'countries-fill');
          map.current.off('click', 'countries-fill', handleCountryClick);
        }
        map.current.remove();
        map.current = null;
        setIsMapReady(false);
      }
    };
    
  }, [containerRef, visitedPlaces, userLocation, handleVisitButtonClick, handleCountryHighlight, handleCountryUnhighlight, handleCountryClick, showToast]);
  
  // 訪問地域データの変更をマップスタイルに反映
  useEffect(() => {
    if (!map.current || !isMapReady || !map.current.getLayer('countries-fill')) return;
    
    try {
      // 訪問済みの国リストを生成
      const visitedCountryCodes = visitedPlaces
        .filter(place => place.countryCodeISO)
        .map(place => place.countryCodeISO);
        
      console.log('訪問済み国リストを更新しました:', visitedCountryCodes);
      
      // 塗りつぶしの色設定を更新
      map.current.setPaintProperty('countries-fill', 'fill-color', [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#69b3dd', // ホバー時の色
        [
          'case',
          ['in', ['get', 'ISO_A2'], ['literal', visitedCountryCodes]],
          '#ADD8E6', // 訪問済み
          'rgba(0, 0, 0, 0)' // デフォルト（透明）
        ]
      ]);
    } catch (error) {
      console.error('マップスタイル更新エラー:', error);
    }
    
  }, [visitedPlaces, isMapReady]);

  // 現在地に移動する関数（位置情報エラーをチェック）
  const flyToUserLocation = useCallback(() => {
    if (!map.current) return;
    
    // 位置情報エラーがある場合は再度取得を試みる
    if (locationError) {
      getUserLocation(
        (coordinates) => {
          setUserLocation(coordinates);
          setLocationError(null);
          
          // 取得成功したら移動
          map.current.flyTo({
            center: coordinates,
            zoom: 5,
            speed: 1.5
          });
          
          showToast('現在地を取得しました', 'success');
        },
        (error, defaultCoords) => {
          setLocationError(error);
          
          // エラーメッセージを表示
          if (error.code === 1) {
            showToast('位置情報へのアクセスが拒否されています。ブラウザの設定から位置情報の許可をお願いします。', 'warning');
          } else {
            showToast('現在地を取得できませんでした。デフォルト位置を使用します。', 'warning');
            
            // エラーでもデフォルト位置には移動
            map.current.flyTo({
              center: defaultCoords,
              zoom: 5,
              speed: 1.5
            });
          }
        }
      );
      return;
    }
    
    // 正常な場合は保存された位置情報を使用
    if (userLocation) {
      map.current.flyTo({
        center: userLocation,
        zoom: 5,
        speed: 1.5
      });
    }
  }, [userLocation, locationError, showToast]);

  return {
    map,
    selectedFeature,
    userLocation,
    flyToUserLocation,
    locationError
  };
};

export default useMapInteraction;