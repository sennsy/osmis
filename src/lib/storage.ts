"use client";

import { useState, useEffect } from 'react';

// Import all static initial data
import { organization as initialOrg } from '../data/organization';
import { periods as initialPeriods } from '../data/periods';
import { galleryCategories as initialGallery } from '../data/gallery';

const STORAGE_KEY = 'osmis_data_overrides';

export type OsmisDataOverrides = {
  organization?: typeof initialOrg;
  periods?: typeof initialPeriods;
  gallery?: typeof initialGallery;
  socialMedia?: {
    instagram: string;
  };
};

// Global event name for syncing updates across components
const STORAGE_EVENT = 'osmis_data_updated';

function getStoredOverrides(): OsmisDataOverrides {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

export function updateOsmisData(newOverrides: Partial<OsmisDataOverrides>) {
  if (typeof window === 'undefined') return;
  const current = getStoredOverrides();
  const updated = { ...current, ...newOverrides };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useOsmisData() {
  const [data, setData] = useState({
    organization: initialOrg,
    periods: initialPeriods,
    gallery: initialGallery,
    socialMedia: { instagram: 'harmatra_id' }
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const overrides = getStoredOverrides();
      setData({
        organization: overrides.organization || initialOrg,
        periods: overrides.periods || initialPeriods,
        gallery: overrides.gallery || initialGallery,
        socialMedia: overrides.socialMedia || { instagram: 'harmatra_id' }
      });
      setIsLoaded(true);
    };

    // Load initial data
    loadData();

    // Listen for updates from Backroom
    window.addEventListener(STORAGE_EVENT, loadData);
    return () => window.removeEventListener(STORAGE_EVENT, loadData);
  }, []);

  return { data, isLoaded, updateData: updateOsmisData };
}
