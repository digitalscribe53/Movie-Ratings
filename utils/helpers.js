module.exports = {
    
    absolute: (path) => {
        return path.startsWith('/') ? path : '/' + path;
    },
    eq: (v1, v2) => v1 === v2
    
};