// import { useState } from 'react';
import { api } from '../services/api';
import { useEffect, useRef, useState } from 'react';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const buttonRef = useRef(null);

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

  function closeChat() {
    setIsChatClosing(true);

    setTimeout(() => {
      setIsChatOpen(false);
      setIsChatClosing(false);
    }, 220);
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  

  const quickPrompts = [
    'What is a good sweet drink?',
    'What is something refreshing?',
    'What topping should I get?',
    'What sweetness level do you recommend?',
    'What goes well with my selected drink?'
  ];

  // return (
  //   <div className="card">
  //     <h2>Drink Assistant</h2>
  //     <p className="subtle">
  //       Ask for recommendations, toppings, sweetness, or help deciding.
  //     </p>

  //     <div className="chat-message-list">
  //       {messages.map((msg, index) => (
  //         <div
  //           key={index}
  //           className={`chat-message ${msg.role === 'assistant' ? 'assistant-message' : 'user-message'}`}
  //         >
  //           <strong>{msg.role === 'assistant' ? 'Assistant' : 'You'}:</strong>{' '}
  //           {msg.content}
  //         </div>
  //       ))}
  //       {loading && <p className="subtle">Assistant is typing...</p>}
  //     </div>

  //     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
  //       {quickPrompts.map((prompt) => (
  //         <button
  //           key={prompt}
  //           type="button"
  //           className="secondary-button inline"
  //           onClick={() => sendMessage(prompt)}
  //           disabled={loading}
  //         >
  //           {prompt}
  //         </button>
  //       ))}
  //     </div>

  //     <div style={{ display: 'flex', gap: '8px' }}>
  //       <input
  //         value={input}
  //         onChange={(e) => setInput(e.target.value)}
  //         placeholder="Ask about drinks, toppings, sweetness..."
  //         onKeyDown={(e) => {
  //           if (e.key === 'Enter') sendMessage();
  //         }}
  //         style={{ flex: 1 }}
  //       />
  //       <button
  //         type="button"
  //         className="primary-button inline"
  //         onClick={() => sendMessage()}
  //         disabled={loading}
  //       >
  //         Send
  //       </button>
  //     </div>
  //   </div>
  // );
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
        // onClick={() => {
        //   if (isChatOpen) closeChat();
        //   else setIsChatOpen(true);
        // }}
        onClick={() => {
          setIsChatOpen((prev) => !prev);
          setShowHint(false);
        }}
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
              {messages.map((msg, index) => (
                // <div
                //   key={index}
                //   className={`chat-message ${msg.role === 'assistant' ? 'assistant-message' : 'user-message'}`}
                // >
                //   <strong>{msg.role === 'assistant' ? 'Assistant' : 'You'}:</strong>{' '}
                //   {msg.content}
                // </div>
                <div className={`chat-message ${msg.role === 'assistant' ? 'assistant-message' : 'user-message'}`}>
                  <div>{msg.content}</div>
                </div>
              ))}
              {loading && <p className="subtle">Assistant is typing...</p>}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
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
