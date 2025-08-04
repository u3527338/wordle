import { SelectButton } from "primereact/selectbutton";

const ButtonList = ({ id, form, onChange, options }) => {
    const { register, watch } = form;
    const justifyTemplate = (option) => {
        return <option.icon />;
    };

    return (
        <SelectButton
            value={watch(id)}
            onChange={(e) => {
                onChange(e.value);
            }}
            itemTemplate={justifyTemplate}
            options={options}
            allowEmpty={false}
            {...register(id)}
        />
    );
};

export default ButtonList;
