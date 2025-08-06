import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthenticatedApp } from "./AuthenticatedApp";
import { useStore } from "./hook/useStore";
import { UnauthenticatedApp } from "./UnauthenticatedApp";

const App = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
            },
        },
    });
    const user = useStore((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user]);

    return (
        <>
            <div className="background-image"></div>
            <QueryClientProvider client={queryClient}>
                {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
            </QueryClientProvider>
        </>
    );
};

export default App;
