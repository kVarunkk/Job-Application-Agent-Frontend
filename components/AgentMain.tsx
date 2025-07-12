"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  LogOut,
  Send,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import AgentNavbar from "./AgentNavbar";
import { createClient } from "@/lib/supabase/client";
import CreateAgentDialog from "./CreateAgentDialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import AgentMessage from "./AgentMessage";
import { Textarea } from "./ui/textarea";

interface AgentMainProps {
  agent?: Agent;
  activeUser: User | null;
}

const startPrompts = [
  {
    id: uuidv4(),
    content: "What can you do?",
  },
  {
    id: uuidv4(),
    content: "Scrape 3 jobs",
  },
  {
    id: uuidv4(),
    content: "Generate cover letter",
  },
  {
    id: uuidv4(),
    content: "Apply to a job",
  },
];

export default function AgentMain({ agent, activeUser }: AgentMainProps) {
  const [user, setUser] = useState<User | null>(activeUser);
  const [messages, setMessages] = useState<Message[]>(agent?.messages || []);
  const [agentMsgLoading, setAgentMsgLoading] = useState(false);
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesRef = useRef<Message[]>(messages);
  const [isOutOfView, setIsOutOfView] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOutOfView(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );

    const element = scrollRef.current;
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const submitUserInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: uuidv4(),
      content: input,
      role: "user",
      created_at: new Date().toISOString(),
    };

    const agentMessage: Message = {
      id: uuidv4(),
      content: "",
      role: "agent",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage, agentMessage]);
    setAgentMsgLoading(true);
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw sessionError;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${agent?.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
          }),
        }
      );

      if (!res.ok || !res.body) {
        throw new Error("Agent failed to respond.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean); // remove empty lines

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.replace(/^data:\s*/, ""); // Remove "data: " prefix
            const data = JSON.parse(jsonStr);
            finalText += data.text;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === agentMessage.id
                  ? { ...msg, content: finalText }
                  : msg
              )
            );
          }
        }
      }

      const { data, error } = await supabase
        .from("agents")
        .update({
          messages: messagesRef.current,
        })
        .eq("id", agent?.id);

      if (error) throw new Error("Failed to update messages in database.");
    } catch (error) {
      // console.error("Error chatting with agent:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "⚠️ Agent failed to respond.",
          role: "agent",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setAgentMsgLoading(false);
    }
  }, []);

  return (
    <div className=" h-full w-full overflow-y-hidden relative">
      {/* navbar */}
      <AgentNavbar agent={agent} user={user} />
      {/* chat area */}
      <div className="h-full w-full flex justify-center items-center p-4">
        {agent?.id ? (
          <div className="w-full h-full relative">
            {/* messages */}
            <div className="h-full overflow-y-auto overflow-x-hidden px-4 py-28 lg:px-40 xl:px-56 flex flex-col gap-4">
              {messages.length === 0 && (
                <div className="w-full flex flex-col gap-5 items-center justify-center">
                  <div className="text-center  text-2xl text-primary">
                    Start applying to your dream jobs!
                  </div>
                  <Greeting agentType={agent.type} />
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {startPrompts.map((prompt) => (
                      <Button
                        key={prompt.id}
                        variant="outline"
                        onClick={() => {
                          submitUserInput(prompt.content);
                        }}
                      >
                        {prompt.content}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message, index) =>
                message.role === "user" ? (
                  <div key={message.id} className={`flex justify-end mb-4`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-muted text-primary max-w-md"
                          : ""
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={message.id}>
                    <AgentMessage
                      content={message.content}
                      isLast={index === messages.length - 1}
                      submitUserInput={submitUserInput}
                    />
                    {agentMsgLoading && messages.length - 1 === index && (
                      <span className="ml-2 animate-pulse w-5">...</span>
                    )}
                  </div>
                )
              )}
              <div ref={scrollRef} />
            </div>
            {isOutOfView && (
              <div className="absolute bottom-28 flex w-full justify-center">
                <Button
                  onClick={() => {
                    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  variant={"outline"}
                  className="transition !p-3 !rounded-full"
                >
                  <ArrowDown />
                </Button>
              </div>
            )}
            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(formRef.current!);
                const inputText = formData.get("userInput")?.toString().trim();
                if (inputText) {
                  submitUserInput(inputText);
                  formRef.current?.reset();
                }
              }}
              ref={formRef}
              className="absolute inset-x-0 px-4 lg:px-40 xl:px-56 bottom-10 w-full flex justify-center items-center gap-2"
            >
              <Textarea
                className="flex-1 bg-secondary text-secondary-foreground"
                name="userInput"
                placeholder="Start typing your message..."
                required
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
              <Button type="submit" variant="ghost">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-5 justify-center items-center">
            <h2 className="text-xl font-semibold">
              Select an agent or create a new one to start applying to jobs!
            </h2>
            <CreateAgentDialog triggerBtn={<Button>Create New Agent</Button>} />
          </div>
        )}
      </div>
    </div>
  );
}

function Greeting({ agentType }: { agentType: EAgentType }) {
  let greeting: React.ReactNode;
  switch (agentType) {
    case "ycombinator":
      greeting = (
        <p className="text-lg text-center text-muted-foreground">
          This agent helps you to find suitable YCombinator jobs from{" "}
          <a
            className="underline"
            target="_blank"
            href="https://workatastartup.com"
          >
            Workatastartup.com
          </a>{" "}
          according to your resume, compare with your resume, generate cover
          letter and apply to them for you.
        </p>
      );
      break;

    case "remoteok":
      greeting = (
        <p className="text-lg text-center text-muted-foreground">
          This agent helps you to find suitable jobs from{" "}
          <a className="underline" target="_blank" href="https://remoteok.com">
            remoteok.com
          </a>{" "}
          according to your resume, compare with your resume, generate cover
          letter and much more.
        </p>
      );
      break;

    default:
      <p></p>;
  }

  return greeting;
}
