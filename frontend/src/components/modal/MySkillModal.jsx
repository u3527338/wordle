import { MySkillForm } from "../form/MySkillForm";
import FormModal from "./FormModal";

const MySkillModal = ({ open, onClose, skills, onClick }) => {
    return (
        <FormModal title="戰法列表" open={open} handleClose={onClose}>
            <MySkillForm skills={skills} mode="squad" onClick={onClick} />
        </FormModal>
    );
};

export default MySkillModal;
