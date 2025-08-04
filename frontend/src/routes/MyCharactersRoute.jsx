import LoadingOverlay from "../components/common/LoadingOverlay";
import { MyCharacterForm } from "../components/form/MyCharacterForm";
import Wrapper from "../components/general/Wrapper";
import { useStore } from "../hook/useStore";
import { useMyCharacterQuery } from "../request/hook";

export const MyCharactersRoute = () => {
  const { userId } = useStore();
  const { data, isFetching } = useMyCharacterQuery(userId);

  return (
    <Wrapper>
      {isFetching ? <LoadingOverlay /> : <MyCharacterForm characters={data} />}
    </Wrapper>
  );
};
