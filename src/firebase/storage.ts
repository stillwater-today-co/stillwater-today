// src/firebase/storage.ts
import { getStorage } from "firebase/storage";
import { app } from "./config";

export const storage = getStorage(app);
