import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

function createMessage(role, content) {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  return {
    id,
    role,
    content
  };
}

export default function ChatAssistant({
  menuItems,
  alterations,
  selectedItem,
  selectedMods,
  selectedSweetness,
  cart
}) {
  const [messages, setMessages] = useState([
    createMessage(
      'assistant',
      'Hi! I can help you pick a drink, explain toppings, or suggest sweetness and ice levels.'
    )
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const buttonRef = useRef(null);

  const quickPrompts = [
    'What is a good sweet drink?',
    'What is something refreshing?',
    'What topping should I get?',
    'What sweetness level do you recommend?',
    'What goes well with my selected drink?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isChatOpen &&
        chatRef.current &&
        !chatRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeChat();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 0);
    }
  }, [isChatOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  async function sendMessage(customText = null) {
    const text = (customText ?? input).trim();

    if (!text || loading) return;

    setMessages((prev) => [...prev, createMessage('user', text)]);
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
        createMessage('assistant', response.reply || 'Sorry, I could not generate a response.')
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);

      setMessages((prev) => [
        ...prev,
        createMessage('assistant', `Chatbot error: ${error.message || 'Unknown error'}`)
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openChat() {
    setIsChatOpen(true);
    setIsChatClosing(false);
    setShowHint(false);
  }

  function closeChat() {
    setIsChatClosing(true);

    setTimeout(() => {
      setIsChatOpen(false);
      setIsChatClosing(false);
    }, 220);
  }

  function toggleChat() {
    if (isChatOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  return (
    <>
      {showHint && !isChatOpen && (
        <div className="chat-hint-bubble">
          Hello! I’ll help you pick a drink!
        </div>
      )}

      <button
        type="button"
        className="floating-chat-button"
        onClick={toggleChat}
        aria-label={isChatOpen ? 'Close chat assistant' : 'Open chat assistant'}
        title={isChatOpen ? 'Close drink assistant' : 'Open drink assistant'}
        ref={buttonRef}
      >
        <img src="/chat_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="" />
      </button>

      {isChatOpen && (
        <div
          className={`floating-chat-panel ${isChatClosing ? 'chat-closing' : 'chat-opening'}`}
          ref={chatRef}
        >
          <div className="card">
            <h2>Drink Assistant</h2>

            <p className="subtle">
              Ask for recommendations, toppings, sweetness, or help deciding.
            </p>

            <div className="chat-message-list">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${
                    msg.role === 'assistant' ? 'assistant-message' : 'user-message'
                  }`}
                >
                  <div>{msg.content}</div>
                </div>
              ))}

              {loading && <p className="subtle">Assistant is typing...</p>}

              <div ref={messagesEndRef} />
            </div>

            <div
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

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="chat-assistant-input"
                name="chatAssistantMessage"
                type="text"
                autoComplete="off"
                aria-label="Ask the drink assistant about drinks, toppings, or sweetness"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about drinks!"
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
        </div>
      )}
    </>
  );
}