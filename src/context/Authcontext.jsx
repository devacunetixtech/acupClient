import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, postRequest } from "../utils/services";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigateTo = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);


  const [registerError, setRegisterError] = useState(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
  });

  const [loginError, setLoginError] = useState(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const user = localStorage.getItem("UserDet")
    setUser(JSON.parse(user));
  }, []);

  console.log("registerInfo", registerInfo);
  console.log("loginInfo", loginInfo);

  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo(info);
  }, [])
  const updateLoginInfo = useCallback((info) => {
    setLoginInfo(info);
  }, [])

  const registerUser = useCallback(async (e) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    setRegisterError(null);

    const response = await postRequest(
      `${baseUrl}/user/register`, JSON.stringify(registerInfo)
    );

    setIsRegisterLoading(false)
    if (response.error) {
      return setRegisterError(response);
    }

    localStorage.setItem("UserDet", JSON.stringify(response))
    setUser(response)
    navigateTo('/signin')
  }, [registerInfo]);

  const loginUser = useCallback(async (e) => {
    e.preventDefault();
    setIsLoginLoading(true)
    setLoginError(null)

    const response = await postRequest(
      `${baseUrl}/user/login`, JSON.stringify(loginInfo)
    );

    setIsLoginLoading(false)
    if (response.error) {
      return setLoginError(response);
    }

    localStorage.setItem("UserDet", JSON.stringify(response))
    localStorage.setItem("token", response.user.token); // <-- add this    
    setUser(response)
    navigateTo('/dashboard')
  }, [loginInfo]);


  const getDashboardData = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${baseUrl}/user/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data; // { message, user }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
      throw error;
    }
  };

  const [filter, setFilter] = useState("all");
  // const getTransactions = async (filter) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) throw new Error("No token found");

  //     const response = await axios.get(`${baseUrl}/user/transaction/history?filter=${filter}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     return response.data.transactions;
  //   } catch (error) {
  //     console.error("Error fetching transactions:", error.message);
  //     if (error.response?.status === 401) {
  //       window.location.href = "/dashboard";
  //     }
  //     throw error;
  //   }
  // };
const getTransactions = async (filter = "all", limit = 0, userId = null) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const response = await axios.get(`${baseUrl}/user/transaction/history`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { filter, limit, userId }, // Include userId in params if provided
    });
    return {
      transactions: response.data.transactions,
      totalCount: response.data.totalCount,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      window.location.href = "/dashboard";
    }
    throw error;
  }
};

    const [pin, setPinState] = useState("");
  const setPinApi = async (pin) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login again");
      const response = await axios.post(
        `${baseUrl}/user/set/setpin`,
        { tranPin: pin }, // Match backend expectation
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Set PIN error:", error.response?.data || error.message);
      throw error;
    }
  };

  
const makeTransfer = async (amount, toAccountNumber, tranDescription, tranPin) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found, please login again");

    const response = await axios.post(
      `${baseUrl}/user/transaction`,
      {
        amount,
        toAccountNumber,
        tranDescription,
        tranPin,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Transfer error:", error.response?.data || error.message);
    throw error;
  }
};

  const fetchRecipientName = async (accountNumber) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login again");
      const response = await axios.post(
        `${baseUrl}/user/recipient`,
        { accountNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.name;
    } catch (error) {
      console.error("Fetch recipient name error:", error.response?.data || error.message);
      throw error;
    }
  };

  const logoutUser = useCallback(() => {
    localStorage.removeItem("UserDet");
    localStorage.removeItem("token");
    setUser(null);
    navigateTo("/signin"); // redirect user to signin page

  }, []);



  return (
    <AuthContext.Provider
      value={{
        user,
        registerInfo,
        updateRegisterInfo,
        registerUser,
        registerError,
        isRegisterLoading,
        logoutUser,
        loginUser,
        loginInfo,
        updateLoginInfo,
        loginError,
        isLoginLoading,
        makeTransfer,
        getDashboardData,
        getTransactions,
        filter,
        setFilter,
        pin, setUser, setPin: setPinState, setPinApi, fetchRecipientName
      }}>
      {children}
    </AuthContext.Provider>
  );
};

