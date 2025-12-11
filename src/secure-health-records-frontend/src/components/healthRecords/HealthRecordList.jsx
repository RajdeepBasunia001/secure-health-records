import React, { useState, useEffect } from 'react';
import { usePatientRecords } from './usePatientRecords';
import { MoreVertical, FileText, Image as ImageIcon, Download, Eye, Edit2, Trash2, X } from 'lucide-react';

const categories = ['All', 'General', 'Surgery', 'Immunization', 'Allergies'];

const HealthRecordList = ({ principal }) => {
  const { records, loading, error, fetchRecordData, deleteRecord, renameRecord } = usePatientRecords(principal);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [blobUrls, setBlobUrls] = useState({});
  const [loadingBlobId, setLoadingBlobId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [modal, setModal] = useState({ open: false, type: '', url: '', name: '' });

  // Automatically fetch image blobs on mount for images
  useEffect(() => {
    records.forEach(record => {
      if ((record.type === 'image' || record.file_type?.startsWith('image/')) && !blobUrls[record.id] && loadingBlobId !== record.id) {
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
  useEffect(() => {
    if (!modal.open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setModal({ open: false, type: '', url: '', name: '' });
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modal.open]);

  const filtered = selectedCategory === 'All'
    ? records
    : records.filter(r => r.category === selectedCategory || (r.category && Object.keys(r.category || {})[0] === selectedCategory));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'category') {
      const catA = typeof a.category === 'string' ? a.category : Object.keys(a.category || {})[0] || '';
      const catB = typeof b.category === 'string' ? b.category : Object.keys(b.category || {})[0] || '';
      return catA.localeCompare(catB);
    }
    return 0;
  });

  // Fetch blob URL on demand
  const handlePreview = async (record) => {
    if (blobUrls[record.id]) return; // Already fetched
    setLoadingBlobId(record.id);
    const url = await fetchRecordData(record.id, record.file_type);
    setBlobUrls(prev => ({ ...prev, [record.id]: url }));
    setLoadingBlobId(null);
    if (url) window.open(url, '_blank');
  };

  const handleDownload = async (record) => {
    let url = blobUrls[record.id];
    if (!url) {
      setLoadingBlobId(record.id);
      url = await fetchRecordData(record.id, record.file_type);
      setBlobUrls(prev => ({ ...prev, [record.id]: url }));
      setLoadingBlobId(null);
    }
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = record.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Are you sure you want to delete "${record.name}"?`)) {
      setMenuOpenId(null);
      return;
    }
    const success = await deleteRecord(record.id);
    if (!success) alert('Failed to delete record.');
    setMenuOpenId(null);
  };

  const handleRename = async (record) => {
    const newName = window.prompt('Enter a new name:', record.name);
    if (!newName || newName.trim() === record.name) {
      setMenuOpenId(null);
      return;
    }
    const success = await renameRecord(record.id, newName.trim());
    if (!success) alert('Failed to rename record.');
    setMenuOpenId(null);
  };

  const handleMenuPreview = async (record) => {
    let url = blobUrls[record.id];
    if (!url) {
      setLoadingBlobId(record.id);
      url = await fetchRecordData(record.id, record.file_type);
      setBlobUrls(prev => ({ ...prev, [record.id]: url }));
      setLoadingBlobId(null);
    }
    if (url) {
      const type = (record.file_type && record.file_type.includes('pdf')) ? 'pdf' : 'image';
      setModal({ open: true, type, url, name: record.name });
    }
    setMenuOpenId(null);
  };

  // Close menu on outside click
  React.useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.record-menu-container')) setMenuOpenId(null);
    };
    if (menuOpenId !== null) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-500">Sort by:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field py-1 px-3 text-sm !w-auto"
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center p-12 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-lg text-center">{error}</div>}

      {!loading && sorted.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No records found</h3>
          <p className="text-gray-500 mt-1">Try uploading a new document or changing filters.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map(record => {
          const isPdf = record.file_type?.includes('pdf') || record.type === 'pdf';
          return (
            <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-4 flex items-start justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                    {isPdf ? <FileText size={20} /> : <ImageIcon size={20} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 truncate pr-2">{record.name}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                      {typeof record.category === 'string' ? record.category : Object.keys(record.category || {})[0]}
                    </span>
                  </div>
                </div>

                <div className="relative record-menu-container">
                  <button
                    onClick={() => setMenuOpenId(record.id)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuOpenId === record.id && (
                    <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={() => handleMenuPreview(record)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Eye size={16} /> Preview
                      </button>
                      <button onClick={() => { handleDownload(record); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Download size={16} /> Download
                      </button>
                      <button onClick={() => handleRename(record)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Edit2 size={16} /> Rename
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={() => handleDelete(record)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Area */}
              <div className="h-40 bg-gray-50 border-t border-gray-100 flex items-center justify-center relative group-hover:bg-gray-100 transition-colors">
                {blobUrls[record.id] ? (
                  isPdf ? (
                    <div className="text-center p-4">
                      <FileText size={48} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400">PDF Preview Available</p>
                    </div>
                  ) : (
                    <img src={blobUrls[record.id]} alt={record.name} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="text-center">
                    {loadingBlobId === record.id ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400 mx-auto"></div>
                    ) : (
                      <button
                        onClick={() => handlePreview(record)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Load Preview
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal({ open: false, type: '', url: '', name: '' })}>
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-medium text-gray-900">{modal.name}</h3>
              <button
                onClick={() => setModal({ open: false, type: '', url: '', name: '' })}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 relative overflow-auto flex items-center justify-center p-4">
              {modal.type === 'image' && (
                <img src={modal.url} alt={modal.name} className="max-w-full max-h-full object-contain rounded shadow-lg" />
              )}
              {modal.type === 'pdf' && (
                <iframe src={modal.url} title={modal.name} className="w-full h-full rounded shadow-sm bg-white" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecordList;