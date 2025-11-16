import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ArticlesPage from "./pages/ArticlesPage";
import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<ArticlesPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </div>
  );
}

export default App;
