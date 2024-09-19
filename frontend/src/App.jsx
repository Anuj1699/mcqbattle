import { Route, Routes } from "react-router-dom";
import PopUp from "./PopUp";
import Login from "./Login";
import Register from "./Register";
import {ProtectedRoute, GuestRoute } from "./AuthProvider";
import "./index.css";

function App() {
  return (
      <Routes>
        <Route element={<GuestRoute redirectTo="/game" />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute redirectTo="/" />}>
          <Route path="/game" element={<PopUp />} />
        </Route>
      </Routes>
  );
}

export default App;
