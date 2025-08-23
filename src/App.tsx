import { Footer } from "./components";
import { Landing } from "./pages";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="font-body min-h-screen flex flex-col justify-between">
      <BrowserRouter>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
