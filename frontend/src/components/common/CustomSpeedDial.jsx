import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";

const CustomSpeedDial = ({ items }) => {
    return (
        <>
            <SpeedDial
                model={items}
                direction="up"
                transitionDelay={80}
                showIcon="pi pi-bars"
                hideIcon="pi pi-times"
                className="speeddial"
                style={{
                    position: "fixed",
                    bottom: 0,
                    right: 0,
                    padding: "20px",
                }}
                // buttonClassName="p-button-outlined"
            />
            <Tooltip position="left" target=".speeddial .p-speeddial-action" />
        </>
    );
};

export default CustomSpeedDial;
