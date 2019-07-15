const fs = require('fs');
const path = require('path');

let rootPath = '../../../../';
let modelDefinitionsSingleLevel;
const service = {};

const basicTypes = require('../types/basic');
const geoTypes = require('../types/geo');

service.transformMongooseErrors = (err) => {
    const result = {};
    err.errors && Object.entries(err.errors).forEach(([key, obj]) => {
        result[key] = {
            name: obj.name,
            message: obj.message
        };
    });
    return result;
}

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

service.checkIfType = (type) => {
    const typeName = Array.isArray(type) ? type[0] : type;
    if (!typeName) { return true; }
    return basicTypes.concat(geoTypes).filter(t => t === typeName.toString().toLowerCase()).length;
}

service.getMongooseTypeFromString = (strType) => {
    switch (strType) {
        case 'String':
            return String;
        case 'Number':
            return Number;
        case 'Date':
            return Date;
        case 'Boolean':
            return Boolean;
        default:
            return null;
    }
}

service.firstLower = (str) => {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

service.firstUpper = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

service.guid = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + '-' + s4();
}

service.getPostmanBodyFromModelDef = (modelDefinition, action) => {
    const result = {};
    Object.entries(modelDefinition.properties)
        .filter(([prop, propDef]) => propDef.actions && propDef.actions[action])
        .forEach(prop => {
            result[prop[0]] = service.getExampleDataForType(prop[1].type)
        })
    return result;
}

service.filterBodyForAction = (modelDefinition, action, bodyObj) => {
    return Object.keys(bodyObj)
        .filter(key =>
            modelDefinition.properties[key]
            && modelDefinition.properties[key].actions
            && modelDefinition.properties[key].actions[action])
        .reduce((obj, key) => {
            obj[key] = bodyObj[key];
            return obj;
        }, {});;
}

service.addCreatedAndModified = (objSchema, user, addCreation) => {
    const now = Date.now();
    const result = {
        ...objSchema,
        lastModified: {
            date: now,
            user: user.id
        }
    };
    if (addCreation) {
        result.created = {
            date: now,
            user: user.id
        }
    }
    return result;
}

service.validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

service.validatePassword = (password) => {
    if (password.length < 8) {
        return false;
    }
    if (password.search(/[a-z]/i) < 0) {
        return false;
    }
    if (password.search(/[0-9]/) < 0) {
        return false;
    }
    return true;
}

service.validateUserBody = (user) => {
    if (user.title && !["Mr.", "Ms.", "Mrs.", "Miss", "Dr."].includes(user.title)) {
        return false;
    }
    if (!user.firstName) {
        return false;
    }
    if (!user.lastName) {
        return false;
    }
    if (!["Male", "Female"].includes(user.genre)) {
        return false;
    }
    return true;
}

const getModelsFromFolder = (group, folderPath, folderName) => {
    const fullPath = path.join(folderPath, folderName);
    fs.readdirSync(fullPath).forEach(file => {
        if (path.extname(file) === ".json" && (file !== 'models.json')) {
            const jsonModelDef = JSON.parse(fs.readFileSync(fullPath + '/' + file, 'utf8'));
            const modelDef = {
                ...jsonModelDef,
                properties: {
                    ...jsonModelDef.properties,
                    created: { date: { type: 'Date' }, user: { type: 'User' } },
                    lastModified: { date: { type: 'Date' }, user: { type: 'User' } }
                }
            }
            group.items.push(Object.assign(modelDef, { group: getGroupFromPath(fullPath) }));
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