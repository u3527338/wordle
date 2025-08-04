import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MENU } from "../constants/constants";

export const useStore = create(
    persist(
        (set, get) => ({
            userId: null,
            currentTab: MENU['my-squads'],
            data_retrieved: false,
            data: { skills: [], books: [], characters: [] },
            setUserId: (id) => set((state) => ({ userId: id })),
            setCurrentTab: (tab) => set((state) => ({ currentTab: tab })),
            setDataRetrieved: (done) =>
                set((state) => ({ data_retrieved: done })),
            initData: (data) =>
                set((state) => ({ data: { ...state.data, ...data } })),
            getAllSkills: () => get().data.skills,
            getAllBooks: () => get().data.books,
        }),
        {
            name: "custom-storage", // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
