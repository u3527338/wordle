import { Card, CardContent, CardHeader, CardMedia, Grid } from "@mui/material";
import { ARM_CATEGORY, SKILL_CATEGORY } from "../../constants/constants";
import {
    CHARACTER_CARD_HEIGHT,
    CHARACTER_CARD_WIDTH,
} from "../../constants/values";

const SkillCard = ({ skill, onClick = () => {} }) => {
    const skillInfo = [
        {
            label: "適性",
            value: ARM_CATEGORY.filter((a) =>
                skill.allowance.includes(a.value)
            ).map((a, i) => <a.icon key={i} />),
        },
        {
            label: "類型",
            value: (
                <span>
                    {SKILL_CATEGORY.find((s) => s.value === skill.type).label}
                </span>
            ),
        },
        {
            label: "發動",
            value: (
                <span>{`${skill.probability}%${
                    skill.probability_max ? `-${skill.probability_max}%` : ""
                }`}</span>
            ),
        },
    ];

    return (
        <Card
            onClick={onClick}
            sx={{
                maxWidth: CHARACTER_CARD_WIDTH,
                height: CHARACTER_CARD_HEIGHT,
                cursor: "pointer",
                // boxShadow: `3px 3px 4px darkgrey`,
                // ...props,
            }}
            className="skill-card"
        >
            <CardHeader
                title={skill.name}
                titleTypographyProps={{
                    fontSize: "11px",
                    letterSpacing: "1px",
                    fontWeight: "bold",
                }}
                sx={{
                    padding: "0px 0px",
                    height: "12%",
                    textAlign: "center",
                }}
            ></CardHeader>
            <CardMedia
                component="img"
                sx={{
                    height: "53%",
                    objectFit: "cover",
                }}
                image={`/img/arms/${
                    skill.type === "arms" ? skill.allowance[0] : skill.type
                }.png`}
                alt={skill.name}
            />
            <CardContent
                sx={{
                    height: "35%",
                    alignItems: "center",
                    padding: "0px 1px",
                }}
            >
                <Grid py={0.1} px={0.2} container spacing={0}>
                    {skillInfo.map((session, i) => (
                        <Grid key={i} p={0} container columnGap={0.4}>
                            <Grid item xs={3}>
                                <span>{session.label}</span>
                            </Grid>
                            <Grid
                                item
                                xs={8}
                                display="flex"
                                alignItems="center"
                            >
                                {session.value}
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SkillCard;
