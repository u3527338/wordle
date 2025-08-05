import "../../styles/Modal.css";

const FormModal = ({ open, children }) => {
    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">{children}</div>
        </div>
    );
};
export default FormModal;
