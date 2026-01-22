import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RiRobot2Line } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa6";
import { FaQuestionCircle } from "react-icons/fa";
import images from "../../assets/images";
import { Chat, Container, Questions, Header, HeaderWrapper } from "./styles";
import { businessChatService } from "../../services/businessChatService";
import Loader from "../common/loader/Loader";
import { toast } from "sonner";

interface ChatMessage {
  text: string;
  type: "user" | "ai";
}

const instructions = [
  {
    text: "Produktverfügbarkeit: „Welche Früchte gibt es bei Coop?“",
  },
  {
    text: "Produktstandort: „Wo finde ich die Milch?“",
  },
  {
    text: "Öffnungszeiten: „Wann schließt Coop?“",
  },
  {
    text: "Kontaktinformationen: „Wie lautet die Telefonnummer von Coop?“",
  },
];

const BusinessChat = () => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [chatText, setChatText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [click, setClick] = useState(false);

  const hanfleClick = () => {
    setClick((prev) => !prev);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleChatBot = async () => {
    if (!chatText.trim()) {
      toast("Please enter a message");
      return;
    }

    setChatHistory((prev) => [
      ...prev,
      {
        text: chatText,
        type: "user",
      },
    ]);
    setLoading(true);

    try {
      const response = await businessChatService(chatText);
      const reply = response?.reply || "No response from AI";

      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "loading..."),
        { text: reply, type: "ai" },
      ]);

      setChatText("");
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "loading..."),
        { text: "Internal server error", type: "ai" },
      ]);
    } finally {
      setLoading(false);
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
        <HeaderWrapper>
          <img
            src={images.shoppingBag}
            alt="shopping bag"
            className={`header__img`}
          />
          <Questions
            as={motion.div}
            initial={{ x: "-20rem", opacity: 0 }}
            animate={{ x: click ? 0 : "-20rem", opacity: click ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <span>Stelle Fragen zu Lebensmitteln bei Coop Zürich!</span>
            {instructions.map((instruction, index) => (
              <div key={index} className="question">
                <p>- {instruction.text}</p>
              </div>
            ))}
          </Questions>
        </HeaderWrapper>
        <motion.h1
          initial={{ y: "-10vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="header__title"
        >
          IA Assistent Coop-Marktes Zürich
        </motion.h1>
      </Header>

      <Chat>
        <FaQuestionCircle onClick={hanfleClick} className="icon-m" />
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

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="chat__loading"
            >
              <Loader />
            </motion.div>
          )}
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
