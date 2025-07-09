import React from 'react';
import './HealthRecordList.css';
import { usePatientRecords } from './usePatientRecords';

const categories = ['All', 'General', 'Surgery', 'Immunization', 'Allergies'];

const HealthRecordList = () => {
  const { records, loading, error, fetchRecordData, deleteRecord, renameRecord } = usePatientRecords();
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [sortBy, setSortBy] = React.useState('name');
  const [blobUrls, setBlobUrls] = React.useState({});
  const [loadingBlobId, setLoadingBlobId] = React.useState(null);
  const [menuOpenId, setMenuOpenId] = React.useState(null);
  const [modal, setModal] = React.useState({ open: false, type: '', url: '', name: '' });

  // Automatically fetch image blobs on mount for images
  React.useEffect(() => {
    records.forEach(record => {
      if (record.type === 'image' && !blobUrls[record.id] && loadingBlobId !== record.id) {
        setLoadingBlobId(record.id);
        fetchRecordData(record.id, record.file_type).then(url => {
          setBlobUrls(prev => ({ ...prev, [record.id]: url }));
          setLoadingBlobId(null);
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);

  // Modal close on ESC
  React.useEffect(() => {
    if (!modal.open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setModal({ open: false, type: '', url: '', name: '' });
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modal.open]);

  const filtered = selectedCategory === 'All'
    ? records
    : records.filter(r => r.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    return 0;
  });

  // Fetch blob URL on demand
  const handlePreview = async (record) => {
    if (blobUrls[record.id]) return; // Already fetched
    setLoadingBlobId(record.id);
    const url = await fetchRecordData(record.id, record.file_type);
    setBlobUrls(prev => ({ ...prev, [record.id]: url }));
    setLoadingBlobId(null);
    // For menu: open preview in new tab or modal (TODO: implement modal if needed)
    if (url) window.open(url, '_blank');
  };

  // Download handler for any file type
  const handleDownload = async (record) => {
    let url = blobUrls[record.id];
    if (!url) {
      setLoadingBlobId(record.id);
      url = await fetchRecordData(record.id, record.file_type);
      setBlobUrls(prev => ({ ...prev, [record.id]: url }));
      setLoadingBlobId(null);
    }
    // Create a temporary link to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = record.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete handler
  const handleDelete = async (record) => {
    if (!window.confirm(`Are you sure you want to delete "${record.name}"? This cannot be undone.`)) {
      setMenuOpenId(null);
      return;
    }
    const success = await deleteRecord(record.id);
    if (!success) alert('Failed to delete record.');
    setMenuOpenId(null);
  };

  // Rename handler
  const handleRename = async (record) => {
    const newName = window.prompt('Enter a new name for this record:', record.name);
    if (!newName || newName.trim() === record.name) {
      setMenuOpenId(null);
      return;
    }
    const success = await renameRecord(record.id, newName.trim());
    if (!success) alert('Failed to rename record.');
    setMenuOpenId(null);
  };

  // Menu open/close handlers
  const handleMenuOpen = (id) => setMenuOpenId(id);
  const handleMenuClose = () => setMenuOpenId(null);

  // Close menu on outside click
  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.record-menu')) setMenuOpenId(null);
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpenId]);

  // Menu Preview handler
  const handleMenuPreview = async (record) => {
    if (record.type === 'image' || record.type === 'pdf') {
      let url = blobUrls[record.id];
      if (!url) {
        setLoadingBlobId(record.id);
        url = await fetchRecordData(record.id, record.file_type);
        setBlobUrls(prev => ({ ...prev, [record.id]: url }));
        setLoadingBlobId(null);
      }
      setModal({ open: true, type: record.type, url, name: record.name });
    }
    setMenuOpenId(null);
  };

  return (
    <div className="health-record-list">
      <div className="health-record-list-controls">
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={selectedCategory === cat ? 'active' : ''}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="sort-dropdown">
          <label>Sort by: </label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>
      {loading && <div className="no-records">Loading records...</div>}
      {error && <div className="upload-error">{error}</div>}
      <div className="health-record-list-items">
        {sorted.length === 0 && !loading ? (
          <div className="no-records">No health records found.</div>
        ) : (
          sorted.map(record => (
            <div className="health-record-card" key={record.id}>
              <div className="record-info" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="record-name">{record.name}</div>
                  <div className="record-category">{record.category}</div>
                </div>
                <div className="record-menu" style={{ position: 'relative' }}>
                  <button
                    className="record-menu-btn"
                    aria-label="More options"
                    onClick={() => handleMenuOpen(record.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', padding: '0 0.3rem' }}
                  >
                    &#8942;
                  </button>
                  {menuOpenId === record.id && (
                    <div className="record-menu-dropdown" style={{ position: 'absolute', right: 0, top: '2rem', background: '#fff', boxShadow: '0 2px 8px rgba(80,80,120,0.13)', borderRadius: 8, zIndex: 10, minWidth: 120 }}>
                      {(record.type === 'image' || record.type === 'pdf') && (
                        <button className="record-menu-item" onClick={() => handleMenuPreview(record)}>Preview</button>
                      )}
                      <button className="record-menu-item" onClick={() => { handleDownload(record); handleMenuClose(); }}>Download</button>
                      <button className="record-menu-item" onClick={() => handleRename(record)}>Rename</button>
                      <button className="record-menu-item" onClick={() => handleDelete(record)} style={{ color: '#dc2626' }}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="record-preview">
                {record.type === 'image' ? (
                  blobUrls[record.id] ? (
                    <img src={blobUrls[record.id]} alt={record.name} className="record-img-preview" />
                  ) : (
                    <div style={{ margin: '8px 0', color: '#a1a1aa' }}>
                      Loading image...
                    </div>
                  )
                ) : record.type === 'pdf' ? (
                  blobUrls[record.id] ? (
                    <iframe src={blobUrls[record.id]} title={record.name} className="record-pdf-preview" style={{ width: '100%', height: '180px', border: 'none', borderRadius: '8px', marginBottom: '8px' }} />
                  ) : null
                ) : null}
                {/* For PDFs, if not loaded, show Preview button */}
                {record.type === 'pdf' && !blobUrls[record.id] && (
                  <button onClick={() => handlePreview(record)} disabled={loadingBlobId === record.id}>
                    {loadingBlobId === record.id ? 'Loading...' : 'Preview PDF'}
                  </button>
                )}
                {/* For other types, show download link/button */}
                {record.type !== 'image' && record.type !== 'pdf' && (
                  blobUrls[record.id] ? (
                    <a href={blobUrls[record.id]} download={record.name} target="_blank" rel="noopener noreferrer">Download</a>
                  ) : (
                    <button onClick={() => handlePreview(record)} disabled={loadingBlobId === record.id}>
                      {loadingBlobId === record.id ? 'Loading...' : 'Download'}
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Modal for fullscreen preview */}
      {modal.open && (
        <div className="record-modal-overlay" onClick={() => setModal({ open: false, type: '', url: '', name: '' })}>
          <div className="record-modal-content" onClick={e => e.stopPropagation()}>
            <button className="record-modal-close" onClick={() => setModal({ open: false, type: '', url: '', name: '' })}>&times;</button>
            {modal.type === 'image' && (
              <img src={modal.url} alt={modal.name} style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12 }} />
            )}
            {modal.type === 'pdf' && (
              <iframe src={modal.url} title={modal.name} style={{ width: '90vw', height: '80vh', border: 'none', borderRadius: 12 }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecordList; 