import { useState } from 'react';
import { api } from '../services/api';

export default function ChatAssistant({
  menuItems,
  alterations,
  selectedItem,
  selectedMods,
  selectedSweetness,
  cart
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! I can help you pick a drink, explain toppings, or suggest sweetness and ice levels.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(customText = null) {
    const text = (customText ?? input).trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage({
        message: text,
        menuItems,
        alterations,
        selectedItem,
        selectedMods,
        selectedSweetness,
        cart
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply
        }
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Chatbot error: ${error.message || 'Unknown error'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const quickPrompts = [
    'What is a good sweet drink?',
    'What is something refreshing?',
    'What topping should I get?',
    'What sweetness level do you recommend?',
    'What goes well with my selected drink?'
  ];

  return (
  <div className="card">
    <h2>Drink Assistant</h2>
    <p className="subtle">
      Ask for recommendations, toppings, sweetness, or help deciding.
    </p>

    <div
      role="log"
      aria-live="polite"
      aria-label="Drink assistant conversation"
      style={{
        maxHeight: '280px',
        overflowY: 'auto',
        marginBottom: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '12px',
        background: '#fff'
      }}
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          style={{
            marginBottom: '10px',
            padding: '10px',
            borderRadius: '12px',
            background: msg.role === 'assistant' ? '#f3f4f6' : '#dbeafe'
          }}
        >
          <strong>{msg.role === 'assistant' ? 'Assistant' : 'You'}:</strong>{' '}
          {msg.content}
        </div>
      ))}

      {loading && (
        <p className="subtle" role="status">
          Assistant is typing...
        </p>
      )}
    </div>

    <div
      aria-label="Suggested questions"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px'
      }}
    >
      {quickPrompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          className="secondary-button inline"
          onClick={() => sendMessage(prompt)}
          disabled={loading}
        >
          {prompt}
        </button>
      ))}
    </div>

    {/* Screen Reader Support: Label for input and live region for messages */}
    <div style={{ display: 'flex', gap: '8px' }}>
      <label className="sr-only" htmlFor="drink-assistant-input">
        Ask the drink assistant a question
      </label>

      <input
        id="drink-assistant-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about drinks, toppings, sweetness..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') sendMessage();
        }}
        style={{ flex: 1 }}
      />

      <button
        type="button"
        className="primary-button inline"
        onClick={() => sendMessage()}
        disabled={loading}
      >
        Send
      </button>
    </div>
  </div>
);
}