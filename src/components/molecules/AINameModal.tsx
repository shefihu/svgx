'use client';

import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/atoms';

type ModalState = 'closed' | 'loading' | 'result';

const loadingMessages = [
  'Reading the SVG structure…',
  'Thinking of the perfect name…',
  'Consulting the AI oracle…',
  'Almost there…',
];

interface AINameModalProps {
  state: ModalState;
  suggestedName: string;
  loadingMsgIndex: number;
  onUse: () => void;
  onDismiss: () => void;
}

export function AINameModal({
  state,
  suggestedName,
  loadingMsgIndex,
  onUse,
  onDismiss,
}: AINameModalProps) {
  if (state === 'closed') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={state === 'result' ? onDismiss : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-black border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top border accent */}
        <div className="h-px w-full bg-white/20" />

        <div className="p-6">
          {state === 'loading' ? (
            <div className="flex flex-col items-center gap-5 py-4">
              {/* Spinner */}
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-white/60" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-base">
                  AI is naming your icon
                </p>
                <p className="text-white/40 text-sm mt-1">
                  {loadingMessages[loadingMsgIndex]}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Close button */}
              <button
                onClick={onDismiss}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white/70" />
                </div>

                <div className="text-center">
                  <p className="text-white/50 text-sm mb-3">
                    AI suggests naming this icon
                  </p>
                  <div className="px-5 py-3 bg-white/5 border border-white/15 rounded-xl">
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {suggestedName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={onUse}
                >
                  Use this name
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
