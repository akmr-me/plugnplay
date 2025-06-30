import { useCallback } from "react";
import { useAuthActions, useNotificationActions } from "../stores";

export const useAuth = () => {
  const { login, logout, updateUser, clearError } = useAuthActions();
  const { addNotification } = useNotificationActions();

  const handleLogin = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        await login(credentials);
        addNotification({
          type: "success",
          message: "Successfully logged in!",
        });
      } catch (error) {
        addNotification({
          type: "error",
          message: "Failed to log in. Please try again.",
        });
      }
    },
    [login, addNotification]
  );

  const handleLogout = useCallback(() => {
    logout();
    addNotification({
      type: "info",
      message: "You have been logged out.",
    });
  }, [logout, addNotification]);

  return {
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    clearError,
  };
};
