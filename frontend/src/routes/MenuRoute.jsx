import React from "react";
import NewCharacterForm from "../components/form/NewCharacterForm";
import Wrapper from "../components/general/Wrapper";
import { useNavigate } from "react-router-dom";

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
