import React from 'react';

export const metadata = {
  title: 'Backroom | OSMIS',
  description: 'Secret administration dashboard.',
};

export default function BackroomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex' }}>
      {children}
    </div>
  );
}
