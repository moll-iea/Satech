import React from "react";
import "./styles/globals.css";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NewsAdmin from "./components/NewsAdmin";
import ExhibitionAdmin from "./components/ExhibitionAdmin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/news" element={<NewsAdmin />} />
      <Route path="/admin/exhibitions" element={<ExhibitionAdmin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
