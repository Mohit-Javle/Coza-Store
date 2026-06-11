import React, { createContext, useContext, useState } from 'react';
import { users } from '../data/users';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // We can default to logged out (null) or a mock logged in user for testing ease
  // Let's default to a logged out state but allow quick mock login in the UI.
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (email, password) => {
    // Fake login: find a user by email/username or use u1 as default
    // In our user database, users have usernames. Let's match by username or just take the first user.
    const cleanEmail = email.toLowerCase().trim();
    // Find user by matching username (e.g. "deadstock.dev" for deadstock.dev@thrift.in)
    const usernamePart = cleanEmail.split('@')[0];
    const foundUser = users.find(u => u.username === usernamePart) || users[0];
    
    setCurrentUser(foundUser);
    setIsLoggedIn(true);
    return foundUser;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const signup = (username, email, password) => {
    // Fake signup: create a new mock user
    const newId = `u${users.length + 1}`;
    const newUser = {
      id: newId,
      username: username || "anonymous.fits",
      name: username ? username.toUpperCase() : "Anonymous",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?q=80&w=1200&auto=format&fit=crop",
      bio: "Joined the chaos ⚡ | Thrift enthusiast",
      location: "India",
      listedItems: [],
      soldItems: [],
      purchasedItems: []
    };
    
    // Add to local database array dynamically
    users.push(newUser);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    return newUser;
  };

  const changeCurrentUserProfile = (updatedDetails) => {
    if (currentUser) {
      const updated = { ...currentUser, ...updatedDetails };
      setCurrentUser(updated);
      // Also update in global users array
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx] = updated;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn, login, logout, signup, changeCurrentUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
