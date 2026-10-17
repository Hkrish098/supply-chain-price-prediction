"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { postOnboarding } from '@/services/api';

type ChatAction = {
  label: string;
  value: string;
  variant?: 'primary' | 'outline';
};

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  actions?: ChatAction[];
  answered?: boolean;
};

type Phase = 'greeting' | 'explain' | 'invite' | 'done';

type Props = {
  onComplete: () => void;
};

const GREETING_MESSAGE =
  "Before we get started, are you familiar with procurement?";

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="h-2 w-2 rounded-full bg-brand-400"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const ActionButtons = ({
  actions,
  onSelect,
  disabled,
}: {
  actions: ChatAction[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {actions.map((action) => (
      <motion.button
        key={action.label}
        type="button"
        disabled={disabled}
        onClick={() => onSelect(action.value)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
          action.variant === 'primary'
            ? 'bg-brand-700 text-white shadow-md'
            : 'border border-brand-200 bg-white text-brand-600 hover:bg-brand-50'
        }`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {action.label}
      </motion.button>
    ))}
  </div>
);

export const OnboardingChat: React.FC<Props> = ({ onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'greeting',
      role: 'bot',
      text: GREETING_MESSAGE,
      actions: [
        { label: 'Yes', value: 'yes', variant: 'outline' },
        { label: 'No', value: 'no', variant: 'primary' },
      ],
    },
  ]);
  const [phase, setPhase] = useState<Phase>('greeting');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const markAnswered = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, answered: true, actions: undefined } : m)),
    );
  }, []);

  const addBotMessage = useCallback((text: string, actions?: ChatAction[]) => {
    setMessages((prev) => [
      ...prev,
      { id: `bot-${Date.now()}-${prev.length}`, role: 'bot', text, actions },
    ]);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}-${prev.length}`, role: 'user', text },
    ]);
  }, []);

  useEffect(() => {
    // Scroll the conversation only, so new messages never move the page.
    const container = messagesRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleKnowledgeAnswer = async (messageId: string, knows: boolean) => {
    markAnswered(messageId);
    addUserMessage(knows ? 'Yes' : 'No');
    setPhase('explain');
    setLoading(true);

    try {
      const res = await postOnboarding({ step: 'explain', knows_supply_chain: knows });
      addBotMessage(res.reply);

      const invite = await postOnboarding({ step: 'invite' });
      addBotMessage(invite.reply, [
        { label: "Yes, let's go!", value: 'start-form', variant: 'primary' },
      ]);
      setPhase('invite');
    } catch {
      addBotMessage(
        knows
          ? 'Good to know! We focus on office supplies — a small set of essentials like printer paper, pens, and staplers. Fill in the form to get a price estimate, and we factor in live weather, news, and fuel costs so the tips match real conditions.'
          : 'Supply chain is simply getting products from a supplier to you on time. We handle office supplies only — about 2–3 essentials like paper, pens, and staplers. The form gives you a price estimate, informed by live weather, news, and shipping costs.',
      );
      addBotMessage('Ready to try it? Open the price forecast from the card below.', [
        { label: "Yes, let's go!", value: 'start-form', variant: 'primary' },
      ]);
      setPhase('invite');
    } finally {
      setLoading(false);
    }
  };

  const handleStartForm = (messageId: string) => {
    markAnswered(messageId);
    addUserMessage("Yes, let's go!");
    setPhase('done');
    onComplete();
  };

  const handleAction = (messageId: string, value: string) => {
    if (phase === 'greeting') {
      handleKnowledgeAnswer(messageId, value === 'yes');
      return;
    }
    if (phase === 'invite' && value === 'start-form') {
      handleStartForm(messageId);
    }
  };

  return (
    <div className="flex h-[280px] sm:h-[300px] flex-col overflow-hidden rounded-2xl">
      <div className="shrink-0 border-b border-stone-200 bg-white px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 text-sm text-white shadow-sm">
            💬
          </span>
          <div>
            <h2 className="text-sm font-bold text-stone-900">Quick intro</h2>
            <p className="text-[11px] text-stone-400">A short overview before you predict</p>
          </div>
        </div>
      </div>

      <div ref={messagesRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6" role="log" aria-label="Introduction conversation" aria-live="polite">
        <div className="mx-auto max-w-2xl space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block rounded-2xl px-4 py-3 text-left text-sm leading-6 ${
                      msg.role === 'user'
                        ? 'bg-brand-700 text-white shadow-md'
                        : 'border border-stone-200/60 bg-stone-50/90 text-stone-800'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.role === 'bot' && msg.actions && !msg.answered && (
                    <ActionButtons
                      actions={msg.actions}
                      onSelect={(value) => handleAction(msg.id, value)}
                      disabled={loading}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-stone-200/60 bg-stone-50/80">
                <TypingIndicator />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingChat;
