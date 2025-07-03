import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Marketplace from "./components/Marketplace";
import Home from "./components/Home";
import ListProducts from "./components/ListProducts";
import MyProducts from "./components/MyProducts";
import Leaderboard from "./components/Leaderboard";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/list" element={<ListProducts />} />
          <Route path="/my" element={<MyProducts />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
