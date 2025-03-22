// API service for interacting with the backend

// Define the base URL for API calls
const API_BASE_URL = "http://localhost:3000/api";

// Get current user from localStorage
export const getCurrentUser = () => {
  const userString = localStorage.getItem("currentUser");
  if (!userString) return null;

  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Set current user to localStorage
export const setCurrentUser = (user: any) => {
  localStorage.setItem("currentUser", JSON.stringify(user));
};

// Remove current user from localStorage
export const clearCurrentUser = () => {
  localStorage.removeItem("currentUser");
};

/**
 * Login as mentor
 */
export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role: "mentor" }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Store user data in localStorage
    if (data.success && data.user) {
      setCurrentUser(data.user);
    }

    return data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

/**
 * Get a list of all students
 */
export const getStudents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/students`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

/**
 * Create a new game
 */
export const createGame = async (gameData: {
  gameType: string;
  sourceType: string;
  content: string;
  title?: string;
  menteeIds?: string[];
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

/**
 * Upload a PDF file
 */
export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Get all created games
 */
export const getGames = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/games`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};
