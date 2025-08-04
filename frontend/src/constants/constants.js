import {
    GiArrowFlights,
    GiArrowhead,
    GiHorseHead,
    GiRoundShield,
    GiSailboat,
    GiCartwheel,
} from "react-icons/gi";
import { TbHexagonNumber3 } from "react-icons/tb";
import { TbHexagonNumber4 } from "react-icons/tb";
import { TbHexagonNumber5 } from "react-icons/tb";
import { TbHexagonNumber6 } from "react-icons/tb";
import { TbHexagonNumber7 } from "react-icons/tb";


const MENU = {
    characters: "武將",
    skillsets: "戰法",
    books: "兵書",
    "my-characters": "我的武將",
    "my-skills": "我的戰法",
    "my-squads": "我的陣容",
};

const BOOK_CATEGORY = [
    { value: "offense", label: "作戰" },
    { value: "control", label: "虛實" },
    { value: "defense", label: "軍形" },
    { value: "assist", label: "九變" },
];

const COLOR_SCHEME_BOOK = {
    offense: "red",
    control: "purple",
    defense: "blue",
    assist: "green",
};

const CHARACTER_FACTION = [
    { value: "wei", label: "魏" },
    { value: "shu", label: "蜀" },
    { value: "wu", label: "吳" },
    { value: "qun", label: "群" },
];

const COLOR_SCHEME_FACTION = {
    wei: ["#0a2c6b", "#111133"],
    shu: ["#4CAF50", "#003d00"],
    wu: ["#FF5733", "#660000"],
    qun: ["#FF9900", "#333333"],
};

const QUALITY = [
    { value: "S", label: "S" },
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
];

const SKILL_CATEGORY = [
    { value: "active", label: "主動" },
    { value: "command", label: "指揮" },
    { value: "assault", label: "突擊" },
    { value: "passive", label: "被動" },
    { value: "arms", label: "兵種" },
    { value: "formation", label: "陣法" },
    { value: "politics", label: "內政" },
];

const ARM_CATEGORY = [
    { value: "horse", label: "騎兵", icon: GiHorseHead },
    { value: "shield", label: "盾兵", icon: GiRoundShield },
    { value: "bow", label: "弓兵", icon: GiArrowFlights },
    { value: "lance", label: "槍兵", icon: GiArrowhead },
    { value: "engine", label: "器械", icon: GiCartwheel },
    { value: "navy", label: "水軍", icon: GiSailboat },
];

const ATTRIBUTES = [
    { value: "power", label: "武力" },
    { value: "intelligence", label: "智力" },
    { value: "defense", label: "統率" },
    { value: "speed", label: "速度" },
    { value: "politics", label: "政治" },
    { value: "charm", label: "魅力" },
];

const COLOR_SCHEME_QUALITY = {
    S: ["rgba(237, 108, 58, 1)", "white"],
    A: ["rgba(87, 27, 126, 0.7)", "white"],
    B: ["rgba(41, 182, 246, 1)", "white"],
    C: ["rgba(102, 187, 106, 1)", "white"],
};

const COST = {
    3: TbHexagonNumber3,
    4: TbHexagonNumber4,
    5: TbHexagonNumber5,
    6: TbHexagonNumber6,
    7: TbHexagonNumber7,
}

export {
    MENU,
    BOOK_CATEGORY,
    CHARACTER_FACTION,
    QUALITY,
    SKILL_CATEGORY,
    ARM_CATEGORY,
    ATTRIBUTES,
    COST,
    COLOR_SCHEME_BOOK,
    COLOR_SCHEME_FACTION,
    COLOR_SCHEME_QUALITY,
};
