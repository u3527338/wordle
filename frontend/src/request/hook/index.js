import { useMutation, useQuery } from "@tanstack/react-query";
import { getUser, login, registerNewUser, runGuess } from "../api";

/* auth */
const useRegisterMutation = () => {
    const mutation = useMutation({
        mutationFn: registerNewUser,
        mutationKey: ["register"],
    });
    return mutation;
};

const useLoginMutation = () => {
    const mutation = useMutation({
        mutationFn: login,
        mutationKey: ["login"],
    });
    return mutation;
};

const useUserQuery = (user_id) => {
    const query = useQuery({
        queryKey: ["user", user_id],
        queryFn: () => getUser(user_id),
    });
    return query;
};

const useGuessMutation = () => {
    const mutation = useMutation({
        mutationFn: runGuess,
        mutationKey: ["guess"],
    });
    return mutation;
};

export {
    useGuessMutation, useLoginMutation,
    useRegisterMutation,
    useUserQuery
};

