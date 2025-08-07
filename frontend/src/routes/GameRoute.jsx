import React from "react";
import Wrapper from "../components/general/Wrapper";
import GameRoom from "../components/GameRoom";
import { useLocation } from "react-router-dom";

export const GameRoute = () => {
    const location = useLocation();
    const { isSinglePlayer } = location.state || {};
    return (
        <Wrapper showAppBar={false}>
            <GameRoom isSinglePlayer={isSinglePlayer}/>
        </Wrapper>
    );
};
