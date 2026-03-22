import React, { useState } from 'react';
import './AIAssistantPanel.css';

interface Props {
  onClose: () => void;
}

export default function AIAssistantPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'ai' }>>([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: 'I understand! Let me help you with that. You can also ask me to organize your emails, create notes, or manage your tasks.',
        sender: 'ai' as const
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 500);
  };

  return (
    <div className="ai-panel-overlay" onClick={onClose}>
      <div className="ai-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ai-panel-header">
          <div className="ai-panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <h3>AI Assistant</h3>
          </div>
          <button className="ai-panel-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="ai-panel-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`ai-message ai-message--${msg.sender}`}>
              <div className="ai-message-bubble">
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="ai-panel-input">
          <input
            type="text"
            placeholder="Ask me anything..."
            className="ai-panel-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            className="ai-panel-send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16151496 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.98721575 L3.03521743,10.4282088 C3.03521743,10.5853061 3.34915502,10.7424035 3.50612381,10.7424035 L16.6915026,11.5278905 C16.6915026,11.5278905 17.1624089,11.5278905 17.1624089,12.0 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
