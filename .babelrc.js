module.exports = {
    presets: [['@babel/preset-env', { modules: false, targets: { node: true } }], ['@babel/preset-typescript']],
    comments: false,
    minified: true,
};
