import React from 'react';
import EmailPageScreen from '../email-page/EmailPageScreen';

interface Props {
  onOpenAI: () => void;
}

export default function EmailTab({ onOpenAI }: Props) {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <EmailPageScreen />
    </div>
  );
}
