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
    const userId = useStore((state) => state.userId);
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (!userId) navigate("/login");
    // }, [userId]);

    return (
        <>
            <div className="background-image"></div>
            <QueryClientProvider client={queryClient}>
                {/* {userId ? <AuthenticatedApp /> : <UnauthenticatedApp />} */}
                <AuthenticatedApp />
            </QueryClientProvider>
        </>
    );
};

export default App;
