import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RiRobot2Line } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa6";
import images from "../../assets/images";
import { Chat, Container, Header } from "./styles";
import { businessChatService } from "../../services/businessChatService";

interface ChatMessage {
  text: string;
  type: "user" | "ai";
}

const BusinessChat = () => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [chatText, setChatText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleChatBot = async () => {
    if (!chatText.trim()) {
      alert("Please enter a message");
      return;
    }

    setChatHistory((prev) => [...prev, { text: chatText, type: "user" }]);

    try {
      const response = await businessChatService(chatText);
      const reply = response?.reply || "No response from AI";

      setChatHistory((prev) => [...prev, { text: reply, type: "ai" }]);

      setChatText("");
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { text: "Internal server error", type: "ai" },
      ]);
    }
  };

  const keyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleChatBot();
    }
  };

  return (
    <Container>
      <Header>
        <img
          src={images.shoppingBag}
          alt="shopping bag"
          className="header__img"
        />
        <motion.h1
          initial={{ y: "-10vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="header__title"
        >
          Chat Coop-Marktes Zürich
        </motion.h1>
      </Header>

      <Chat>
        <div className="chat__messages">
          {chatHistory.map((msg, index) => (
            <motion.div
              key={index}
              initial={{
                x: msg.type === "user" ? "-100%" : "100%",
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className={`chat__message ${
                msg.type === "user" ? "chat__user" : "chat__ai"
              }`}
            >
              {msg.type === "user" ? (
                <div className="chat__phrase">
                  <FaRegUser size={32} className="icon" />
                  <span>{msg.text}</span>
                </div>
              ) : (
                <div className="chat__phrase">
                  <RiRobot2Line size={32} className="icon" />
                  <span>{msg.text}</span>
                </div>
              )}
            </motion.div>
          ))}
           <div ref={messagesEndRef} />
        </div>

        <div className="chat__input-group">
          <input
            type="text"
            className="chat__input"
            placeholder="Womit kann ich dir helfen?..."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={keyDownHandler}
          />

          <button className="chat__send-btn" onClick={handleChatBot}>
            Senden
          </button>
        </div>
      </Chat>
    </Container>
  );
};

export default BusinessChat;
