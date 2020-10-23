
const identities = {

}

function setIdentity(type, identityInfo) {
    identities[type] = identityInfo || {};
}

function getIdentity(type) {
    return identities[type];
};

export default {
    setIdentity,
    getIdentity
}