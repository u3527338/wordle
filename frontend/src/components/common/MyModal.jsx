import "../../styles/Modal.css";
import MyButton from "./MyButton";

const MyModal = ({ open, buttons, children }) => {
    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="glowing-box modal-content">
                {children}
                {buttons && buttons.length > 0 && (
                    <div className="modal-buttons">
                        {buttons.map((btn, index) => (
                            <MyButton
                                key={index}
                                onClick={btn.onClick}
                                color={btn.color}
                            >
                                {btn.label}
                            </MyButton>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default MyModal;
