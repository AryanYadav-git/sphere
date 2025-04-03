import { createContext, useContext, useState, ReactNode } from "react";

type AuthContextType = {
  user: any;
  setUser: (user: any) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);

  return (
      <AuthContext.Provider value={{ user, setUser }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AppProvider");
  return context;
};

export default AppProvider;
