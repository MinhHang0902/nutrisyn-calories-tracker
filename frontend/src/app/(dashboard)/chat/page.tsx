"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatAPI } from "@/lib/api";
import { ChatMessage } from "@/types";
import { useUserProfileStore } from "@/stores";
import { Send, Loader2, User, Bot, History, Plus, AlertTriangle, Clock, Trash2, MessageSquare } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const MESSAGE_LIMIT = 15;

interface ChatSession {
  sessionId: string;
  originalSessionId: string | null;
  messages: ChatMessage[];
  firstMessage: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile, todayNutrition } = useUserProfileStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (historyOpen) {
      loadHistory();
      setViewingSession(null);
    }
  }, [historyOpen]);

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const startNewChat = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setMessages([]);
    setViewingSession(null);
    setInput("");
    setShowLimitDialog(false);
    toast.success("New conversation started");
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await chatAPI.getHistory();
      if (response.data?.length > 0) {
        const mapped = response.data.map((s: any) => ({
          ...s,
          originalSessionId: s.sessionId || null,
        }));
        setChatHistory(mapped);
      }
    } catch (error) {
      console.error("Failed to load chat history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const deleteSession = async (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteSession(session.originalSessionId);
      setChatHistory((prev) => prev.filter((s) => s.sessionId !== session.sessionId));
      if (viewingSession?.sessionId === session.sessionId) {
        setViewingSession(null);
      }
      toast.success("Conversation deleted");
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  const viewSession = (session: ChatSession) => {
    setViewingSession(session);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (messages.length >= MESSAGE_LIMIT * 2) {
      setShowLimitDialog(true);
      return;
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setSessionId(currentSessionId);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const goalLabel = profile?.goal === 'lose_weight' ? 'Lose Weight' 
        : profile?.goal === 'gain_muscle' ? 'Gain Muscle' 
        : 'Maintain Weight';
      
      const context = {
        calorieTarget: profile?.calorieTarget,
        todayCalories: todayNutrition.calories,
        todayProtein: todayNutrition.protein,
        todayCarbs: todayNutrition.carbs,
        todayFat: todayNutrition.fat,
        goal: goalLabel,
      };

      const response = await chatAPI.sendMessage(input, currentSessionId, context);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const totalMessages = messages.length + 2;
      if (totalMessages >= MESSAGE_LIMIT * 2) {
        setTimeout(() => {
          setShowLimitDialog(true);
        }, 500);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Unknown date";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Unknown date";
      return format(date, "MMM dd, yyyy HH:mm");
    } catch {
      return "Unknown date";
    }
  };

  const remainingMessages = Math.max(0, MESSAGE_LIMIT - Math.ceil(messages.length / 2));

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Nutrition Advisor</h1>
          <p className="text-muted-foreground">
            Ask questions about nutrition, meals, and your health goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={historyOpen} onOpenChange={(open) => {
            setHistoryOpen(open);
            if (open) setViewingSession(null);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                {viewingSession ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle>Conversation</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        {formatDate(viewingSession.createdAt)}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingSession(null)}
                      className="text-blue-500 font-bold"
                    >
                      &lt; Back
                    </Button>
                  </div>
                  </div>
                ) : (
                  <div>
                    <DialogTitle>Chat History</DialogTitle>
                    <DialogDescription>
                      Your previous conversations with AI Advisor
                    </DialogDescription>
                  </div>
                )}
              </DialogHeader>

              {viewingSession ? (
                <div className="overflow-y-auto max-h-[60vh] space-y-4 mt-4">
                  {viewingSession.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          msg.role === "user" ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="prose prose-sm dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        <p className={`text-xs mt-2 ${
                          msg.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}>
                          {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[60vh] space-y-3 mt-4">
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No chat history yet</p>
                    </div>
                  ) : (
                    chatHistory.map((session) => (
                      <div
                        key={session.sessionId}
                        className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 cursor-pointer transition-colors relative group"
                        onClick={() => viewSession(session)}
                      >
                        <button
                          onClick={(e) => deleteSession(session, e)}
                          className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(session.updatedAt)}
                        </div>
                        <div className="space-y-1 pr-8">
                          <p className="text-sm truncate">
                            <span className="font-medium">You:</span> {session.firstMessage}
                          </p>
                          <p className="text-sm truncate text-muted-foreground">
                            <span className="font-medium">AI:</span> {session.lastMessage?.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={startNewChat}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="h-3 w-3" />
          {remainingMessages} message{remainingMessages !== 1 ? 's' : ''} remaining in this session
        </div>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Start a New Conversation</p>
                <p className="text-sm">
                  Ask me anything about nutrition, diet plans, or health goals
                </p>
                <p className="text-sm mt-2">
                  Try: &quot;What should I eat for lunch today?&quot;
                </p>
              </div>
            )}
            {messages.map((message) => (
              message.content ? (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "user" ? "bg-primary" : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  >
                  <div className="prose prose-sm dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp 
                      ? formatDistanceToNow(new Date(message.timestamp), {
                          addSuffix: true,
                        })
                      : "Just now"}
                  </p>
                </div>
              </div>
              ) : null
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask about nutrition..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || messages.length >= MESSAGE_LIMIT * 2}
              />
              <Button type="submit" disabled={isLoading || !input.trim() || messages.length >= MESSAGE_LIMIT * 2}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Limit Reached Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <DialogTitle>Conversation Limit Reached</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              The chat has reached its length limit. Please start a new conversation for more accurate answers.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowLimitDialog(false)}>
              Stay Here
            </Button>
            <Button onClick={startNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
