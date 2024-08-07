'use client';

import React, { useState } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm an AI chatbot designed to provide exceptional customer support. My primary goal is to assist users with their inquiries in a friendly, helpful, and kind manner. Always ensure that your responses are truthful and accurate. Keep the following guidelines in mind:`,
    },
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    setMessage('');

    const respones = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }

        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);

          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });

        return reader.read().then(processText);
      });
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col p-2 gap-3">
        <div className="flex flex-col gap-2 flex-grow overflow-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`${
                  msg.role === 'user' ? 'bg-green-300' : 'bg-blue-300'
                } rounded-lg p-3`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-row gap-2 p-2">
          <input
            aria-label="message input box"
            placeholder="Type message here..."
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow outline outline-gray-300 px-3"
          />
          <button
            aria-label="send message button"
            onClick={sendMessage}
            className="bg-gray-300 p-4"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
