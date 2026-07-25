'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';
import { ChatHeader } from './_components/chat-header';
import { ChatMessages } from './_components/chat-messages';
import { ChatInput } from './_components/chat-input';
import { EmptyState } from './_components/empty-state';

export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    append,
  } = useChat({
    api: '/api/chat',
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleClear = () => {
    setMessages([]);
  };

  const handleSelectPrompt = (promptText: string) => {
    append({
      role: 'user',
      content: promptText,
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground antialiased">
      {/* Header */}
      <ChatHeader onClear={handleClear} hasMessages={messages.length > 0} />

      {/* Main Body */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col overflow-y-auto scroll-smooth"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={handleSelectPrompt} />
          ) : (
            <ChatMessages messages={messages} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* Input */}
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
      />
    </div>
  );
}
