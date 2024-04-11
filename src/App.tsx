import React from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "../src/routes/home/home";
import Garage from "../src/routes/garage/garage"
import "./app.style.css"
function App() {
  return (
     <Routes>
        <Route path="/" element={<Home/>}/>
         <Route path="/garage" element={<Garage/>}/>
     </Routes>
  )
      ;
}

export default App;
