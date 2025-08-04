import { Tooltip } from "primereact/tooltip";

const CustomTooltip = ({ className, children }) => {
    return <Tooltip mouseTrack target={className}>{children}</Tooltip>;
};

export default CustomTooltip