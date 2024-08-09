"use client";
import React, { useState } from 'react';
import Image from 'next/image';

const Chat = () => {
  const [messages, setMessages] = useState([
    { text: "Hello,\n\nIf you need any help browsing our website just shout.\n\nBtw I'm Annie.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-white rounded-chat shadow-lg overflow-hidden">
      <div className="bg-chat-purple text-white p-4 flex items-center rounded-t-chat">
        <Image src="/avatar.png" alt="Annie" width={30} height={30} className="rounded-full mr-3" />
        <span className="flex-grow">Annie Smith</span>
        <span className="cursor-pointer">•••</span>
      </div>
      
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`${msg.sender === 'bot' ? 'float-left clear-both' : 'float-right clear-both'}`}>
            <div className={`p-3 rounded-chat max-w-[80%] ${
              msg.sender === 'bot' ? 'bg-chat-gray text-gray-800' : 'bg-chat-purple text-white'
            }`}>
              {msg.text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i !== msg.text.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 p-4 flex items-center">
        <input
          type="text"
          className="flex-grow outline-none text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <div className="flex space-x-2">
          <svg className="w-5 h-5 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <svg className="w-5 h-5 text-gray-400 cursor-pointer" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      <button className="absolute bottom-5 right-5 bg-chat-purple text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md">
        ×
      </button>
    </div>
  );
};

export default Chat;
