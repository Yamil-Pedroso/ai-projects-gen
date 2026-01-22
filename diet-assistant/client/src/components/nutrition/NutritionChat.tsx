/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback } from "react";
import assets from "../../assets";
import { motion } from "framer-motion";
import {
  getMessages,
  IMessage,
  sendNutritionMessage,
  INutritionResponse,
  getLastNutritionPlan,
} from "../../services/messageService";
import {
  getRandomSize,
  getRandomPosition,
  getRandomBgGrayColor,
} from "../../utils";
import { RiRobot2Line } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa6";
import Loader from "../common/loader/Loader";
import Loader1 from "../common/loader/Loader1";
import { toast } from "sonner";
import PlanModal from "./PlanModal"; // ⬅️ usas tu componente externo

const BOX_COUNT = 10;

interface ChatMessage {
  text: string;
  type: "user" | "ai";
}

interface Box {
  size: number;
  position: { top: number; left: number };
  backgroundColor: string;
}

const DIET_OPTIONS = [
  "omnivore",
  "vegetarian",
  "vegan",
  "low-carb",
  "keto",
  "pescatarian",
];

const NutritionChat = () => {
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [dietPrefs, setDietPrefs] = useState("omnivore");
  const [showPrefs, setShowPrefs] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [boxes, setBoxes] = useState<Box[]>(
    Array.from({ length: BOX_COUNT }).map(() => ({
      size: getRandomSize(),
      position: (() => {
        const pos = getRandomPosition(100);
        if ("x" in pos && "y" in pos) {
          return { top: pos.y, left: pos.x };
        }
        return pos;
      })(),
      backgroundColor: getRandomBgGrayColor(),
    }))
  );

  // Modal & plan
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  // userId persistente
  const [userId] = useState(() => {
    const key = "nutrition_user_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const uid = `u_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, uid);
    return uid;
  });

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  // Carga plan guardado (no abre modal automáticamente)
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await getLastNutritionPlan(userId);
        if (data.nutritionPlan) {
          setPlan(data.nutritionPlan);
        }
      } catch {
        /* ignore */
      }
    };
    fetchPlan();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Carga de instrucciones
  useEffect(() => {
    const fetchMessages = async () => {
      setShowLoader(true);
      try {
        const data = await getMessages();
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setShowLoader(false);
      }
    };
    fetchMessages();
  }, []);

  // Animación cajas (decorativo)
  useEffect(() => {
    const interval = setInterval(() => {
      setBoxes((prev) =>
        prev.map(() => {
          const pos = getRandomPosition(100);
          if ("x" in pos && "y" in pos) {
            return {
              size: getRandomSize(),
              position: { top: pos.y, left: pos.x },
              backgroundColor: getRandomBgGrayColor(),
            };
          }
          return {
            size: getRandomSize(),
            position: pos,
            backgroundColor: getRandomBgGrayColor(),
          };
        })
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Al montar, pide primera pregunta
  useEffect(() => {
    (async () => {
      const data = await sendNutritionMessage(userId, "reset");
      if (data.iaQuestion) {
        setChatHistory([{ text: data.iaQuestion, type: "ai" }]);
      }
    })();
  }, [userId]);

  const handleAskPlan = async () => {
    if (!chatText.trim()) {
      toast("Please type your answer (or 'plan' to get your diet).");
      return;
    }

    // Mensaje del usuario
    setChatHistory((prev) => [...prev, { text: chatText, type: "user" }]);
    setLoading(true);

    // Burbuja de carga
    setChatHistory((prev) => [...prev, { text: "loading...", type: "ai" }]);

    try {
      const data: INutritionResponse = await sendNutritionMessage(
        userId,
        chatText
      );

      // Quita el "loading..."
      setChatHistory((prev) => prev.filter((m) => m.text !== "loading..."));

      if (data.error) {
        setChatHistory((prev) => [
          ...prev,
          { text: "Server error. Please try again.", type: "ai" },
        ]);
      } else if (data.iaQuestion) {
        setChatHistory((prev) => [
          ...prev,
          { text: data.iaQuestion!, type: "ai" },
        ]);
      } else if (data.nutritionPlan) {
        // Capturamos plan y abrimos modal
        const raw = data.nutritionPlan;
        let parsed = raw;
        if (typeof raw === "string") {
          try {
            parsed = JSON.parse(raw);
          } catch {
            /* keep string */
          }
        }
        setPlan(parsed);
        setPlanModalOpen(true);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { text: "No response. Please try again.", type: "ai" },
        ]);
      }

      setChatText("");
    } catch (error) {
      console.error("Nutrition chat error:", error);
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "loading..."),
        { text: "Error generating response.", type: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAskPlan();
  };

  // Copy JSON del modal (memoizado para que no cambie la prop cada render)
  const handleCopyJSON = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
      toast("Plan JSON copied to clipboard.");
    } catch {
      toast("Failed to copy.");
    }
  }, [plan]);

  return (
    <div className="container relative overflow-hidden">
      {/* Decorative animated boxes */}
      <div className="absolute inset-0 pointer-events-none">
        {boxes.map((box, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 0.8, delay: i * 0.02 }}
            style={{
              position: "absolute",
              top: `${box.position.top}%`,
              left: `${box.position.left}%`,
              width: box.size,
              height: box.size,
              backgroundColor: box.backgroundColor,
              borderRadius: 12,
              filter: "blur(2px)",
            }}
          />
        ))}
      </div>

      <header className="chat__header relative z-10">
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
          <img src={assets.diet} className="header__icon" alt="Diet Icon" />
        </motion.div>

        <motion.h2
          initial={{ y: "-10vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="header__title"
        >
          Diet Week Assistant
        </motion.h2>
      </header>

      <section className="chat relative z-10">
        {/* Diet preferences selector */}
        <div className="chat__prefs">
          <button
            className="chat__btn chat__btn--secondary"
            onClick={() => setShowPrefs((s) => !s)}
            type="button"
          >
            Diet preference: {dietPrefs}
          </button>
          {showPrefs && (
            <ul className="chat__prefs-list">
              {DIET_OPTIONS.map((opt) => (
                <li key={opt}>
                  <button
                    className={`chat__prefs-item ${
                      opt === dietPrefs ? "active" : ""
                    }`}
                    onClick={() => {
                      setDietPrefs(opt);
                      setShowPrefs(false);
                    }}
                    type="button"
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="chat__messages" ref={messagesContainerRef}>
          {chatHistory.map((msg, index) => (
            <motion.div
              key={index}
              initial={{
                x: msg.type === "user" ? "-100%" : "100%",
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.4 }}
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
            placeholder="Answer here (or type 'plan' to get your diet)"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleAskPlan} className="chat__btn" type="button">
            Generate Plan
          </button>
        </div>
      </section>

      {/* Modal del plan (tu componente externo) */}
      <PlanModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        plan={plan}
        onCopy={handleCopyJSON}
      />

      <section className="chat__instructions relative z-10">
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

export default NutritionChat;
