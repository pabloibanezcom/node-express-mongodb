const createNew = (dataObj, models, modelName) => {
    return new Promise((resolve, reject) => {
        const newObj = new models[modelName]();
        Object.entries(dataObj).forEach(entry => { newObj[entry[0]] = entry[1] });
        newObj.save(err => {
            if (err) { reject() };
            resolve();
        });
    });
}

module.exports = createNew;