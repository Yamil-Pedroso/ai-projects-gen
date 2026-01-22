import { useEffect, useState, useRef } from "react";
import { BsTranslate } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMessages,
  IMessage,
  translate,
} from "../../services/messageService";
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

const BOX_COUNT = 10;

interface ChatMessage {
  text: string;
  type: "user" | "ai";
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
];

const Translator = () => {
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  //const [translatedText, setTranslatedText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showLang, setShowLang] = useState(false);
  const [boxes, setBoxes] = useState(() =>
    Array.from({ length: BOX_COUNT }).map(() => ({
      size: getRandomSize(),
      position: getRandomPosition(100),
      backgroundColor: getRandomBgGrayColor(),
    }))
  );

  console.log("boxes", boxes);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShowLang = () => {
    setShowLang((prev) => !prev);
  };

  const handleSelectLang = (lang: string) => {
    setTargetLang(lang);
    setShowLang(false);
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

  const handleTranslate = async () => {
    if (!chatText.trim()) {
      toast("Please enter a message");
      return;
    }

    setChatHistory((prev) => [...prev, { text: chatText, type: "user" }]);
    setLoading(true);

    try {
      const response = await translate(chatText, targetLang);
      const translatedText = response?.translatedText || "Translation failed";

      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "loading..."),
        { text: translatedText, type: "ai" },
      ]);

      setChatText("");
    } catch (error) {
      console.error("Translation error:", error);
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "loading..."),
        { text: "Error translating text", type: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTranslate();
    }
  };

  // use the Loader component

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
          <BsTranslate className="header__icon" />
        </motion.div>

        <motion.h2
          initial={{ y: "-10vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="header__title"
        >
          Translate App with OPENAI
        </motion.h2>
      </header>

      <section className="chat">
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
            placeholder="Type a message..."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="chat__inputs">
            {/*<select
              className="chat__select"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="zh">Chinese</option>
            </select>*/}

            <div className="choose-lang">
              <span onClick={handleShowLang} className="choose-lang__btn">
                {languages.find((l) => l.code === targetLang)?.name}{" "}
                {showLang ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </span>

              <AnimatePresence>
                {showLang && (
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }} // Inicialmente colapsado desde abajo
                    animate={{ scaleY: 1, opacity: 1 }} // Crece hacia arriba
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{
                      type: "spring", // Usa física de resorte
                      stiffness: 200, // Controla la fuerza del resorte (mayor = más rebote)
                      damping: 15, // Controla la resistencia del rebote (menor = más oscilación)
                    }}
                    className="choose-lang__list"
                  >
                    {languages.map((lang) => (
                      <motion.span
                        initial={{ opacity: 0 }} // Texto oculto al inicio
                        animate={{ opacity: 1 }} // Aparece cuando la caja ha crecido
                        exit={{ opacity: 0 }} // Se desvanece al cerrar
                        transition={{ delay: 0.2, duration: 0.3 }}
                        key={lang.code}
                        onClick={() => handleSelectLang(lang.code)}
                        className="choose-lang__option"
                      >
                        {lang.name}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={handleTranslate} className="chat__btn">
              Translate
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

export default Translator;
