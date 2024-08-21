import { useRouter, useSegments } from "expo-router";
import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import VerifyScreen from "./../app/verify";

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  register: () => {},
  resetPassword: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);

      if (response?.user) {
        const docRef = doc(db, "users", response.user.uid);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(docSnap.data());
          setIsAuthenticated(true);
          return {
            success: true,
            message: "Login successful",
          };
        }
      }
    } catch (error) {
      let msg = error.message;
      console.log(msg);

      if (msg === "Firebase: Error (auth/invalid-email).") {
        msg = "Invalid email";
      } else if (msg === "Firebase: Error (auth/user-not-found).") {
        msg = "User not found";
      } else if (msg === "Firebase: Error (auth/invalid-credential).") {
        msg = "Invalid credentials";
      } else {
        msg = "Something went wrong";
      }
      return {
        success: false,
        message: msg,
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);

      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (response?.user) {
        await setDoc(doc(db, "users", response.user.uid), {
          name,
          email,
          timestamp: serverTimestamp(),
          uid: response.user.uid,
        });

        return {
          success: true,
        };
      }
    } catch (error) {
      let msg = error.message;
      console.log(msg);

      if (msg === "Firebase: Error (auth/email-already-in-use).") {
        msg = "Email already in use";
      }
      if (msg === "Firebase: Error (auth/invalid-email).") {
        msg = "Invalid email";
      } else if (msg === "Firebase: Error (auth/weak-password).") {
        msg = "Password must be at least 6 characters";
      } else {
        msg = "Something went wrong";
      }

      return {
        success: false,
        message: msg,
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await sendPasswordResetEmail(auth, email);
      console.log(response);

      return {
        success: true,
        message: "Check your email for reset instructions",
      };
    } catch (error) {
      let msg = error.message;
      console.log(msg);

      if (msg.includes("auth/invalid-email")) {
        msg = "Invalid email address.";
      } else if (msg.includes("auth/user-not-found")) {
        msg = "No user found with this email address.";
      } else {
        msg = "Something went wrong. Please try again.";
      }

      return {
        success: false,
        message: msg,
      };
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const id = user?.uid;

        const docRef = doc(db, "users", id);

        const userData = await getDoc(docRef);

        if (userData.exists()) {
          setUser({
            uid: id,
            ...userData.data(),
          });
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return unsub;
  }, []);

  useEffect(() => {
    const inApp = segments[0] === "(tabs)";

    if (!inApp && isAuthenticated) {
      router.push("(tabs)");
    } else if (inApp && !isAuthenticated) {
      router.push("step1");
    }
  }, [segments, isAuthenticated, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        login,
        logout,
        register,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
