import React from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MarqueeBar from "../components/MarqueeBar";
import About from "../components/About";
import Services from "../components/Services";
import Products from "../components/Products";
import Videos from "../components/Videos";  // Add this
import Clients from "../components/Clients";
import Global from "../components/Global";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <MarqueeBar />
      <Products />
      <Services />
      <Global />
       <Videos />
      <Clients />
      <About />
      <Contact />
      <Footer />
    </>
  );
}
