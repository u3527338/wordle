import { Box } from "@mui/material";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { TabPanel, TabView } from "primereact/tabview";
import { useDeleteSquadMutation } from "../../request/hook";
import { useToastContext } from "../provider/ToastProvider";

export const NavigationTabs = ({ children, tabs, onTabChange }) => {
  const { showToast } = useToastContext();
  const { mutate } = useDeleteSquadMutation();
  const handleBeforeTabClose = (e) => {
    const tabIdToDelete = tabs[e.index].id;
    mutate(tabIdToDelete, {
      onSettled: (res) => {
        showToast({
          status: res.status,
          detail:
            res.status === "success"
              ? `成功刪除劇本${tabs[e.index].name}`
              : `刪除劇本${tabs[e.index].name}失敗`,
        });
        return res.status === "success";
      },
    });
  };

  return (
    <Box className="card">
      <TabView
        scrollable
        onBeforeTabClose={handleBeforeTabClose}
        style={{ fontSize: "12px", padding: "0px" }}
        onBeforeTabChange={onTabChange}
        renderActiveOnly
      >
        {tabs.map((header, i) => {
          return (
            <TabPanel header={header.name} key={i} closable>
              {children}
            </TabPanel>
          );
        })}
      </TabView>
    </Box>
  );
};
