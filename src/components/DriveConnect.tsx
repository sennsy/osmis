"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, File, Folder, CheckCircle } from 'lucide-react';
import styles from '../app/backroom/Backroom.module.css';

export default function DriveConnect() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [searchFolder, setSearchFolder] = useState('root');

  useEffect(() => {
    // Check if we just connected
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setConnected(true);
      fetchFiles();
      // clean url
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Try fetching anyway to see if session exists
      fetchFiles(true);
    }
  }, []);

  const handleConnect = () => {
    setLoading(true);
    window.location.href = '/api/auth/login';
  };

  const fetchFiles = async (silent = false, targetFolderId?: string) => {
    if (!silent) setLoading(true);
    setError('');
    const idToFetch = targetFolderId || searchFolder;
    try {
      const res = await fetch(`/api/drive/files?folderId=${idToFetch}`);
      const data = await res.json();
      
      if (res.ok) {
        setFiles(data);
        setConnected(true);
        if (targetFolderId) setSearchFolder(targetFolderId);
      } else {
        if (!silent) setError(data.error || 'Failed to fetch files');
        if (res.status === 401) setConnected(false);
      }
    } catch (err) {
      if (!silent) setError('Network error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 className="mono-font" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} /> Google Drive API Integration
          </h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.25rem' }}>
            {connected 
              ? 'Status: Terhubung ke Google Drive API' 
              : 'Otentikasi OAuth 2.0 untuk mengakses File ID Drive.'}
          </p>
        </div>
        {!connected ? (
          <button 
            className={styles.saveBtn} 
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? 'Menghubungkan...' : 'Hubungkan Google Drive'}
          </button>
        ) : (
          <div style={{ color: 'var(--osmis-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="mono-font">
            <CheckCircle size={18} /> Connected
          </div>
        )}
      </div>

      {error && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}

      {connected && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              value={searchFolder}
              onChange={(e) => setSearchFolder(e.target.value)}
              className={styles.input}
              placeholder="Folder ID (biarkan 'root' untuk folder utama)"
            />
            <button className={styles.saveBtn} onClick={() => fetchFiles(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} /> Muat File
            </button>
          </div>

          <div style={{ background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>Loading files from Google Drive...</div>
            ) : files.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>Tidak ada file di folder ini.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                <thead style={{ background: 'rgba(0,0,0,0.05)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>ID</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => (
                    <tr key={file.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td 
                        style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: file.mimeType === 'application/vnd.google-apps.folder' ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (file.mimeType === 'application/vnd.google-apps.folder') {
                            fetchFiles(false, file.id);
                          }
                        }}
                      >
                        {file.mimeType === 'application/vnd.google-apps.folder' ? <Folder size={16} color="var(--osmis-green)"/> : <File size={16} style={{ opacity: 0.6 }}/>}
                        <span style={{ textDecoration: file.mimeType === 'application/vnd.google-apps.folder' ? 'underline' : 'none', color: file.mimeType === 'application/vnd.google-apps.folder' ? 'var(--osmis-green)' : 'inherit' }}>
                          {file.name}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }} className="mono-font">
                        <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{file.id}</code>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', opacity: 0.6, fontSize: '0.8rem' }}>
                        {file.mimeType.replace('application/vnd.google-apps.', '')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(file.id);
                            alert('ID Copied!');
                          }}
                          style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Copy ID
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
