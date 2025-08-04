import React from "react";
import { NewBookForm } from "../components/form/NewBookForm";
import Wrapper from "../components/general/Wrapper";

export const BooksRoute = () => {
    return (
        <Wrapper>
            <NewBookForm />
        </Wrapper>
    );
};
