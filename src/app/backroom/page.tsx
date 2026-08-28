"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useOsmisData } from '../../lib/storage';
import AnalyticsChart from './components/AnalyticsChart';
import DriveConnect from '../../components/DriveConnect';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X, Sparkles, Loader2 } from 'lucide-react';
import styles from './Backroom.module.css';

export default function Backroom() {
  const router = useRouter();
  const { data, isLoaded, updateData } = useOsmisData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [auth, setAuth] = useState(false);
  
  // Custom Modal & Toast States
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'prompt' | 'info';
    title: string;
    description?: string;
    warning?: string;
    info?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: (inputVal: string) => void | Promise<void>;
  }>({
    isOpen: false,
    type: 'confirm',
    title: '',
    onConfirm: () => {},
  });
  const [modalInputVal, setModalInputVal] = useState('');

  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openConfirm = ({
    title,
    description,
    warning,
    info,
    confirmText = 'Lanjutkan',
    cancelText = 'Batal',
    isDestructive = false,
    onConfirm,
  }: {
    title: string;
    description?: string;
    warning?: string;
    info?: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void | Promise<void>;
  }) => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title,
      description,
      warning,
      info,
      confirmText,
      cancelText,
      isDestructive,
      onConfirm: () => onConfirm(),
    });
  };

  const openPrompt = ({
    title,
    description,
    warning,
    info,
    placeholder = '',
    defaultValue = '',
    confirmText = 'Simpan',
    cancelText = 'Batal',
    onConfirm,
  }: {
    title: string;
    description?: string;
    warning?: string;
    info?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (val: string) => void | Promise<void>;
  }) => {
    setModalInputVal(defaultValue);
    setModalState({
      isOpen: true,
      type: 'prompt',
      title,
      description,
      warning,
      info,
      placeholder,
      defaultValue,
      confirmText,
      cancelText,
      onConfirm: (val) => onConfirm(val),
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    setModalInputVal('');
  };
  
  // Local state for editing
  const [editSosmed, setEditSosmed] = useState('');
  
  // Gallery Edit State
  const [selectedCatId, setSelectedCatId] = useState('');
  const [newPhotoId, setNewPhotoId] = useState('');
  
  // Bulk Folder State
  const [bulkFolderId, setBulkFolderId] = useState('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  // Create Category State
  const [newCatNameId, setNewCatNameId] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameAr, setNewCatNameAr] = useState('');

  // Structure Edit State
  const [selectedDivId, setSelectedDivId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberImage, setNewMemberImage] = useState('');
  const [newMemberType, setNewMemberType] = useState<'member' | 'head'>('member');
  
  // Editing existing member state
  const [editingTarget, setEditingTarget] = useState<{ type: 'member'|'head'|'leadership'|'leadership-member', id: string, idx: number } | null>(null);
  const [editingMember, setEditingMember] = useState<{ divId: string, idx: number } | null>(null); // Keep for backwards compat if needed somewhere else
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberImage, setEditMemberImage] = useState('');

  // Session verification
  useEffect(() => {
    if (sessionStorage.getItem('backroom_auth') === 'granted') {
      setAuth(true);
    } else {
      router.push('/');
    }
  }, [router]);

  if (!auth || !isLoaded) return <div className={styles.layout}><div style={{padding: '2rem'}}>Initializing system...</div></div>;

  const totalPhotos = data.gallery.reduce((acc, cat) => acc + cat.ids.length, 0);

  const handleSaveSosmed = () => {
    updateData({ socialMedia: { instagram: editSosmed || data.socialMedia.instagram, tiktok: data.socialMedia.tiktok || '' } });
    showToast('Social media berhasil diperbarui!', 'success');
  };

  const handleAddPhoto = () => {
    if (!selectedCatId || !newPhotoId.trim()) return;
    const newGallery = data.gallery.map(cat => {
      if (cat.id === selectedCatId) {
        return { ...cat, ids: [...cat.ids, newPhotoId.trim()] };
      }
      return cat;
    });
    updateData({ gallery: newGallery });
    setNewPhotoId('');
    showToast('Foto berhasil ditambahkan ke galeri!', 'success');
  };

  const handleRemoveCategory = (catId: string) => {
    const target = data.gallery.find(c => c.id === catId);
    openConfirm({
      title: 'Hapus Kategori Galeri',
      description: `Apakah Anda yakin ingin menghapus kategori "${target?.name || catId}"?`,
      warning: 'Seluruh foto di dalam kategori ini akan dihapus dari tampilan website.',
      confirmText: 'Hapus Kategori',
      isDestructive: true,
      onConfirm: () => {
        const newGallery = data.gallery.filter(cat => cat.id !== catId);
        updateData({ gallery: newGallery });
        showToast('Kategori berhasil dihapus.', 'info');
      }
    });
  };

  const handleRenameCategory = (catId: string, currentName: string) => {
    openPrompt({
      title: 'Ganti Nama Kategori',
      description: 'Masukkan nama baru untuk kategori galeri ini:',
      defaultValue: currentName,
      placeholder: 'Nama kategori baru...',
      confirmText: 'Simpan Nama',
      onConfirm: (newName) => {
        if (!newName || !newName.trim() || newName.trim() === currentName) return;
        const newGallery = data.gallery.map(cat => {
          if (cat.id === catId) {
            return { ...cat, name: newName.trim() };
          }
          return cat;
        });
        updateData({ gallery: newGallery });
        showToast('Nama kategori berhasil diubah!', 'success');
      }
    });
  };

  const handleBulkAddFolder = async () => {
    setBulkMessage(null);
    if (!selectedCatId) {
      setBulkMessage('ERROR: Pilih Kategori terlebih dahulu di dropdown atas!');
      showToast('Pilih kategori terlebih dahulu di dropdown atas!', 'warning');
      return;
    }
    if (!bulkFolderId.trim()) {
      setBulkMessage('ERROR: Masukkan Folder ID atau URL Folder!');
      showToast('Masukkan Folder ID atau URL Folder!', 'warning');
      return;
    }

    setIsBulkLoading(true);
    try {
      let finalFolderId = bulkFolderId.trim();
      if (finalFolderId.includes('folders/')) {
        finalFolderId = finalFolderId.split('folders/')[1].split('?')[0].split('/')[0];
      } else if (finalFolderId.includes('id=')) {
        finalFolderId = finalFolderId.split('id=')[1].split('&')[0];
      }

      setBulkMessage(`Memuat dari API Drive untuk ID: ${finalFolderId}...`);

      const res = await fetch(`/api/drive/files?folderId=${finalFolderId}`);
      const dataResponse = await res.json();
      if (res.ok) {
        if (!Array.isArray(dataResponse)) {
          setBulkMessage('ERROR: Respons dari server tidak valid (bukan array).');
          showToast('Respons dari server tidak valid.', 'error');
          return;
        }
        const imageFiles = dataResponse.filter((f: any) => f.mimeType && f.mimeType.startsWith('image/'));
        if (imageFiles.length === 0) {
          const sampleMimes = dataResponse.slice(0, 3).map((f: any) => f.mimeType || 'unknown').join(', ');
          setBulkMessage(`FAILED: Tidak ada gambar di folder ini! Total file: ${dataResponse.length}. Contoh tipe file: ${sampleMimes}. Folder ID: ${finalFolderId}. (Pastikan isi folder langsung foto, BUKAN sub-folder)`);
          showToast('Tidak ada file gambar di folder Drive ini!', 'warning');
          return;
        }
        const newIds = imageFiles.map((f: any) => f.id);
        const newGallery = data.gallery.map(cat => {
          if (cat.id === selectedCatId) {
            const existing = new Set(cat.ids);
            newIds.forEach((id: string) => existing.add(id));
            return { ...cat, ids: Array.from(existing) };
          }
          return cat;
        });
        updateData({ gallery: newGallery });
        setBulkFolderId('');
        setBulkMessage(`SUCCESS: Berhasil menambahkan ${newIds.length} foto ke kategori yang dipilih!`);
        showToast(`Berhasil menambahkan ${newIds.length} foto baru!`, 'success');
      } else {
        setBulkMessage(`ERROR: ${dataResponse.error || 'Gagal memuat folder dari API.'}`);
        showToast(dataResponse.error || 'Gagal memuat folder dari API.', 'error');
      }
    } catch (err: any) {
      setBulkMessage(`NETWORK ERROR: Terjadi kesalahan jaringan atau sistem: ${err.message}`);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCatNameId.trim()) {
      showToast('Nama kategori (ID) wajib diisi!', 'warning');
      return;
    }
    const slug = newCatNameId.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      id: slug,
      name: newCatNameId.trim(),
      customNameEn: newCatNameEn.trim() || newCatNameId.trim(),
      customNameAr: newCatNameAr.trim() || newCatNameId.trim(),
      ids: []
    };
    
    if (data.gallery.find(c => c.id === slug)) {
      showToast('Kategori dengan nama ini sudah ada!', 'error');
      return;
    }
    
    updateData({ gallery: [...data.gallery, newCat] });
    setNewCatNameId('');
    setNewCatNameEn('');
    setNewCatNameAr('');
    showToast('Kategori Baru Berhasil Dibuat!', 'success');
  };

  const handleAddMember = () => {
    if (!selectedDivId || !newMemberName.trim()) {
      showToast('Pilih divisi dan isi nama anggota!', 'warning');
      return;
    }
    const newOrg = { ...data.organization };
    newOrg.divisions = newOrg.divisions.map(div => {
      if (div.id === selectedDivId) {
        if (newMemberType === 'head') {
          return {
            ...div,
            heads: [...(div.heads || []), { name: newMemberName.trim(), nameAr: '', image: newMemberImage.trim() || 'https://via.placeholder.com/150' }]
          };
        } else {
          return {
            ...div,
            members: [...div.members, { name: newMemberName.trim(), nameAr: '', image: newMemberImage.trim() || 'https://via.placeholder.com/150' }]
          };
        }
      }
      return div;
    });
    updateData({ organization: newOrg });
    setNewMemberName('');
    setNewMemberImage('');
    showToast('Anggota/Ketua berhasil ditambahkan!', 'success');
  };

  const handleRemovePerson = (type: 'member'|'head'|'leadership-member', id: string, idx: number) => {
    openConfirm({
      title: 'Hapus Anggota / Pengurus',
      description: 'Apakah Anda yakin ingin menghapus nama ini dari kepengurusan?',
      isDestructive: true,
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        const newOrg = { ...data.organization };
        if (type === 'member' || type === 'head') {
          newOrg.divisions = newOrg.divisions.map(div => {
            if (div.id === id) {
              const arr = type === 'member' ? [...div.members] : [...(div.heads || [])];
              arr.splice(idx, 1);
              return type === 'member' ? { ...div, members: arr } : { ...div, heads: arr };
            }
            return div;
          });
        } else if (type === 'leadership-member') {
          const roleIdx = parseInt(id);
          const role = { ...newOrg.leadership[roleIdx] };
          const arr = [...(role.members || [])];
          arr.splice(idx, 1);
          role.members = arr;
          newOrg.leadership[roleIdx] = role;
        }
        updateData({ organization: newOrg });
        showToast('Pengurus berhasil dihapus.', 'info');
      }
    });
  };

  const handleChangeName = (type: 'member'|'head'|'leadership'|'leadership-member', id: string, idx: number, currentName: string) => {
    openPrompt({
      title: 'Ganti Nama Pengurus',
      description: 'Masukkan nama baru untuk pengurus ini:',
      defaultValue: currentName,
      placeholder: 'Nama lengkap...',
      confirmText: 'Simpan Nama',
      onConfirm: (newName) => {
        if (!newName || newName.trim() === '') return;
        const newOrg = { ...data.organization };
        if (type === 'member' || type === 'head') {
          newOrg.divisions = newOrg.divisions.map(div => {
            if (div.id === id) {
              const arr = type === 'member' ? [...div.members] : [...(div.heads || [])];
              arr[idx] = { ...arr[idx], name: newName.trim() };
              return type === 'member' ? { ...div, members: arr } : { ...div, heads: arr };
            }
            return div;
          });
        } else if (type === 'leadership') {
          const roleIdx = parseInt(id);
          newOrg.leadership[roleIdx] = {
            ...newOrg.leadership[roleIdx],
            name: newName.trim()
          } as any;
        } else if (type === 'leadership-member') {
          const roleIdx = parseInt(id);
          const role = { ...newOrg.leadership[roleIdx] };
          const arr = [...(role.members || [])];
          arr[idx] = { ...arr[idx], name: newName.trim() };
          role.members = arr;
          newOrg.leadership[roleIdx] = role;
        }
        updateData({ organization: newOrg });
        showToast('Nama pengurus berhasil diperbarui!', 'success');
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editingTarget) return;
    const { type, id, idx } = editingTarget;
    const newOrg = { ...data.organization };
    
    if (type === 'member' || type === 'head') {
      newOrg.divisions = newOrg.divisions.map(div => {
        if (div.id === id) {
          const arr = type === 'member' ? [...div.members] : [...(div.heads || [])];
          arr[idx] = { 
            ...arr[idx],
            name: editMemberName.trim(), 
            image: editMemberImage.trim() || 'https://via.placeholder.com/150' 
          };
          return type === 'member' ? { ...div, members: arr } : { ...div, heads: arr };
        }
        return div;
      });
    } else if (type === 'leadership') {
      const roleIdx = parseInt(id);
      newOrg.leadership[roleIdx] = {
        ...newOrg.leadership[roleIdx],
        name: editMemberName.trim(),
        image: editMemberImage.trim() || 'https://via.placeholder.com/150'
      } as any;
    } else if (type === 'leadership-member') {
      const roleIdx = parseInt(id);
      const role = { ...newOrg.leadership[roleIdx] };
      const arr = [...(role.members || [])];
      arr[idx] = {
        ...arr[idx],
        name: editMemberName.trim(),
        image: editMemberImage.trim() || 'https://via.placeholder.com/150'
      };
      role.members = arr;
      newOrg.leadership[roleIdx] = role;
    }
    
    updateData({ organization: newOrg });
    setEditingTarget(null);
  };

  const startEdit = (type: 'member'|'head'|'leadership'|'leadership-member', id: string, idx: number, currentName: string, currentImage: string) => {
    setEditingTarget({ type, id, idx });
    setEditMemberName(currentName || '');
    setEditMemberImage(currentImage || '');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>System Overview</h2>
            <p className={styles.cardDesc}>Data yang Anda ubah di sini akan langsung terlihat di website (disimpan di LocalStorage).</p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--osmis-yellow)', marginBottom: '0.5rem' }}>Migrasi Data (Vercel Prep)</h3>
                <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '1rem' }}>Gunakan fitur ini untuk memindahkan data LocalStorage ke komputer/browser lain (terutama setelah deploy ke Vercel).</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className={styles.btnPrimary} 
                    style={{ background: 'var(--osmis-green)', color: '#000' }}
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", "osmis-data.json");
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                  >
                    Export Data
                  </button>
                  <label className={styles.btnSecondary} style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center' }}>
                    Import Data
                    <input 
                      type="file" 
                      accept=".json" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const importedData = JSON.parse(event.target?.result as string);
                            if (importedData && importedData.gallery && importedData.organization) {
                              openConfirm({
                                title: 'Konfirmasi Import Data',
                                description: 'Apakah Anda yakin ingin menimpa seluruh data website dengan data dari file JSON ini?',
                                warning: 'Data lama di browser Anda akan digantikan sepenuhnya.',
                                confirmText: 'Ya, Timpa Data',
                                isDestructive: true,
                                onConfirm: () => {
                                  updateData(importedData);
                                  showToast('Data berhasil di-import!', 'success');
                                }
                              });
                            } else {
                              showToast('Format file JSON tidak sesuai dengan standar data OSMIS.', 'error');
                            }
                          } catch (err) {
                            showToast('Gagal membaca file JSON.', 'error');
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button 
                    className={styles.btnPrimary} 
                    style={{ background: '#eab308', color: '#000' }}
                    onClick={() => {
                      openConfirm({
                        title: 'Terapkan ke Publik (Auto-Deploy)',
                        description: 'Perubahan data akan disimpan ke GitHub dan diterapkan ke seluruh pengunjung website.',
                        info: 'Vercel akan otomatis memproses pembaruan ini dalam waktu ~1 menit.',
                        confirmText: 'Terapkan Sekarang',
                        onConfirm: async () => {
                          showToast('Sedang melakukan auto-deploy ke GitHub...', 'info');
                          try {
                            const res = await fetch('/api/deploy', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(data)
                            });
                            const result = await res.json();
                            if (res.ok) {
                              showToast('Deploy berhasil! Vercel sedang memproses website (~1 menit).', 'success');
                            } else {
                              showToast('Gagal deploy: ' + result.error, 'error');
                            }
                          } catch (e: any) {
                            showToast('Terjadi kesalahan: ' + e.message, 'error');
                          }
                        }
                      });
                    }}
                  >
                    Terapkan ke Publik (Auto-Deploy)
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Galeri Kategori</div>
                <div className={styles.statValue}>{data.gallery.length}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Total Foto</div>
                <div className={styles.statValue}>{totalPhotos}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Instagram URL</div>
                <div className={styles.statValue} style={{ fontSize: '1rem', marginTop: '0.5rem' }}>@{data.socialMedia.instagram}</div>
              </div>
            </div>
            <AnalyticsChart />
          </div>
        );

      case 'sosmed':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Pengaturan Sosial Media</h2>
            <p className={styles.cardDesc}>Ubah ID/Username yang terhubung ke website.</p>
            <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
              <label>Instagram Username (tanpa @)</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={editSosmed}
                  onChange={(e) => setEditSosmed(e.target.value)}
                  placeholder={data.socialMedia.instagram}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>TikTok Username (tanpa @)</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  className={styles.input} 
                  defaultValue={data.socialMedia.tiktok || ''}
                  onChange={(e) => {
                    // Update temporarily in UI, we'll save together
                    data.socialMedia.tiktok = e.target.value;
                  }}
                  placeholder="e.g. osmis_official"
                />
              </div>
            </div>
            <button className={styles.btnPrimary} style={{ marginTop: '1rem' }} onClick={handleSaveSosmed}>Simpan Semua</button>
          </div>
        );

      case 'galeri':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Manajemen Galeri</h2>
            <p className={styles.cardDesc}>Tambah Google Drive ID foto ke kategori tertentu.</p>
            
            <div className={styles.formGroup} style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Pilih Kategori</label>
                <select className={styles.input} style={{ marginTop: '0.5rem' }} value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {data.gallery.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label>Drive Image ID (Satu per satu)</label>
                <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={newPhotoId} onChange={e => setNewPhotoId(e.target.value)} placeholder="1A2B3C4D..." />
              </div>
              <button className={styles.btnPrimary} onClick={handleAddPhoto}>Tambah Foto</button>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ flex: '1 1 100%', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'var(--osmis-yellow)' }}>[ BARU ] Drive Folder ID (Bulk Import)</label>
                  <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={bulkFolderId} onChange={e => setBulkFolderId(e.target.value)} placeholder="Folder ID..." />
                </div>
                <button className={styles.btnPrimary} onClick={handleBulkAddFolder} disabled={isBulkLoading} style={{ background: 'var(--osmis-yellow)', color: '#000' }}>
                  {isBulkLoading ? 'Memuat...' : 'Tambah 1 Folder'}
                </button>
              </div>
              {bulkMessage && (
                <div style={{ width: '100%', padding: '0.8rem', background: bulkMessage.startsWith('SUCCESS') ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)', color: bulkMessage.startsWith('SUCCESS') ? '#aaffaa' : '#ffaaaa', borderRadius: '4px', borderLeft: `4px solid ${bulkMessage.startsWith('SUCCESS') ? '#00ff00' : '#ff0000'}`, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {bulkMessage}
                </div>
              )}
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Total Foto</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.gallery.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td>{cat.ids.length}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className={styles.btnPrimary} 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                          onClick={() => handleRenameCategory(cat.id, cat.name)}
                        >
                          Ganti Nama
                        </button>
                        <button 
                          className={styles.btnSecondary} 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: '#3f3f46', borderColor: '#52525b' }}
                          onClick={() => {
                            openPrompt({
                              title: `Ganti ID Folder: ${cat.name}`,
                              description: 'Masukkan ID Folder Google Drive atau tautan folder Drive:',
                              warning: 'Seluruh foto lama pada kategori ini akan digantikan otomatis dengan foto dari folder Drive baru.',
                              placeholder: 'Contoh: 1aB2cD3eF4gH... atau link folder Drive',
                              confirmText: 'Tarik & Ganti Foto',
                              onConfirm: async (newFolder) => {
                                if (!newFolder || !newFolder.trim()) return;

                                let finalFolderId = newFolder.trim();
                                if (finalFolderId.includes('folders/')) {
                                  finalFolderId = finalFolderId.split('folders/')[1].split('?')[0].split('/')[0];
                                } else if (finalFolderId.includes('id=')) {
                                  finalFolderId = finalFolderId.split('id=')[1].split('&')[0];
                                }

                                showToast('Sedang memuat foto dari Google Drive... Mohon tunggu.', 'info');
                                try {
                                  const res = await fetch(`/api/drive/files?folderId=${finalFolderId}`);
                                  const dataResponse = await res.json();
                                  if (res.ok) {
                                    if (!Array.isArray(dataResponse)) throw new Error('Format data tidak valid');
                                    const imageFiles = dataResponse.filter((f: any) => f.mimeType && f.mimeType.startsWith('image/'));
                                    if (imageFiles.length === 0) throw new Error('Tidak ada file gambar di folder ini.');
                                    
                                    const newIds = imageFiles.map((f: any) => f.id);
                                    updateData({ 
                                      gallery: data.gallery.map(c => c.id === cat.id ? { ...c, ids: newIds } : c) 
                                    });
                                    showToast(`Berhasil! ${newIds.length} foto baru telah menggantikan foto lama.`, 'success');
                                  } else {
                                    throw new Error(dataResponse.error || 'Gagal mengambil data dari Drive API');
                                  }
                                } catch (err: any) {
                                  showToast(`Error: ${err.message}`, 'error');
                                }
                              }
                            });
                          }}
                        >
                          Ganti ID Folder
                        </button>
                        <button 
                          className={styles.btnDanger} 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                          onClick={() => handleRemoveCategory(cat.id)}
                        >
                          Hapus Kategori
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed rgba(255,255,255,0.1)' }}>
              <h3 className={styles.cardTitle} style={{ fontSize: '1.2rem' }}>[ BARU ] Buat Kategori Baru</h3>
              <p className={styles.cardDesc}>Tambahkan kategori galeri secara dinamis beserta terjemahannya.</p>
              
              <div className={styles.formGroup} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label>Nama (ID) *</label>
                  <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={newCatNameId} onChange={e => setNewCatNameId(e.target.value)} placeholder="Contoh: Baksos 2025" />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Terjemahan (EN)</label>
                  <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={newCatNameEn} onChange={e => setNewCatNameEn(e.target.value)} placeholder="Contoh: Social Event" />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Terjemahan (AR)</label>
                  <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={newCatNameAr} onChange={e => setNewCatNameAr(e.target.value)} placeholder="Opsional..." dir="rtl" />
                </div>
                <button className={styles.btnPrimary} onClick={handleAddCategory} style={{ background: 'var(--osmis-green)', color: '#000' }}>Buat Kategori</button>
              </div>
            </div>
            
          </div>
        );

      case 'pengurus':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Struktur Organisasi</h2>
            <p className={styles.cardDesc}>Kelola anggota bagian inti dan setiap divisi. Anda bisa menambah, mengubah, atau menghapus anggota.</p>

            <div className={styles.formGroup} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Pilih Divisi (Untuk Tambah Baru)</label>
                <select className={styles.input} style={{ marginTop: '0.5rem' }} value={selectedDivId} onChange={e => setSelectedDivId(e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {data.organization.divisions.map(div => <option key={div.id} value={div.id}>{div.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 0.8 }}>
                <label>Posisi</label>
                <select className={styles.input} style={{ marginTop: '0.5rem' }} value={newMemberType} onChange={e => setNewMemberType(e.target.value as 'member' | 'head')}>
                  <option value="member">Anggota</option>
                  <option value="head">Kepala Divisi</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Nama Lengkap</label>
                <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="Nama Lengkap" />
              </div>
              <div style={{ flex: 1 }}>
                <label>Drive Image ID / URL</label>
                <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={newMemberImage} onChange={e => setNewMemberImage(e.target.value)} placeholder="opsional" />
              </div>
              <button className={styles.btnPrimary} onClick={handleAddMember}>Tambah</button>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--osmis-green)', marginBottom: '1rem' }}>BAGIAN INTI</h3>
              {data.organization.leadership.map((role, roleIdx) => (
                <div key={roleIdx} style={{ marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--osmis-yellow)' }}>{role.title}</h4>
                  <table className={styles.table}>
                    <tbody>
                      {role.name && (
                        <tr>
                          {editingTarget?.type === 'leadership' && editingTarget.id === roleIdx.toString() ? (
                            <td colSpan={2}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="text" className={styles.input} value={editMemberName} onChange={e => setEditMemberName(e.target.value)} placeholder="Nama Lengkap" style={{ flex: 1 }} />
                                <input type="text" className={styles.input} value={editMemberImage} onChange={e => setEditMemberImage(e.target.value)} placeholder="Image URL / Drive ID" style={{ flex: 1 }} />
                                <button className={styles.btnPrimary} onClick={handleSaveEdit}>Simpan</button>
                                <button className={styles.btnSecondary} onClick={() => setEditingTarget(null)} style={{ border: 'none', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Batal</button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td>{role.name}</td>
                              <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button className={styles.btnSecondary} onClick={() => handleChangeName('leadership', roleIdx.toString(), 0, role.name!)} style={{ border: '1px solid #52525b', background: 'transparent', color: '#fafafa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Ganti Nama</button>
                                <button className={styles.btnSecondary} onClick={() => startEdit('leadership', roleIdx.toString(), 0, role.name!, role.image || '')} style={{ border: '1px solid #52525b', background: 'transparent', color: '#fafafa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Edit Foto</button>
                              </td>
                            </>
                          )}
                        </tr>
                      )}
                      
                      {role.members?.map((m, idx) => (
                        <tr key={idx}>
                          {editingTarget?.type === 'leadership-member' && editingTarget.id === roleIdx.toString() && editingTarget.idx === idx ? (
                            <td colSpan={2}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="text" className={styles.input} value={editMemberName} onChange={e => setEditMemberName(e.target.value)} placeholder="Nama Lengkap" style={{ flex: 1 }} />
                                <input type="text" className={styles.input} value={editMemberImage} onChange={e => setEditMemberImage(e.target.value)} placeholder="Image URL / Drive ID" style={{ flex: 1 }} />
                                <button className={styles.btnPrimary} onClick={handleSaveEdit}>Simpan</button>
                                <button className={styles.btnSecondary} onClick={() => setEditingTarget(null)} style={{ border: 'none', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Batal</button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td>{m.name}</td>
                              <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button className={styles.btnSecondary} onClick={() => handleChangeName('leadership-member', roleIdx.toString(), idx, m.name)} style={{ border: '1px solid #52525b', background: 'transparent', color: '#fafafa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Ganti Nama</button>
                                <button className={styles.btnSecondary} onClick={() => startEdit('leadership-member', roleIdx.toString(), idx, m.name, m.image || '')} style={{ border: '1px solid #52525b', background: 'transparent', color: '#fafafa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Edit Foto</button>
                                <button className={styles.btnDanger} onClick={() => handleRemovePerson('leadership-member', roleIdx.toString(), idx)}>Hapus</button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--osmis-green)', marginBottom: '1rem' }}>KEPALA & ANGGOTA DIVISI</h3>
              {data.organization.divisions.map(div => (
                <div key={div.id} style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ fontSize: '1rem', borderBottom: '1px solid #27272a', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={div.icon} alt={div.name} width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
                    {div.name}
                  </h4>
                  <table className={styles.table}>
                    <tbody>
                      {/* HEADS */}
                      {div.heads?.map((h, idx) => (
                        <tr key={`head-${idx}`}>
                          {editingTarget?.type === 'head' && editingTarget.id === div.id && editingTarget.idx === idx ? (
                            <td colSpan={2}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="text" className={styles.input} value={editMemberName} onChange={e => setEditMemberName(e.target.value)} placeholder="Nama Kepala" style={{ flex: 1 }} />
                                <input type="text" className={styles.input} value={editMemberImage} onChange={e => setEditMemberImage(e.target.value)} placeholder="Image URL / Drive ID" style={{ flex: 1 }} />
                                <button className={styles.btnPrimary} onClick={handleSaveEdit}>Simpan</button>
                                <button className={styles.btnSecondary} onClick={() => setEditingTarget(null)} style={{ border: 'none', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Batal</button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td>
                                <span style={{ color: 'var(--osmis-yellow)', fontSize: '0.7rem', border: '1px solid var(--osmis-yellow)', padding: '2px 4px', borderRadius: '4px', marginRight: '0.5rem' }}>KEPALA</span>
                                {h.name}
                              </td>
                              <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button className={styles.btnSecondary} onClick={() => handleChangeName('head', div.id, idx, h.name)} style={{ border: '1px solid #52525b', background: 'transparent', color: '#fafafa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Ganti Nama</button>
                                <button className={styles.btnSecondary} onClick={() => startEdit('head', div.id, idx, h.name, h.image || '')} style={{ border: '1px solid #52525b', background: 'transparent', color: '#fafafa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Edit Foto</button>
                                <button className={styles.btnDanger} onClick={() => handleRemovePerson('head', div.id, idx)}>Hapus</button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      
                      {/* MEMBERS */}
                      {div.members.map((m, idx) => (
                        <tr key={`member-${idx}`}>
                          {editingTarget?.type === 'member' && editingTarget.id === div.id && editingTarget.idx === idx ? (
                            <td colSpan={2}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="text" className={styles.input} value={editMemberName} onChange={e => setEditMemberName(e.target.value)} placeholder="Nama Lengkap" style={{ flex: 1 }} />
                                <input type="text" className={styles.input} value={editMemberImage} onChange={e => setEditMemberImage(e.target.value)} placeholder="Image URL / Drive ID" style={{ flex: 1 }} />
                                <button className={styles.btnPrimary} onClick={handleSaveEdit}>Simpan</button>
                                <button className={styles.btnSecondary} onClick={() => setEditingTarget(null)} style={{ border: 'none', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Batal</button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td>{m.name}</td>
                              <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button className={styles.btnSecondary} onClick={() => handleChangeName('member', div.id, idx, m.name)} style={{ border: '1px solid #52525b', background: 'transparent', color: '#fafafa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Ganti Nama</button>
                                <button className={styles.btnSecondary} onClick={() => startEdit('member', div.id, idx, m.name, m.image || '')} style={{ border: '1px solid #52525b', background: 'transparent', color: '#fafafa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Edit Foto</button>
                                <button className={styles.btnDanger} onClick={() => handleRemovePerson('member', div.id, idx)}>Hapus</button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        );

      case 'drive':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Google Drive API</h2>
            <p className={styles.cardDesc}>Hubungkan dengan Google Drive untuk mengakses file secara langsung melalui API.</p>
            <Suspense fallback={<div>Loading Drive Component...</div>}>
              <DriveConnect />
            </Suspense>
          </div>
        );

      case 'tiktok':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>TikTok Video Folders</h2>
            <p className={styles.cardDesc}>Atur Folder ID Google Drive untuk setiap kategori video di halaman profil ala TikTok.</p>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Folder ID</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.tiktokFolders?.map(folder => (
                  <tr key={folder.id}>
                    <td>{folder.name}</td>
                    <td>{folder.folderId || '- Kosong -'}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className={styles.btnPrimary} 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                        onClick={() => {
                          openPrompt({
                            title: `Edit Folder ID: ${folder.name}`,
                            description: 'Masukkan Folder ID Google Drive untuk kategori TikTok ini:',
                            defaultValue: folder.folderId || '',
                            placeholder: 'Contoh: 1aB2cD3eF4gH...',
                            confirmText: 'Simpan Folder ID',
                            onConfirm: (newId) => {
                              if (newId !== null) {
                                const newFolders = data.tiktokFolders?.map(f => f.id === folder.id ? { ...f, folderId: newId.trim() } : f);
                                updateData({ tiktokFolders: newFolders });
                                showToast(`Folder ID untuk ${folder.name} berhasil disimpan!`, 'success');
                              }
                            }
                          });
                        }}
                      >
                        Edit Folder ID
                      </button>
                      
                      {folder.folderId && (
                        <button 
                          className={styles.btnSecondary} 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', border: '1px solid #52525b', background: 'transparent', color: '#fafafa' }}
                          onClick={async () => {
                            showToast(`Sedang menarik video dari Drive untuk ${folder.name}...`, 'info');
                            try {
                              const res = await fetch(`/api/drive/files?folderId=${folder.folderId}`);
                              if (!res.ok) {
                                showToast('Gagal menarik data dari Drive. Pastikan Anda sudah login ke Drive API di tab sebelah.', 'error');
                                return;
                              }
                              const files = await res.json();
                              const videoFiles = files.filter((f: any) => f.mimeType && f.mimeType.startsWith('video/'));
                              
                              const newFolders = data.tiktokFolders?.map(f => 
                                f.id === folder.id ? { ...f, videos: videoFiles } : f
                              );
                              updateData({ tiktokFolders: newFolders });
                              showToast(`Berhasil menarik ${videoFiles.length} video untuk ${folder.name}! Jangan lupa klik Terapkan ke Publik.`, 'success');
                            } catch (err: any) {
                              showToast('Error: ' + err.message, 'error');
                            }
                          }}
                        >
                          Tarik Data Drive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div>Fitur belum diimplementasi di prototype ini.</div>;
    }
  };

  const handleDisconnect = () => {
    sessionStorage.removeItem('backroom_auth');
    router.push('/');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoBox} style={{ background: 'transparent' }}>
            <img src="/logo_utama.png" alt="OSMIS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className={styles.brandText}>
            <h3>BACKROOM</h3>
            <p>OSMIS SECURE ADMIN</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <button className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`} onClick={() => setActiveTab('dashboard')}>Overview</button>
          <button className={`${styles.navItem} ${activeTab === 'drive' ? styles.active : ''}`} onClick={() => setActiveTab('drive')}>Drive API</button>
          <button className={`${styles.navItem} ${activeTab === 'sosmed' ? styles.active : ''}`} onClick={() => setActiveTab('sosmed')}>Sosial Media</button>
          <button className={`${styles.navItem} ${activeTab === 'galeri' ? styles.active : ''}`} onClick={() => setActiveTab('galeri')}>Galeri</button>
          <button className={`${styles.navItem} ${activeTab === 'tiktok' ? styles.active : ''}`} onClick={() => setActiveTab('tiktok')}>TikTok (Video)</button>
          <button className={`${styles.navItem} ${activeTab === 'pengurus' ? styles.active : ''}`} onClick={() => setActiveTab('pengurus')}>Divisi & Pengurus</button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.navItem} style={{ color: '#ef4444' }} onClick={handleDisconnect}>← Disconnect</button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.breadcrumbs}>
            Admin / <span style={{ color: '#FFF' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>IM</div>
            <span>immszkyy (Superadmin)</span>
          </div>
        </header>
        
        <div className={styles.content}>
          {renderContent()}
        </div>
      </main>

      {/* Toast Notifications */}
      <div className={styles.toastContainer}>
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`${styles.toast} ${
              toast.type === 'success' ? styles.toastSuccess :
              toast.type === 'error' ? styles.toastError :
              toast.type === 'warning' ? styles.toastWarning : styles.toastInfo
            }`}
          >
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'warning' && <AlertTriangle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)} 
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7, padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Custom Modal Dialog */}
      {modalState.isOpen && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.customModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalHeaderTitle}>
                {modalState.isDestructive ? (
                  <AlertTriangle size={18} color="#ef4444" />
                ) : (
                  <Sparkles size={18} color="var(--osmis-yellow)" />
                )}
                {modalState.title}
              </h3>
              <button className={styles.modalCloseBtn} onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalState.description && (
                <p className={styles.modalDesc}>{modalState.description}</p>
              )}

              {modalState.warning && (
                <div className={styles.modalWarningBox}>
                  <strong>⚠️ Perhatian:</strong> {modalState.warning}
                </div>
              )}

              {modalState.info && (
                <div className={styles.modalInfoBox}>
                  <strong>ℹ️ Info:</strong> {modalState.info}
                </div>
              )}

              {modalState.type === 'prompt' && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!modalInputVal.trim()) return;
                    modalState.onConfirm(modalInputVal.trim());
                    closeModal();
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <input
                    type="text"
                    className={styles.input}
                    value={modalInputVal}
                    onChange={e => setModalInputVal(e.target.value)}
                    placeholder={modalState.placeholder || 'Ketik di sini...'}
                    autoFocus
                    style={{ background: '#18181b', borderColor: '#3f3f46', padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                  />
                </form>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className={styles.btnSecondary} 
                onClick={closeModal}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {modalState.cancelText || 'Batal'}
              </button>
              <button 
                type="button"
                className={modalState.isDestructive ? styles.btnDanger : styles.btnPrimary}
                style={modalState.isDestructive ? { padding: '0.5rem 1rem', fontSize: '0.85rem' } : { padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#fafafa', color: '#09090b' }}
                onClick={() => {
                  modalState.onConfirm(modalInputVal.trim());
                  closeModal();
                }}
              >
                {modalState.confirmText || 'Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
