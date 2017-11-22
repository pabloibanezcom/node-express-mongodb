const service = {};

const operators = {
    intersects: "$geoIntersects",
    within: "$geoWithin",
    near: "$near",
    nearSphere: "$nearSphere"
}

service.runOperator = (operator, model, geometry, geoDefinition, toExclude) => {
    return new Promise((resolve, reject) => {
        const findObj = { geometry: {} };
        findObj.geometry[operators[operator]] = { $geometry: geometry };
        if (toExclude) {
            findObj.name = { $not: toExclude };
        }
        model.find(findObj).populate(geoDefinition.populate || "").select(geoDefinition.select || "")
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
}

service.getUrlInfoByGeoType = (geoType) => {
    if (geoType === 'Point') {
        return {
            method: 'GET',
            params: ['lat', 'lng']
        }
    }
    if (geoType === 'Polygon') {
        return {
            method: 'POST',
            params: []
        }
    }
}

service.getGeometryFromParams = (geoType, params, body) => {
    if (geoType === 'Point') {
        return {
            type: geoType,
            coordinates: [
                params.lng,
                params.lat
            ]
        }
    }
    return body;
}

module.exports = service;