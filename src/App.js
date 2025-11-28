import './App.css';
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import ArticlesPage from "./pages/ArticlesPage";
import AppLayout from "./components/layout/AppLayout";
import ArticleDetailsPage from "./pages/ArticleDetailsPage";
import ArticleToastContainer from "./components/common/ArticleToastContainer";
import {useCallback, useEffect, useState} from "react";
import {getSignalRConnection} from "./signalrConnection";

function AppInner() {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const showArticleUpdatedToast = useCallback((articleId, title) => {
      console.log(`мы получили идентификатор обновленной статьи ${articleId}`);
    setToasts((prev) => [
      ...prev,
      {
        id: articleId,
        title: title || "Данные статьи были обновлены",
      },
    ]);
  }, []);

  const handleToastClick = useCallback(
      (articleId) => {
        navigate(`/article/${articleId}`);
      },
      [navigate]
  );

  const handleToastClose = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

    useEffect(() => {
        const connection = getSignalRConnection();

        let started = false;

        const start = async () => {
            if (started) return;
            try {
                await connection.start();
                started = true;
                console.log("SignalR connected");
            } catch (err) {
                console.error("SignalR connection error", err);
                setTimeout(start, 3000);
            }
        };

        const handler = (payload) => {
            console.log(`мы получили идентификатор обновленной статьи ${payload.articleProviderId}`);
            showArticleUpdatedToast(payload.articleProviderId, payload.title);
        };

        connection.on("NotifyArticleUpdated", handler);
        start();

        return () => {
            connection.off("NotifyArticleUpdated", handler);
        };
    }, [showArticleUpdatedToast]);

  return (
      <>
        <AppLayout>
          <Routes>
            <Route path="/" element={<ArticlesPage />} />
            <Route path="/article/:id" element={<ArticleDetailsPage />} />
          </Routes>
        </AppLayout>

        <ArticleToastContainer
            toasts={toasts}
            onToastClick={handleToastClick}
            onToastClose={handleToastClose}
        />
      </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </div>
  );
}

export default App;
