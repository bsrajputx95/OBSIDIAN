"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Stage } from "@/lib/store/stage";

type StageActionsProps = {
  stage: Stage;
  isComplete: boolean;
  isFinalStage: boolean;
  onReanalyze: () => void;
  onChatMore: (followUp: string) => void;
  onSendToNext: () => void;
};

export function StageActions({ isComplete, isFinalStage, onReanalyze, onChatMore, onSendToNext }: StageActionsProps) {
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReanalyze}
          className="bg-card/40 text-foreground border-border hover:bg-muted/50"
        >
          🔄 Re-analyze
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChatInput((v) => !v)}
          className="bg-card/40 text-foreground border-border hover:bg-muted/50"
        >
          💬 Chat More
        </Button>
        {!isFinalStage && (
          <Button
            variant="outline"
            size="sm"
            disabled={!isComplete}
            onClick={onSendToNext}
            className="bg-card/40 text-foreground border-border hover:bg-muted/50 disabled:opacity-50"
          >
            ➡ Send to Next Stage
          </Button>
        )}
      </div>
      {showChatInput && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Enter your follow-up question or instruction..."
            className="min-h-[80px]"
          />
          <Button
            size="sm"
            onClick={() => {
              if (chatInput.trim()) {
                onChatMore(chatInput);
                setChatInput("");
                setShowChatInput(false);
              }
            }}
            disabled={!chatInput.trim()}
            className="bg-purple-500/80 hover:bg-purple-600 text-white"
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}