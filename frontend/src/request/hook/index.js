import { useMutation, useQuery } from "@tanstack/react-query";
import {
    createGameHistoryAndUpdateUserStats,
    createRoom,
    getUser,
    joinRoom,
    login,
    registerNewUser,
} from "../api";

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

const useCreateRoomMutation = () => {
    const mutation = useMutation({
        mutationFn: createRoom,
        mutationKey: ["createRoom"],
    });
    return mutation;
};

const useJoinRoomMutation = () => {
    const mutation = useMutation({
        mutationFn: joinRoom,
        mutationKey: ["joinRoom"],
    });
    return mutation;
};

export {
    useLoginMutation,
    useRegisterMutation,
    useUserQuery,
    useCreateRoomMutation,
    useJoinRoomMutation,
};
