import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ArticlesPage from "./pages/ArticlesPage";
import AppLayout from "./components/layout/AppLayout";
import ArticleDetailsPage from "./pages/ArticleDetailsPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<ArticlesPage />} />
            <Route path="/article/:id" element={<ArticleDetailsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </div>
  );
}

export default App;
