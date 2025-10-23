import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './pages/SignUp';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import Signin from './pages/Signin';
import ErrorRoute from './pages/ErrorRoute';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import { useContext } from "react";
import { AuthContext } from "./context/Authcontext";
import TransactionHistory from './pages/TransactionHistory';


function App() {
  const { user } = useContext(AuthContext) || {};

  return (
    <>
      {/* <Router> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<Signin />} />
        <Route path='/dashboard' element={user ? <Dashboard /> : <Signin/>} />
        <Route path="/profile" element={user ? <Profile /> : <Signin />}/>
        {/* <Route path="/" element={user ? <Dashboard /> : <SignUp />} /> Default route */}
        <Route path="/transfer" element={user ? <Transfer /> : <Signin />} />
        <Route path="/transactionHistory" element={user ? <TransactionHistory /> : <Signin />} />
        <Route path="*" element={<ErrorRoute />} /> {/* Catch-all route for undefined paths */}

      </Routes>
    {/* </Router> */}
    {/* <Footer></Footer> */}
    </>
  );
}

export default App;

    // <>
    {/* <Contact />
    <Products/> */}
    // </>
      // <section>
      //   <Navbar />
      //   <HeroSection />
      //   <Footer />
      // </section>