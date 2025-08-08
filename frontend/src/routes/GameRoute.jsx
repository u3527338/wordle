import React from "react";
import GameRoom from "../components/GameRoom";
import Wrapper from "../components/general/Wrapper";

export const GameRoute = () => {
    return (
        <Wrapper showAppBar={false}>
            <GameRoom />
        </Wrapper>
    );
};
