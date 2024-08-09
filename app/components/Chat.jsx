"use client";

import React, { useState, useEffect, useRef } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm an AI chatbot designed to provide exceptional customer support. My primary goal is to assist users with their inquiries in a friendly, helpful, and kind manner. Always ensure that your responses are truthful and accurate. Keep the following guidelines in mind:`,
    },
  ]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setMessage("");

    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
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
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{backgroundColor:'rgb(36, 36, 36);'
    }}className="flex p-5 h-screen flex-col items-center justify-center ">
      <div className="flex h-full flex-col gap-3 p-2">
        <div className="flex h-full flex-col gap-2 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                
                className={`${

                  msg.role === "user" ? "bg-green-500" : "bg-blue-500"
                } rounded-lg p-3 text-white`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 flex flex-row gap-2 p-2 rounded">
          <input
            aria-label="message input box"
            placeholder="Type message here..."
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{backgroundColor:'rgb(26, 26, 26)'
            }}
            className="flex-grow px-3 rounded-2xl text-white placeholder-gray-200"
          />
          <button
            aria-label="send message button"
            onClick={sendMessage}
            style={{backgroundColor:'rgb(20, 20, 20)'
            }}
            className=" p-4 rounded-2xl text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
