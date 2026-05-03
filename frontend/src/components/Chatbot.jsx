import React, { useEffect, useMemo, useRef, useState } from "react";
import { CONTACT_INFO, PRODUCT_TABS, SERVICES } from "../data/siteData";
import styles from "./Chatbot.module.css";
import pogiAvatar from "../assets/Xam.png";

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "bot",
  text: "Hi there! Nice to see you",
};

const QUICK_REPLIES = [
  "What services do you offer?",
  "Show me product categories",
  "How can I contact SA TECH?",
  "Do you support maintenance contracts?",
];

const normalize = (value) => value.toLowerCase().trim();

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const bodyRef = useRef(null);

  const catalog = useMemo(() => {
    const serviceNames = SERVICES.map((item) => item.title).slice(0, 6);
    const contactAddress = CONTACT_INFO.find((item) => item.label === "Address")?.value;
    const productCategories = PRODUCT_TABS.join(", ");

    return {
      serviceNames,
      contactAddress,
      productCategories,
    };
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const buildReply = (question) => {
    const text = normalize(question);

    if (/hi|hello|hey|good morning|good afternoon/.test(text)) {
      return "Hello! I can help you find products, services, and company information.";
    }

    if (/service|maintenance|automation|repair|fabrication/.test(text)) {
      return `SA TECH services include ${catalog.serviceNames.join(", ")}. You can view details in the Services section.`;
    }

    if (/product|inspection|x-ray|dispensing|packaging|consumables/.test(text)) {
      return `Our product categories are: ${catalog.productCategories}. Open the Products section to explore each category.`;
    }

    if (/contact|address|location|email|phone|call/.test(text)) {
      return `You can reach SA TECH through the Contact form on this page. Address: ${catalog.contactAddress || "Northgate, Muntinlupa City, Philippines"}.`;
    }

    if (/news|article|update/.test(text)) {
      return "Visit the News and Articles section for the latest announcements and updates.";
    }

    if (/exhibition|event|showcase/.test(text)) {
      return "Check the Exhibitions section to see upcoming and featured events.";
    }

    if (/quote|price|cost|proposal/.test(text)) {
      return "For pricing and proposals, please share your requirements using the Contact form. The team will respond with a tailored quote.";
    }

    if (/thanks|thank you/.test(text)) {
      return "You are welcome. If you want, I can guide you to the exact section on the page.";
    }

    return "I can help with products, services, exhibitions, news, and contact details. Try asking one of the quick questions below.";
  };

  const sendMessage = (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text,
    };

    const botMessage = {
      id: `${Date.now()}-bot`,
      role: "bot",
      text: buildReply(text),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  };

  return (
    <div className={styles.chatRoot} aria-live="polite">
      {isOpen && (
        <section className={styles.panel} aria-label="SATECH assistant">
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                <img src={pogiAvatar} alt="Sam" className={styles.avatarImage} />
              </div>
                <div className={styles.greetingSection}>
                  <h3 className={styles.greeting}>Hi there 👋</h3>
                  <p className={styles.subtext}>IM MAX</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </header>

          <div className={styles.messages} ref={bodyRef}>
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user" ? styles.userBubble : styles.botBubble
                }
              >
                {message.text}
              </article>
            ))}
          </div>

          <div className={styles.quickRow}>
            {QUICK_REPLIES.map((item) => (
              <button
                type="button"
                key={item}
                className={styles.quickButton}
                onClick={() => sendMessage(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <form
            className={styles.inputRow}
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              className={styles.input}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your question"
              aria-label="Type your message"
            />
            <button type="submit" className={styles.sendButton}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`${styles.launcher} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Open chat"
      >
        <svg
          className={styles.chatIcon}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12h-8v-2h8v2zm0-3h-8V9h8v2zm0-3H6V6h12v2z" />
        </svg>
      </button>
    </div>
  );
}