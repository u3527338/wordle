export const createNewData = async ({ model, data, type, res }) => {
    return await model
        .create(data)
        .then((result) => {
            res.status(201).send({
                status: "success",
                message: `${type} Created Successfully`,
            });
        })
        .catch((error) => {
            console.log(error)
            res.status(500).send({
                status: "failed",
                message:
                    error.errorResponse.code === 11000
                        ? `${type} already exists`
                        : `Error creating ${type}`,
            });
        });
};
