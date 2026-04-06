import "./App.css";
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";

import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailsPage from "./pages/ArticleDetailsPage";
import AuthorProfilePage from "./pages/AuthorProfilePage";
import AuthorsPage from "./pages/AuthorsPage";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import UserProfilePage from "./pages/UserProfilePage";

import AppLayout from "./components/layout/AppLayout";
import ArticleToastContainer from "./components/common/ArticleToastContainer";
import ErrorToastContainer from "./components/common/ErrorToastContainer";
import {setToastHandler} from "./toast/toastBus";
import {getSignalRConnection} from "./signalrConnection";

import RequireAuth from "./auth/RequireAuth";
import {AuthProvider} from "./auth/AuthProvider";
import AdminClaimsPage from "./pages/AdminClaimsPage";
import RequireRole from "./auth/RequireRole";

function AppInner() {
    const [toasts, setToasts] = useState([]);
    const [errorToasts, setErrorToasts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setToastHandler((toast) => {
            const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
            setErrorToasts((prev) => [...prev, {id, ...toast}]);

            window.setTimeout(() => {
                setErrorToasts((prev) => prev.filter((x) => x.id !== id));
            }, 4000);
        });
    }, []);

    const closeErrorToast = useCallback((id) => {
        setErrorToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showArticleUpdatedToast = useCallback((articleId, title) => {
        setToasts((prev) => [
            ...prev,
            {id: articleId, title: title || "Данные статьи были обновлены"},
        ]);
    }, []);

    const handleToastClick = useCallback(
        (articleId) => navigate(`/article/${articleId}`),
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
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>

                <Route element={<AppLayout/>}>
                    <Route path="/" element={<ArticlesPage/>}/>
                    <Route path="/article/:id" element={<ArticleDetailsPage/>}/>
                    <Route path="/author/:id" element={<AuthorProfilePage/>}/>
                    <Route path="/authors" element={<AuthorsPage/>}/>

                    <Route element={<RequireAuth/>}>
                        <Route path="/me" element={<UserProfilePage/>}/>
                    </Route>

                    <Route element={<RequireRole roles={["Admin"]}/>}>
                        <Route path="/admin/claims" element={<AdminClaimsPage/>}/>
                    </Route>

                    <Route path="*" element={<div className="p-6">Страница не найдена</div>}/>
                </Route>
            </Routes>

            <ArticleToastContainer toasts={toasts} onToastClick={handleToastClick} onToastClose={handleToastClose}/>
            <ErrorToastContainer toasts={errorToasts} onClose={closeErrorToast}/>
        </>
    );
}

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <AuthProvider>
                    <AppInner/>
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
