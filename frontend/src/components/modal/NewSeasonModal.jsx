import { Button, Grid, TextField } from "@mui/material";
import FormModal from "./FormModal";
import { useAddSquadMutation } from "../../request/hook";
import { useForm } from "react-hook-form";
import { useToastContext } from "../provider/ToastProvider";
import { useStore } from "../../hook/useStore";

const NewSeasonModal = ({ open, onClose, refetch }) => {
  const { userId } = useStore();
  const { mutate } = useAddSquadMutation();
  const { register, handleSubmit } = useForm();
  const { showToast } = useToastContext();

  const onSubmit = (data) => {
    mutate(
      {
        user_id: userId,
        tab: data.season,
      },
      {
        onSettled: (res) => {
          showToast({
            status: res.status,
            detail:
              res.status === "success"
                ? `成功新增劇本${data.season}`
                : `新增劇本${data.season}失敗`,
          });
          if (res.status === "success") {
            refetch();
          }
          onClose();
        },
      }
    );
  };

  return (
    <FormModal
      open={open}
      handleClose={onClose}
      title="新增劇本"
      parentSx={{ minWidth: "200px", height: "fit-content" }}
      sx={{ height: "fit-content" }}
      customButton
    >
      <form style={{ paddingTop: "8px" }} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              InputProps={{ className: "light-input" }}
              required
              label="劇本"
              fullWidth
              {...register("season")}
            />
          </Grid>
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              float="right"
              color="primary"
            >
              確定
            </Button>
            <Button float="right" color="primary" onClick={onClose}>
              取消
            </Button>
          </Grid>
        </Grid>
      </form>
    </FormModal>
  );
};

export default NewSeasonModal;
