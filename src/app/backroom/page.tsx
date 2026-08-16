"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useOsmisData } from '../../lib/storage';
import AnalyticsChart from './components/AnalyticsChart';
import DriveConnect from '../../components/DriveConnect';
import styles from './Backroom.module.css';

export default function Backroom() {
  const router = useRouter();
  const { data, isLoaded, updateData } = useOsmisData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [auth, setAuth] = useState(false);
  
  // Local state for editing
  const [editSosmed, setEditSosmed] = useState('');
  
  // Gallery Edit State
  const [selectedCatId, setSelectedCatId] = useState('');
  const [newPhotoId, setNewPhotoId] = useState('');

  // Structure Edit State
  const [selectedDivId, setSelectedDivId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberImage, setNewMemberImage] = useState('');
  
  // Editing existing member state
  const [editingMember, setEditingMember] = useState<{ divId: string, idx: number } | null>(null);
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
    updateData({ socialMedia: { instagram: editSosmed || data.socialMedia.instagram } });
    alert('Social Media Updated!');
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
    alert('Photo Added!');
  };

  const handleRemovePhoto = (catId: string, photoId: string) => {
    if(!confirm('Delete this photo?')) return;
    const newGallery = data.gallery.map(cat => {
      if (cat.id === catId) {
        return { ...cat, ids: cat.ids.filter(id => id !== photoId) };
      }
      return cat;
    });
    updateData({ gallery: newGallery });
  };

  const handleAddMember = () => {
    if (!selectedDivId || !newMemberName.trim()) return;
    const newOrg = { ...data.organization };
    newOrg.divisions = newOrg.divisions.map(div => {
      if (div.id === selectedDivId) {
        return {
          ...div,
          members: [...div.members, { name: newMemberName.trim(), nameAr: '', image: newMemberImage.trim() || 'https://via.placeholder.com/150' }]
        };
      }
      return div;
    });
    updateData({ organization: newOrg });
    setNewMemberName('');
    setNewMemberImage('');
    alert('Member Added!');
  };

  const handleRemoveMember = (divId: string, memberIdx: number) => {
    if(!confirm('Remove member?')) return;
    const newOrg = { ...data.organization };
    newOrg.divisions = newOrg.divisions.map(div => {
      if (div.id === divId) {
        const newMembers = [...div.members];
        newMembers.splice(memberIdx, 1);
        return { ...div, members: newMembers };
      }
      return div;
    });
    updateData({ organization: newOrg });
  };

  const handleSaveMember = () => {
    if (!editingMember) return;
    const { divId, idx } = editingMember;
    const newOrg = { ...data.organization };
    newOrg.divisions = newOrg.divisions.map(div => {
      if (div.id === divId) {
        const newMembers = [...div.members];
        newMembers[idx] = { 
          ...newMembers[idx],
          name: editMemberName.trim(), 
          image: editMemberImage.trim() || 'https://via.placeholder.com/150' 
        };
        return { ...div, members: newMembers };
      }
      return div;
    });
    updateData({ organization: newOrg });
    setEditingMember(null);
  };

  const startEditMember = (divId: string, idx: number, currentName: string, currentImage: string) => {
    setEditingMember({ divId, idx });
    setEditMemberName(currentName);
    setEditMemberImage(currentImage);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>System Overview</h2>
            <p className={styles.cardDesc}>Data yang Anda ubah di sini akan langsung terlihat di website (disimpan di LocalStorage).</p>
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
            <p className={styles.cardDesc}>Ubah ID/Username Instagram yang terhubung ke website.</p>
            <div className={styles.formGroup}>
              <label>Instagram Username (tanpa @)</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  className={styles.input} 
                  defaultValue={data.socialMedia.instagram}
                  onChange={(e) => setEditSosmed(e.target.value)}
                  placeholder="e.g. harmatra_id"
                />
                <button className={styles.btnPrimary} onClick={handleSaveSosmed}>Simpan</button>
              </div>
            </div>
          </div>
        );

      case 'galeri':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Manajemen Galeri</h2>
            <p className={styles.cardDesc}>Tambah Google Drive ID foto ke kategori tertentu.</p>
            
            <div className={styles.formGroup} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Pilih Kategori</label>
                <select className={styles.input} style={{ marginTop: '0.5rem' }} value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {data.gallery.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label>Drive Image ID</label>
                <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={newPhotoId} onChange={e => setNewPhotoId(e.target.value)} placeholder="1A2B3C4D..." />
              </div>
              <button className={styles.btnPrimary} onClick={handleAddPhoto}>Tambah Foto</button>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Total Foto</th>
                  <th>Aksi (Hapus Foto Terakhir)</th>
                </tr>
              </thead>
              <tbody>
                {data.gallery.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td>{cat.ids.length}</td>
                    <td>
                      <button 
                        className={styles.btnDanger} 
                        disabled={cat.ids.length === 0}
                        onClick={() => handleRemovePhoto(cat.id, cat.ids[cat.ids.length - 1])}
                      >
                        Hapus 1 Foto
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'pengurus':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Struktur Divisi</h2>
            <p className={styles.cardDesc}>Kelola anggota setiap divisi. Anda bisa menambah, mengubah, atau menghapus anggota.</p>

            <div className={styles.formGroup} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Pilih Divisi</label>
                <select className={styles.input} style={{ marginTop: '0.5rem' }} value={selectedDivId} onChange={e => setSelectedDivId(e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {data.organization.divisions.map(div => <option key={div.id} value={div.id}>{div.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Nama Anggota</label>
                <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="Nama Lengkap" />
              </div>
              <div style={{ flex: 1 }}>
                <label>Drive Image ID / URL</label>
                <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} value={newMemberImage} onChange={e => setNewMemberImage(e.target.value)} placeholder="opsional" />
              </div>
              <button className={styles.btnPrimary} onClick={handleAddMember}>Tambah</button>
            </div>

            {data.organization.divisions.map(div => (
              <div key={div.id} style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #27272a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{div.name}</h3>
                <table className={styles.table}>
                  <tbody>
                    {div.members.map((m, idx) => {
                      const isEditing = editingMember?.divId === div.id && editingMember?.idx === idx;
                      
                      if (isEditing) {
                        return (
                          <tr key={idx}>
                            <td colSpan={2}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input 
                                  type="text" 
                                  className={styles.input} 
                                  value={editMemberName} 
                                  onChange={e => setEditMemberName(e.target.value)} 
                                  placeholder="Nama Lengkap"
                                  style={{ flex: 1 }}
                                />
                                <input 
                                  type="text" 
                                  className={styles.input} 
                                  value={editMemberImage} 
                                  onChange={e => setEditMemberImage(e.target.value)} 
                                  placeholder="Image URL / Drive ID"
                                  style={{ flex: 1 }}
                                />
                                <button className={styles.btnPrimary} onClick={handleSaveMember}>Simpan</button>
                                <button className={styles.btnSecondary} onClick={() => setEditingMember(null)} style={{ border: 'none', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Batal</button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      
                      return (
                        <tr key={idx}>
                          <td>{m.name}</td>
                          <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                              className={styles.btnSecondary} 
                              onClick={() => startEditMember(div.id, idx, m.name, m.image || '')}
                              style={{ border: '1px solid #52525b', background: 'transparent', color: '#fafafa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button className={styles.btnDanger} onClick={() => handleRemoveMember(div.id, idx)}>Hapus</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
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
    </div>
  );
}
