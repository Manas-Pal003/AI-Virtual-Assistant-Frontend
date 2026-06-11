import React from "react";
import { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const UserContext = createContext();

function UserContextProvider({ children }) {
    const serverUrl = "http://localhost:8000/api";
    const [userData, setUserData] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const handleCurrentUser = async () => {
    try {
      const response = await axiosClient.get("/users/me");
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching current user", error);
      setUserData(null);
    } finally {
      setLoadingUser(false);
    }
  };
    useEffect(() => {
        handleCurrentUser();
    }, []);


    const value = {
    serverUrl,
    userData,
    setUserData,
    loadingUser,
    handleCurrentUser,
  };
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}
export {UserContext, UserContextProvider};