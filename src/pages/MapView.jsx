import { useRef, useState, useEffect } from 'react';
import useAtlasStore from '../store/useAtlasStore';
import useMapInteraction from '../hooks/useMapInteraction';
import MapControls from '../components/map/MapControls';
import ImportForm from '../components/map/ImportForm';
import LocationErrorModal from '../components/map/LocationErrorModal';
import Toast from '../components/Toast';
import './MapView.css';

/**
 * 地図表示画面のコンポーネント
 * ユーザーが訪れた国を視覚的に表示し、新しい訪問を記録できる
 */
function MapView() {
  const mapContainer = useRef(null);
  const [importOpen, setImportOpen] = useState(false);
  const [showLocationErrorModal, setShowLocationErrorModal] = useState(false);
  
  const { 
    toast,
    showToast,
    exportToCSV,
    importFromCSV
  } = useAtlasStore();
  
  // 地図操作のカスタムフック
  const { userLocation, flyToUserLocation, locationError } = useMapInteraction(mapContainer);
  
  // 位置情報のエラーを監視してモーダルを表示
  useEffect(() => {
    // 位置情報の権限エラー(PERMISSION_DENIED)の場合のみモーダルを表示
    if (locationError && locationError.code === 1) {
      // ローカルストレージで表示済みか確認
      const locationErrorShown = localStorage.getItem('locationErrorShown');
      if (!locationErrorShown) {
        setShowLocationErrorModal(true);
        // 1週間の間、再度表示しないようにフラグを設定
        const expiration = Date.now() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('locationErrorShown', expiration.toString());
      }
    }
  }, [locationError]);
  
  // インポートフォーム送信処理
  const handleImportSubmit = (file) => {
    if (!file) {
      showToast('ファイルを選択してください', 'warning');
      return;
    }
    
    importFromCSV(file);
    setImportOpen(false);
  };
  
  // 位置情報エラーモーダルを閉じる
  const handleCloseLocationErrorModal = () => {
    setShowLocationErrorModal(false);
  };
  
  return (
    <div className="map-view">
      <div ref={mapContainer} className="map-container" />
      
      {/* 地図コントロール */}
      <MapControls
        onExportClick={exportToCSV}
        onImportClick={() => setImportOpen(true)}
        userLocation={userLocation}
        onLocationClick={flyToUserLocation}
        locationError={locationError}
      />
      
      {/* インポートフォーム */}
      <ImportForm
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onSubmit={handleImportSubmit}
      />
      
      {/* 位置情報エラーモーダル */}
      <LocationErrorModal 
        isOpen={showLocationErrorModal}
        error={locationError}
        onClose={handleCloseLocationErrorModal}
      />
      
      {/* トースト通知 */}
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
      />
    </div>
  );
}

export default MapView;