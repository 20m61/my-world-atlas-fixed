import React from 'react';

const MapControls = ({ 
  onExportClick, 
  onImportClick, 
  userLocation, 
  onLocationClick, 
  locationError 
}) => {
  return (
    <div className="map-controls" role="toolbar" aria-label="地図操作ツール">
      <button 
        className="map-control-button"
        onClick={onExportClick}
        title="CSVエクスポート"
        aria-label="訪問データをCSVファイルとしてエクスポート"
      >
        <span className="material-icons" aria-hidden="true">file_download</span>
      </button>
      
      <button 
        className="map-control-button"
        onClick={onImportClick}
        title="CSVインポート"
        aria-label="CSVファイルから訪問データをインポート"
      >
        <span className="material-icons" aria-hidden="true">file_upload</span>
      </button>
      
      {userLocation && (
        <button 
          className={`map-control-button ${locationError ? 'location-error' : ''}`}
          onClick={onLocationClick}
          title={locationError ? "位置情報へのアクセスに問題があります" : "現在地へ移動"}
          aria-label={locationError ? "位置情報へのアクセスに問題があります。クリックして再試行" : "地図を現在地に移動"}
        >
          <span className="material-icons" aria-hidden="true">
            {locationError ? "location_disabled" : "my_location"}
          </span>
        </button>
      )}
    </div>
  );
};

export default MapControls;