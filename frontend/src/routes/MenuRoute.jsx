import React from "react";
import { useNavigate } from "react-router-dom";
import Wrapper from "../components/general/Wrapper";

export const MenuRoute = () => {
    const navigate = useNavigate();

    return (
        <Wrapper>
            <div>
                <button
                    onClick={() => {
                        navigate("/wordle");
                    }}
                >
                    Single Player
                </button>
                <button
                    onClick={() => {
                        navigate("/wordle");
                    }}
                >
                    Multiple Player
                </button>
            </div>
        </Wrapper>
    );
};
