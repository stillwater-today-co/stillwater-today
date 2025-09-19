import React, { useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "../firebase/firestore";

export default function Home() {
  const messageRef = useRef<HTMLInputElement>(null); // specify the input type

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Safely check if messageRef.current exists
    if (!messageRef.current) return;

    const message = messageRef.current.value;
    if (!message) return;

    try {
      await addDoc(collection(firestore, "messages"), {
        text: message,
        createdAt: new Date(),
      });
      console.log("Message added!");
      messageRef.current.value = ""; // clear input after submit
    } catch (error) {
      console.error("Error adding message: ", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter message</label>
        <input type="text" ref={messageRef} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
