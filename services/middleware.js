function create(collection, data) {
    return collection.insertOne(data).then(result => {
        return result.insertedId;
    }).catch(error => console.error(error));
}

function update(collection, query , update , options) {
    return collection.findOneAndUpdate(query , update , options).then(result => {
        return result;
    }).catch(error => console.error(error));
}

function find(collection, query) {
    return collection.find(query).toArray().then(results => {
        return results;
    }).catch(error => console.error(error));
}

function findById(collection, query) {
    return collection.findOne(query).then(result => {
        return result;
    }).catch(error => console.error(error));
}

function remove(collection, query) {
    return collection.remove(query).then(result => {
        return result.deletedCount;
    }).catch(error => console.error(error));
}

function deleteOne(collection, query) {
    return collection.deleteOne(query).then(result => {
        return result.deletedCount;
    }).catch(error => console.error(error));
}

module.exports = {
    create : create,
    update : update,
    find : find,
    findById : findById,
    remove : remove,
    deleteOne : deleteOne
}