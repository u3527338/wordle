import {
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    useThemeProps,
} from "@mui/material";

export const SelectInput = ({
    id,
    label,
    options = [],
    register,
    multiple = false,
    required = false,
    fullWidth = true,
    onChange = (e) => {},
    ...props
}) => {
    return (
        <FormControl fullWidth={fullWidth} required={required}>
            <InputLabel id="select-label">{label}</InputLabel>
            <Select
                labelId="select-label"
                multiple={multiple}
                input={<OutlinedInput label={label} />}
                defaultValue={multiple ? [] : ""}
                {...register(id)}
                {...props}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                
            >
                {options.map((option, i) => (
                    <MenuItem key={i} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
