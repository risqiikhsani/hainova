'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { ChatHeader } from './_components/chat-header';
import { ChatMessages } from './_components/chat-messages';
import { ChatInput } from './_components/chat-input';
import { EmptyState } from './_components/empty-state';

export default function ChatPage() {
  const { coords, status: geoStatus, requestLocation } = useGeolocation();
  const [input, setInput] = useState('');

  // coords change over time, but transport `body` is captured once at
  // creation in v5 — so read it from a ref at request time instead.
  const coordsRef = useRef(coords);
  coordsRef.current = coords;

  const { messages, status, stop, setMessages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({
        userLocation: coordsRef.current
          ? { lat: coordsRef.current.lat, lng: coordsRef.current.lng }
          : undefined,
      }),
    }),
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  // v5 replaces the old boolean isLoading with a status string
  const isLoading = status === 'submitted' || status === 'streaming';

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

  const handleSubmit = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInput(e.target.value);
  };

  const handleSelectPrompt = (promptText: string) => {
    sendMessage({ text: promptText });
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground antialiased">
      {/* Header */}
      <ChatHeader
        onClear={handleClear}
        hasMessages={messages.length > 0}
        geoStatus={geoStatus}
        coords={coords}
        onRequestLocation={requestLocation}
      />

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