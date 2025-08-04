import _ from 'lodash'

export const formatCharacterData = (originalData) => {
    let transformedData = [];

    originalData.forEach((item) => {
        const type = item.type;
        const characters = item.characters.map((character) => {
            if (character === null) {
                return null;
            }
            const userCharacter = character.user_character;
            return {
                user_character: {
                    ...userCharacter.character_id,
                    _id: userCharacter._id,
                    character_id: userCharacter.character_id._id,
                    character_info: { _id: userCharacter.character_id._id },
                },
                rating: userCharacter.rating,
                hasTreasure: character.hasTreasure,
                skill_sets: character.skill_sets.map((skill) => {
                    if (!skill) return null;
                    const { _id, ...rest } = skill;
                    return {
                        skill_id: skill._id,
                        ...rest,
                    };
                }),
                book_sets: character.book_sets,
                book_options: userCharacter.character_id.book_options,
            };
        });

        transformedData.push({ type: type, characters: characters });
    });

    return transformedData;
};

export const groupCharacters = (characterList) => {
    const validCharacters = characterList.filter(
        (character) => character.character_id && character.character_id.faction
    );

    const groupedCharacters = _.groupBy(
        validCharacters,
        "character_id.faction"
    );

    const result = _.map(groupedCharacters, (characters, faction) => ({
        faction,
        characters: _.orderBy(characters.map(({ character_id, ...rest }) => {
            const { _id, ...others } = character_id;
            return {
                character_info: character_id,
                ...others,
                originalIndex: characterList.findIndex(
                    (char) => char.character_id._id === character_id._id
                ),
                ...rest,
            };
        }), [obj => obj.character_info.cost], ['desc'])
    }));

    return result;
};

export const groupSkills = (skillList) => {
    const validSkills = skillList.filter(
        (skill) => skill.skill_id && skill.skill_id.type
    );

    const groupedSkills = _.groupBy(validSkills, "skill_id.type");

    const result = _.map(groupedSkills, (skills, type) => ({
        type,
        skills: skills.map(({ skill_id, ...rest }) => {
            const { _id, ...others } = skill_id;
            return {
                ...others,
                originalIndex: skillList.findIndex(
                    (skill) => skill.skill_id._id === skill_id._id
                ),
                skill_id: _id,
                ...rest,
            };
        }),
    }));

    return result;
};