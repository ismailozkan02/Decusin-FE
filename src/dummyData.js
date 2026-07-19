export const dummyUser = {
  id: "usr_demo_001",
  email: "demo@eurolink.local",
  display_name: "Demo User",
  first_name: "Demo",
  last_name: "User",
  avatar: "/favs/placeholder.svg",
  role: "admin",
  language: "3d3b6d3f-931e-4d78-be07-f025d616cafa",
  permissions: ["*"],
};

export const dummySession = {
  id: "session_demo_001",
  access: {
    token: "dummy-access-token",
    expire: Date.now() + 1000 * 60 * 60 * 24,
  },
  refresh: {
    token: "dummy-refresh-token",
  },
};

export const dummySettings = {
  system: {
    title: "Euro Link",
    online: true,
  },
  theme: {},
  timestamp: Date.now(),
};

export const dummyUnread = {
  messages: 0,
  notifications: 0,
};

export const dummyPrivacyPolicy = {
  title: "Privacy Policy",
  body: [
    "This demo application uses local dummy data only.",
    "No login, user, settings, privacy or dashboard data is requested from a server.",
    "Theme choices are saved in the browser so the template controls remain active.",
  ],
};
