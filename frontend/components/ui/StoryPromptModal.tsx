"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, PenTool, Mic } from "lucide-react";
import { Sparkles } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Button } from "./Button";
import { handleSessionExpiry } from "@/utils/handleSessionExpiry";
import { toast } from "sonner";
import { PrivateRoute } from "@/utils/RouteProtection";
const serverBaseUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

interface StoryPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryPromptModal({
  isOpen,
  onClose,
}: StoryPromptModalProps) {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [activeMode, setActiveMode] = useState<"text" | "mic">("text");
  const [disabled, setDisabled] = useState(false);
  const [textTranscript, setTextTranscript] = useState("");
  const [errors, setErrors] = useState({
    story: "",
  });
  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    const saved = sessionStorage.getItem("story");
    if (saved) setStory(saved);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("story", story);
  }, [story]);

  useEffect(() => {
    if (activeMode === "mic") {
      if (!browserSupportsSpeechRecognition) {
        toast.error("Browser doesn't support speech recognition");
        return setActiveMode("text");
      }
      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [activeMode]);

  useEffect(() => {
    if (activeMode === "mic" && transcript) {
      setStory((prev) => {
        if (prev.endsWith(transcript)) return prev;
        return textTranscript + " " + transcript;
      });
    }
  }, [transcript, activeMode]);

  useEffect(() => {
    if (!listening) {
      resetTranscript();
    }
  }, [listening, activeMode]);

  if (!isOpen) return null;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      story: "",
    });
    setDisabled(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${serverBaseUrl}/user/story/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ story }),
      });
      const data = await response.json();
      if (response.ok) {
        const storyId = data.response.storyId;
        const questions = data.response.questions;

        sessionStorage.setItem("storyId", storyId);
        sessionStorage.setItem("questions", questions);
        sessionStorage.removeItem("story");
        router.push("/clarity-questions");
      } else {
        if (handleSessionExpiry(data.message, router)) return;
        if (response.status === 403) {
          const error = typeof data.error;
          if (error === "object") {
            setErrors(data.error);
          }
        } else if (response.status === 402) {
          toast.error(data.message || "Please select a plan first");
          router.push("/select-plan");
          return;
        }
        const msg = data.message || "Failed to create your story";
        toast.error(msg);
      }
    } catch {
      toast.error("Failed to create your story");
    } finally {
      setDisabled(false);
    }
  };

  return (
    <PrivateRoute>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-scale-in border border-[#A8DADC]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>

          <div className="relative p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="p-2 rounded-full bg-[#457B9D] shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#1D3557] mb-2 font-[Cormorant_Garamond]">
                Share Your Story
              </h2>
              <p className="text-[#5A9AAF] text-sm">
                Every great story begins with a single moment. What’s yours?
              </p>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                disabled={activeMode === "mic"}
                placeholder="Once upon a time... or perhaps it was just yesterday."
                className="w-full p-4 text-gray-800 bg-[#F1FAEE] border border-[#A8DADC] rounded-xl resize-none placeholder-gray-400 text-sm leading-relaxed focus:outline-none focus:border-[#457B9D] focus:ring-4 focus:ring-[#A8DADC]/50 transition-all duration-200"
                rows={7}
              />

              {/* Floating Buttons */}
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={() => {
                    setActiveMode("mic");
                    setTextTranscript(story);
                  }}
                  className={`p-2 rounded-full transition duration-200 shadow-lg ${
                    activeMode === "mic"
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-[#457B9D] hover:bg-[#1D3557] hover:shadow-xl transform hover:scale-110"
                  }`}
                  title="Voice input"
                >
                  <Mic className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={() => setActiveMode("text")}
                  className={`p-2 rounded-full transition duration-200 shadow-lg ${
                    activeMode === "text"
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-[#457B9D] hover:bg-[#1D3557] hover:shadow-xl transform hover:scale-110"
                  }`}
                  title="Writing assistant"
                >
                  <PenTool className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Status + Count */}
            <div className="w-full flex justify-between items-center mt-2 mb-4 px-1 text-xs text-gray-500">
              <div>
                {errors?.story && (
                  <p className="joi-error-message text-xs">
                    {errors?.story[0]}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center px-1 text-xs text-gray-500">
                <span>{story.length}/10,000</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <Button
                onClick={handleContinue}
                disabled={story.trim().length === 0 || disabled}
                className="flex-1 py-3 text-sm font-semibold bg-[#457B9D] text-white hover:bg-[#1D3557] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                Continue Journey
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Quote */}
            <div className="mt-6 p-3 bg-[#F1FAEE] border border-[#A8DADC] rounded-xl">
              <p className="text-center text-[#5A9AAF] font-bold text-xs">
                Please wait: Clarity questions can take 2 minutes to create
              </p>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
