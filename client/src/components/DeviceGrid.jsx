import DeviceCard from './DeviceCard';

export default function DeviceGrid({ devices, onDelete, onClearAll }) {
  if (!devices.length) return null;

  const handleClearAll = () => {
    if (window.confirm('Remove all devices? This cannot be undone.')) onClearAll();
  };

  return (
    <div className="device-grid-section">
      <div className="devices-list-header">
        <h3>
          <i className="fa-solid fa-list" /> Your Devices
          <span className="device-count">{devices.length}</span>
        </h3>
        <button className="btn-danger-sm" onClick={handleClearAll}>
          <i className="fa-solid fa-trash" /> Clear All
        </button>
      </div>
      <div className="devices-grid">
        {devices.map(d => (
          <DeviceCard key={d.id} device={d} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
