import { useState } from "react";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { NavigationTabs } from "../components/common/NavigationTabs";
import MySquadForm from "../components/form/MySquadForm";
import Wrapper from "../components/general/Wrapper";
import { useStore } from "../hook/useStore";
import {
    useMyCharacterQuery,
    useMySkillQuery,
    useMySquadQuery
} from "../request/hook";

export const MySquadsRoute = () => {
    const { userId } = useStore();
    const {
        data: mySquadData,
        isFetching: isMySquadFetching,
        refetch,
    } = useMySquadQuery(userId);
    const { data: mySkillData, isFetching: isMySkillFetching } =
        useMySkillQuery(userId);
    const { data: myCharacterData, isFetching: isMyCharacterFetching } =
        useMyCharacterQuery(userId);
    const [currentTabIndex, setCurrentTabIndex] = useState(0);

    const onTabChange = (e) => {
        setCurrentTabIndex(e.index);
        return true;
    };
  
    const isFetching =
        isMyCharacterFetching || isMySkillFetching || isMySquadFetching;

    return (
        <Wrapper>
            {isFetching ? (
                <LoadingOverlay />
            ) : (
                <NavigationTabs
                    tabs={mySquadData.all_squads.map((squad) => ({
                        id: squad._id,
                        name: squad.tab,
                    }))}
                    onTabChange={onTabChange}
                >
                    <MySquadForm
                        squads={mySquadData.all_squads[currentTabIndex]}
                        characters={myCharacterData}
                        skills={mySkillData}
                        refetch={refetch}
                    />
                </NavigationTabs>
            )}
        </Wrapper>
    );
};
