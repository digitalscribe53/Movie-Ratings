module.exports = {
    
    absolute: (path) => {
        return path.startsWith('/') ? path : '/' + path;
    }
};