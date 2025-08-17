import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Phone, Video, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { motion } from "framer-motion";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

interface Conversation {
  id: string;
  participant: {
    name: string;
    avatar?: string;
    jobTitle: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    read: boolean;
  };
  messages: Message[];
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const MessagesPage = () => {
  const query = useQuery();
  const jobId = query.get("jobId");
  const client = query.get("client");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: "conv-1",
        participant: {
          name: "Sarah Miller",
          jobTitle: "Kitchen Renovation",
        },
        lastMessage: {
          content: "I can do tomorrow at 2 PM or Thursday at 10 AM...",
          timestamp: new Date("2023-04-29T10:37:00"),
          read: false,
        },
        messages: [
          {
            id: "msg-1",
            sender: "Michael Anderson",
            content: "Hi Sarah, I received your request about the kitchen renovation. Would you like to schedule a consultation?",
            timestamp: new Date("2023-04-29T10:30:00"),
            isCurrentUser: true,
          },
          {
            id: "msg-2",
            sender: "Sarah Miller",
            content: "Yes, that would be great! When are you available this week?",
            timestamp: new Date("2023-04-29T10:35:00"),
            isCurrentUser: false,
          },
          {
            id: "msg-3",
            sender: "Michael Anderson",
            content: "I can do tomorrow at 2 PM or Thursday at 10 AM. Which works better for you?",
            timestamp: new Date("2023-04-29T10:37:00"),
            isCurrentUser: true,
          },
        ],
      }
    ];

    // If jobId and client are present, select or create a conversation
    if (jobId && client) {
      let found = mockConversations.find(
        (conv) => conv.participant.name === client && conv.participant.jobTitle.toLowerCase().includes(jobId)
      );
      if (!found) {
        found = {
          id: `conv-${jobId}-${client}`,
          participant: {
            name: client,
            jobTitle: jobId,
          },
          lastMessage: {
            content: "",
            timestamp: new Date(),
            read: true,
          },
          messages: [],
        };
        mockConversations.push(found);
      }
      setConversations(mockConversations);
      setSelectedConversation(found);
    } else {
    setConversations(mockConversations);
    setSelectedConversation(mockConversations[0]);
    }
  }, [jobId, client]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "Michael Anderson",
      content: newMessage,
      timestamp: new Date(),
      isCurrentUser: true,
    };

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMsg],
      lastMessage: {
        content: newMessage,
        timestamp: new Date(),
        read: true,
      },
    };

    setSelectedConversation(updatedConversation);
    setConversations(
      conversations.map((conv) => (conv.id === selectedConversation.id ? updatedConversation : conv))
    );
    setNewMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-none overflow-hidden">
      <div className="flex flex-1 h-full w-full max-w-none overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-[28%] h-full border-r border-border max-w-none overflow-hidden">
          <header className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Messages</h2>
        </header>
          <div className="flex-1 p-4 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted transition ${
                  selectedConversation?.id === conversation.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={conversation.participant.avatar} />
                  <AvatarFallback>{conversation.participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {conversation.participant.name}
                  </h3>
                    <p className="text-xs text-muted-foreground truncate">
                    {conversation.lastMessage.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          </div>
      </aside>

        {/* Chat Area */}
        <main className="flex-1 h-full flex flex-col w-full max-w-none overflow-hidden">
        {selectedConversation && (
          <>
              {/* Header */}
              <header className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.participant.avatar} />
                  <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedConversation.participant.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedConversation.participant.jobTitle}</p>
                </div>
              </div>
              <div className="flex gap-2">
                  <Button variant="ghost" size="icon" aria-label="Call participant"><Phone className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" aria-label="Video call participant"><Video className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" aria-label="Conversation info"><Info className="h-5 w-5" /></Button>
              </div>
            </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 w-full max-w-none">
                {selectedConversation.messages.map((msg) => (
                  // <motion.div
                  //   key={msg.id}
                  //   initial={{ opacity: 0, y: 10 }}
                  //   animate={{ opacity: 1, y: 0 }}
                  //   className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}
                  // >
                  <div
                    key={msg.id}
                    className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`px-4 py-2 rounded-lg text-sm shadow-sm ${
                      msg.isCurrentUser ? "bg-bojj-primary text-white" : "bg-muted text-muted-foreground"
                    } max-w-[80%]`}>
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {format(msg.timestamp, "p")}
                      </p>
                    </div>
                  </div>
                  // </motion.div>
                ))}
              </div>

              {/* Footer */}
              <footer className="p-4 border-t border-border flex gap-2 items-center">
                <Button variant="ghost" size="icon" aria-label="Attach file"><Paperclip className="h-5 w-5" /></Button>
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className="flex-1"
              />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()} aria-label="Send message">
                <Send className="h-5 w-5" />
              </Button>
            </footer>
          </>
        )}
      </main>
      </div>
    </div>
  );
};

export default MessagesPage;
