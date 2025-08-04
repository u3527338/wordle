import { Chip, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { BOOK_CATEGORY, COLOR_SCHEME_BOOK } from "../../constants/constants";

const BookButton = ({
    style,
    color = "grey",
    onClick,
    label,
    variant = "contained",
}) => {
    const colorStyle = {
        backgroundColor: "white",
        border: `1px solid ${color}`,
    };
    return (
        <Chip
            style={{
                fontSize: "8px",
                fontWeight: "bold",
                width: "100%",
                opacity: 0.8,
                ...colorStyle,
                padding: "0px",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                "&:hover": {
                    ...colorStyle,
                },
                color: color,
                borderRadius: "4px",
                ...style,
            }}
            onClick={onClick}
            variant={variant}
            label={label}
        />
    );
};

const BookContainer = ({ form, character, squadIndex, characterIndex }) => {
    const bookOptions = character?.book_options || [];
    const bookSets = character?.book_sets;
    const currentCategory = bookOptions?.find(
        (option) => option._id === bookSets[0]?._id
    )?.category;

    const currentMainBookIndex = bookOptions?.findIndex(
        (option) => option._id === bookSets[0]?._id
    );
    const currentSubBookIndex = bookSets
        ? [bookSets[1], bookSets[2]]?.map((item) =>
              bookOptions?.findIndex((option) => option._id === item?._id)
          )
        : [null, null];

    const { setValue } = form;

    const [categoryIndex, setCategoryIndex] = useState(
        BOOK_CATEGORY.findIndex((c) => c.value === currentCategory)
    );
    const [mainBookIndex, setMainBookIndex] = useState(currentMainBookIndex);
    const [subBookIndex, setSubBookIndex] = useState(currentSubBookIndex);

    const color = COLOR_SCHEME_BOOK[BOOK_CATEGORY[categoryIndex]?.value];

    useEffect(() => {
        if (!character) {
            setCategoryIndex(null);
            setMainBookIndex(null);
            setSubBookIndex([null, null]);
        }
    }, [character]);

    const changeBookCategory = () => {
        if (!character) return;
        setCategoryIndex((prev) => (prev === null ? 0 : (prev + 1) % 4));
        setMainBookIndex(null);
        setSubBookIndex([null, null]);
    };

    const changeMainBook = () => {
        if (!character) return;
        const firstIndex = bookOptions?.findIndex(
            (option) =>
                option.category === BOOK_CATEGORY[categoryIndex]?.value &&
                option.isParent
        );
        const nextIndex = bookOptions?.findIndex(
            (option, index) =>
                index > mainBookIndex &&
                option.category === BOOK_CATEGORY[categoryIndex]?.value &&
                option.isParent
        );
        const index = nextIndex !== -1 ? nextIndex : firstIndex;
        setMainBookIndex(index);
        setValue(
            `squads[${squadIndex}].characters[${characterIndex}].book_sets[0]`,
            bookOptions[index]
        );
    };

    const changeSubBook = (i) => {
        if (!character) return;
        const firstIndex = bookOptions?.findIndex(
            (option, index) =>
                index !== subBookIndex[i == 1 ? 0 : 1] &&
                option.category === BOOK_CATEGORY[categoryIndex]?.value &&
                !option.isParent
        );
        const nextIndex = bookOptions?.findIndex(
            (option, index) =>
                index > subBookIndex[i] &&
                index !== subBookIndex[i == 1 ? 0 : 1] &&
                option.category === BOOK_CATEGORY[categoryIndex]?.value &&
                !option.isParent
        );
        const index = nextIndex !== -1 ? nextIndex : firstIndex;
        setSubBookIndex((prevIndexes) => {
            return i === 0 ? [index, prevIndexes[1]] : [prevIndexes[0], index];
        });
        setValue(
            `squads[${squadIndex}].characters[${characterIndex}].book_sets[${
                i + 1
            }]`,
            bookOptions[index]
        );
    };

    return (
        <div>
            {character && (
                <Grid container>
                    <Grid item xs={12}>
                        <BookButton
                            color={color}
                            onClick={changeBookCategory}
                            label={
                                BOOK_CATEGORY[categoryIndex]?.label || "兵書"
                            }
                            variant="outlined"
                            style={{ fontSize: "10px" }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <BookButton
                            color={color}
                            onClick={changeMainBook}
                            label={bookOptions[mainBookIndex]?.name || "主"}
                        />
                    </Grid>
                    {subBookIndex?.map((sub, i) => {
                        return (
                            <Grid key={i} item xs={6}>
                                <BookButton
                                    color={color}
                                    onClick={() => {
                                        changeSubBook(i);
                                    }}
                                    label={
                                        bookOptions[subBookIndex[i]]?.name ||
                                        "副"
                                    }
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </div>
    );
};

export default BookContainer;
