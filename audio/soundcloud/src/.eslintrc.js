module.exports = {
  extends: 'vi',

  // override
  rules: {
    'max-len': ['error', 200, 2, { ignoreUrls: true, ignoreComments: true }],
    'no-bitwise': 'off',
    'no-unused-vars': ['error', { args: 'none' }]
  },

  globals: {
    Deck: false,
    Drawer: false,
    SampleCreator: false,
    SC: false
  }
};