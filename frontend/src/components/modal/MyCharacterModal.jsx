import { MyCharacterForm } from "../form/MyCharacterForm";
import FormModal from "./FormModal";

const MyCharacterModal = ({ open, onClose, characters, onClick }) => {
  return (
    <FormModal title="武將列表" open={open} handleClose={onClose}>
      <MyCharacterForm characters={characters} mode="squad" onClick={onClick}/>
    </FormModal>
  );
};

export default MyCharacterModal;
