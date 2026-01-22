import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMessages, IMessage, narrate } from "../../services/messageService";
import {
  getRandomSize,
  getRandomPosition,
  getRandomBgGrayColor,
} from "../../utils";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { RiRobot2Line } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa6";
import Loader from "../common/loader/Loader";
import Loader1 from "../common/loader/Loader1";
import { toast } from "sonner";
import assets from "../../assets";

const BOX_COUNT = 10;

interface ChatMessage {
  id: string;
  text: string;
  type: "user" | "ai";
  audioUrl?: string;
  voice?: string;
}

const textVoices = [
  { name: "alloy" },
  { name: "echo" },
  { name: "fable" },
  { name: "onyx" },
  { name: "nova" },
  { name: "shimmer" },
  { name: "ash" },
  { name: "coral" },
  { name: "sage" },
];

const makeId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const TextNarrator = () => {
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [targetVoice, setTargetVoice] = useState("alloy");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showVoice, setShowVoice] = useState(false);
  const [boxes, setBoxes] = useState(() =>
    Array.from({ length: BOX_COUNT }).map(() => ({
      size: getRandomSize(),
      position: getRandomPosition(100),
      backgroundColor: getRandomBgGrayColor(),
    }))
  );

  console.log("Boxes:", boxes);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShowVoice = () => {
    setShowVoice((prev) => !prev);
  };

  const handleSelectLang = (lang: string) => {
    setTargetVoice(lang);
    setShowVoice(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    const fetchMessages = async () => {
      setShowLoader(true);

      try {
        const messages = await getMessages();
        if (Array.isArray(messages)) {
          setMessages(messages);
        } else {
          console.warn("The API response is not an array");
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setShowLoader(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBoxes((prevBoxes) =>
        prevBoxes.map(() => ({
          size: getRandomSize(),
          position: getRandomPosition(100),
          backgroundColor: getRandomBgGrayColor(),
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Limpieza de blob URLs al desmontar (para evitar fugas de memoria)
  useEffect(() => {
    return () => {
      chatHistory.forEach((m) => {
        if (m.audioUrl?.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(m.audioUrl);
          } catch {}
        }
      });
    };
  }, [chatHistory]);

  const handleTextNarration = async () => {
    if (!chatText.trim()) {
      toast("Please enter a message");
      return;
    }

    // 1) Añade el mensaje del usuario (con id)
    const userId = makeId();
    setChatHistory((prev) => [
      ...prev,
      { id: userId, text: chatText, type: "user" },
    ]);

    setLoading(true);

    try {
      // 2) Pide la narración (Blob URL string)
      const audioUrl = await narrate(chatText, targetVoice);

      // 3) Añade el bubble de IA con su propio audioUrl
      const aiId = makeId();
      setChatHistory((prev) => [
        ...prev,
        {
          id: aiId,
          text: `Narration (${targetVoice})`,
          type: "ai",
          audioUrl,
          voice: targetVoice,
        },
      ]);

      setChatText("");
    } catch (error) {
      console.error("Error narrating text:", error);
      setChatHistory((prev) => [
        ...prev,
        { id: makeId(), text: "Error narrating text", type: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTextNarration();
    }
  };

  return (
    <div className="container">
      <header className="chat__header">
        <motion.div
          initial={{ x: "-10vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            delay: 0.2,
            duration: 3,
            bounce: 0.5,
            damping: 10,
          }}
          className="header__icon-container"
        >
          <img src={assets.audio} alt="Audio Icon" className="header__icon" />
        </motion.div>

        <motion.h2
          initial={{ y: "-10vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="header__title"
        >
          Text Narrator
        </motion.h2>
      </header>

      <section className="chat">
        <div className="chat__messages">
          {chatHistory.map((msg, i) => (
            <motion.div
              key={msg.id}
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
                  {/* Mantengo tu estructura/estilos: audio dentro del bubble de IA */}
                  {msg.audioUrl ? (
                    <audio
                      controls
                      src={msg.audioUrl}
                      className="mt-4 w-full"
                      preload="none"
                    />
                  ) : (
                    <span>{msg.text}</span>
                  )}
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
            placeholder="Which text do you want to narrate?"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="chat__inputs">
            <div className="choose-lang">
              <span onClick={handleShowVoice} className="choose-lang__btn">
                {textVoices.find((l) => l.name === targetVoice)?.name}
                {showVoice ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </span>

              <AnimatePresence>
                {showVoice && (
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    className="choose-lang__list"
                  >
                    {textVoices.map((lang) => (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        key={lang.name}
                        onClick={() => handleSelectLang(lang.name)}
                        className="choose-lang__option"
                      >
                        {lang.name}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={handleTextNarration} className="chat__btn">
              Narrate
            </button>
          </div>
        </div>
      </section>

      <section className="chat__instructions">
        <h2 className="instructions__title">Instructions:</h2>
        {showLoader ? (
          <div className="chat__loading">
            <Loader1 />
          </div>
        ) : messages.length > 0 ? (
          <ul className="instructions__list">
            {messages.map((message, index) => (
              <li key={index} className="instructions__item">
                {message.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="instructions__empty">No instructions available.</p>
        )}
      </section>
    </div>
  );
};

export default TextNarrator;
