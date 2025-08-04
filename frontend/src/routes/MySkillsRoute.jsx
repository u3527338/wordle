import LoadingOverlay from "../components/common/LoadingOverlay";
import { MySkillForm } from "../components/form/MySkillForm";
import Wrapper from "../components/general/Wrapper";
import { useStore } from "../hook/useStore";
import { useMySkillQuery } from "../request/hook";

export const MySkillsRoute = () => {
    const { userId } = useStore();
    const { data, isFetching } = useMySkillQuery(userId);

    return (
        <Wrapper>
            {isFetching ? <LoadingOverlay /> : <MySkillForm skills={data} />}
        </Wrapper>
    );
};
