import React from "react";
import { MultiStateCheckbox } from "primereact/multistatecheckbox";

const Checkbox = ({ id, form, onChange, options, disabled }) => {
    const { register, watch } = form;

    return (
        <MultiStateCheckbox
            value={watch(id) || false}
            onChange={(e) => {
                onChange(e.value);
            }}
            options={options}
            optionValue="value"
            empty={false}
            disabled={disabled}
            {...register(id)}
        />
    );
};

export default Checkbox;
