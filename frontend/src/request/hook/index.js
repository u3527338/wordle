import { useQuery, useMutation } from "@tanstack/react-query";
import {
    addSquad,
    createNewBook,
    createNewCharacter,
    createNewSkill,
    deleteSquad,
    getBooks,
    getCharacters,
    getMyCharacters,
    getMySkills,
    getMySquads,
    getSkills,
    getUser,
    login,
    registerNewUser,
    updateMyCharacters,
    updateMySkills,
    updateMySquad,
    uploadImage,
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

/* admin */
const useCreateCharacterMutation = () => {
    const mutation = useMutation({
        mutationFn: createNewCharacter,
        mutationKey: ["new-character"],
    });
    return mutation;
};

const useCreateSkillMutation = () => {
    const mutation = useMutation({
        mutationFn: createNewSkill,
        mutationKey: ["new-skill"],
    });
    return mutation;
};

const useCreateBookMutation = () => {
    const mutation = useMutation({
        mutationFn: createNewBook,
        mutationKey: ["new-book"],
    });
    return mutation;
};

/* raw data */
const useCharacterQuery = () => {
    const query = useQuery({
        queryKey: ["character"],
        queryFn: getCharacters,
    });
    return query;
};

const useSkillQuery = () => {
    const query = useQuery({
        queryKey: ["skill"],
        queryFn: getSkills,
    });
    return query;
};

const useBookQuery = () => {
    const query = useQuery({
        queryKey: ["book"],
        queryFn: getBooks,
    });
    return query;
};

/* get user data */
const useMyCharacterQuery = (user_id) => {
    const query = useQuery({
        queryKey: ["my-characters", user_id],
        queryFn: () => getMyCharacters(user_id),
    });
    return query;
};

const useMySkillQuery = (user_id) => {
    const query = useQuery({
        queryKey: ["my-skills", user_id],
        queryFn: () => getMySkills(user_id),
    });
    return query;
};

const useMySquadQuery = (user_id) => {
    const query = useQuery({
        queryKey: ["my-squads", user_id],
        queryFn: () => getMySquads(user_id),
    });
    return query;
};

/* update user data */
const useMyCharacterMutation = () => {
    const mutation = useMutation({
        mutationFn: updateMyCharacters,
        mutationKey: ["update-character"],
    });
    return mutation;
};

const useMySkillMutation = () => {
    const mutation = useMutation({
        mutationFn: updateMySkills,
        mutationKey: ["update-skills"],
    });
    return mutation;
};

const useMySquadMutation = () => {
    const mutation = useMutation({
        mutationFn: updateMySquad,
        mutationKey: ["update-squad"],
    });
    return mutation;
};

const useAddSquadMutation = () => {
    const mutation = useMutation({
        mutationFn: addSquad,
        mutationKey: ["add-squad"],
    });
    return mutation;
};

const useDeleteSquadMutation = () => {
    const mutation = useMutation({
        mutationFn: deleteSquad,
        mutationKey: ["delete-squad"],
    });
    return mutation;
};

const useUploadS3ImageMutation = () => {
    const mutation = useMutation({
        mutationFn: uploadImage,
        mutationKey: ["upload-s3-image"],
    });
    return mutation;
};

export {
    useLoginMutation,
    useRegisterMutation,
    useUserQuery,
    useCreateCharacterMutation,
    useCreateSkillMutation,
    useCreateBookMutation,
    useCharacterQuery,
    useSkillQuery,
    useBookQuery,
    useMyCharacterQuery,
    useMySkillQuery,
    useMySquadQuery,
    useMyCharacterMutation,
    useMySkillMutation,
    useMySquadMutation,
    useAddSquadMutation,
    useDeleteSquadMutation,
    useUploadS3ImageMutation,
};
