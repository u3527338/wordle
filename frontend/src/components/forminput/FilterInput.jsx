import React from "react";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";

const FilterInput = ({ onChange }) => {
    return (
        <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
                size={10}
                onChange={onChange}
                placeholder="搜尋"
            />
        </IconField>
    );
};

export default FilterInput;
