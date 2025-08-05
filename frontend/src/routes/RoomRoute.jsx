import React from "react";
import Wrapper from "../components/general/Wrapper";
import GameRoom from "../components/GameRoom";
import { useLocation } from "react-router-dom";

export const RoomRoute = () => {
    const location = useLocation();
    const { isSinglePlayer } = location.state || {};
    console.log({ isSinglePlayer });
    return (
        <Wrapper>
            <GameRoom isSinglePlayer={isSinglePlayer}/>
        </Wrapper>
    );
};
