const fs = require('fs');
const path = require('path');

let rootPath = '../../../../';
let modelDefinitionsSingleLevel;
const service = {};

service.setRootPath = (rpath) => {
    rootPath = rpath;
}

service.getRootPath = () => {
    return rootPath;
}

service.checkFile = (basePath, filePath, replacementPath) => {
    try {
        fs.accessSync(basePath + filePath);
        return filePath;
    }
    catch (e) {
        return replacementPath;
    }
}

service.getModelDefinitions = (modelsFolder) => {
    return Object.assign(getModelsFromFolder({ items: [] }, modelsFolder, 'models'), {});
}

service.getModelDefinition = (modelDefinitions, type, key) => {
    return modelDefinitions.find(md => md[type] === key);
}

service.modelDefinitionsSingleLevel = (modelDefinitions) => {
    if (modelDefinitionsSingleLevel) {
        return modelDefinitionsSingleLevel;
    }
    const result = [];
    moveItemsToRoot(result, modelDefinitions);
    modelDefinitionsSingleLevel = result;
    return modelDefinitionsSingleLevel;
}

service.getClassModel = (modelsFolder, modelName) => {
    const modelClassPath = service.checkFile(path.join(modelsFolder, 'models'), '/' + modelName + '.js', null);
    return modelClassPath ? require(service.getRootPath() + path.join(modelsFolder, 'models') + modelClassPath) : null;
}

service.getExampleDataForType = (type) => {
    if (typeof type === 'string') {
        if (type.toLowerCase() === 'string') {
            return '';
        }
        if (type.toLowerCase() === 'number') {
            return 0;
        }
    }
    return null;
}

service.checkIfBasicType = (type) => {
    if (type.toLowerCase() === 'string' || type.toLowerCase() === 'number' || type.toLowerCase() === 'date'
        || type.toLowerCase() === 'buffer' || type.toLowerCase() === 'boolean' || type.toLowerCase() === 'mixed'
        || type.toLowerCase() === 'objectid' || type.toLowerCase() === 'array') {
        return true;
    }
    return false;
}

service.firstLower = (str) => {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

const getModelsFromFolder = (group, folderPath, folderName) => {
    const fullPath = path.join(folderPath, folderName);
    fs.readdirSync(fullPath).forEach(file => {
        if (path.extname(file) === ".json" && file !== 'models.json') {
            group.items.push(Object.assign(JSON.parse(fs.readFileSync(fullPath + '/' + file, 'utf8')), { group: getGroupFromPath(fullPath) }));
        }
    })
    const innerFolders = fs.readdirSync(fullPath).filter(source => fs.lstatSync(path.join(fullPath, source)).isDirectory());
    innerFolders.forEach(folder => {
        group[folder] = { items: [] };
        getModelsFromFolder(group[folder], fullPath, folder);
    });
    return orderModels(fullPath, group);
}

const getGroupFromPath = (path) => {
    return path.split('\\').slice(2);
}

const moveItemsToRoot = (root, level) => {
    for (const prop in level) {
        if (prop === 'items') {
            level[prop].forEach(item => {
                root.push(item);
            });
        } else {
            moveItemsToRoot(root, level[prop]);
        }
    }
}

const orderModels = (modelsFolder, group) => {
    const modelsOrderPath = service.checkFile(modelsFolder, '/models.json', null);
    if (modelsOrderPath) {
        const modelsOrder = JSON.parse(fs.readFileSync(modelsFolder + modelsOrderPath));
        const orderedModels = [];
        modelsOrder.forEach(mn => {
            const model = group.items.find(m => m.name === mn);
            model.added = true;
            orderedModels.push(model);
        });
        group.items.filter(m => !m.added).forEach(model => {
            orderedModels.push(model);
        });
        group.items = orderedModels;
    }
    return group;
}



module.exports = service;