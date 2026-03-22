
import React from 'react';
import './SectionHeader.css';

interface Props {
  title: string;
  onSeeAll?: () => void;
}

export default function SectionHeader({ title, onSeeAll }: Props) {
  return (
    <div className="section-header">
      <h2 className="section-header__title">{title}</h2>
      {onSeeAll && (
        <button className="section-header__see-all" onClick={onSeeAll}>
          See all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}
    </div>
  );
}
