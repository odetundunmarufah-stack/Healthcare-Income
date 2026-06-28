import { initializeApp, getApps }                    from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const FIREBASE_CONFIG = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

let _db = null;
const getDb = () => {
  if (!_db) {
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    _db = getFirestore(app);
  }
  return _db;
};

export const generateAssessmentId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map(b => chars[b % chars.length])
    .join("");
};

export const saveAssessment = async ({ id, email, name, answers, score, archetype, topPath }) => {
  try {
    const now = new Date().toISOString();
    await setDoc(doc(getDb(), "assessments", id), {
      id, email, name, answers, score, archetype, topPath,
      selectedPaths: [],
      paid:          false,
      paidRef:       null,
      reportKey:     null,
      createdAt:     now,
      updatedAt:     now,
    });
    console.log(`[YCC FLOW] db.saveAssessment OK`, { id });
    return true;
  } catch (e) {
    console.error(`[YCC FLOW] db.saveAssessment FAILED`, e);
    return false;
  }
};

export const loadAssessment = async (id) => {
  try {
    const snap = await getDoc(doc(getDb(), "assessments", id));
    if (!snap.exists()) {
      console.log(`[YCC FLOW] db.loadAssessment — not found`, { id });
      return null;
    }
    console.log(`[YCC FLOW] db.loadAssessment OK`, { id });
    return snap.data();
  } catch (e) {
    console.error(`[YCC FLOW] db.loadAssessment FAILED`, e);
    return null;
  }
};

export const markAssessmentPaid = async (id, { paidRef, selectedPaths }) => {
  if (!id) return false;
  try {
    await updateDoc(doc(getDb(), "assessments", id), {
      paid: true,
      paidRef,
      selectedPaths: selectedPaths || [],
      updatedAt: new Date().toISOString(),
    });
    console.log(`[YCC FLOW] db.markAssessmentPaid OK`, { id, paidRef });
    return true;
  } catch (e) {
    console.error(`[YCC FLOW] db.markAssessmentPaid FAILED`, e);
    return false;
  }
};

export const saveReportKey = async (id, reportKey) => {
  if (!id) return false;
  try {
    await updateDoc(doc(getDb(), "assessments", id), {
      reportKey,
      updatedAt: new Date().toISOString(),
    });
    console.log(`[YCC FLOW] db.saveReportKey OK`, { id, reportKey });
    return true;
  } catch (e) {
    console.error(`[YCC FLOW] db.saveReportKey FAILED`, e);
    return false;
  }
};