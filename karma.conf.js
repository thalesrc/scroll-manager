module.exports = function(config) {
  config.set({
    frameworks: ["jasmine", "karma-typescript"],
    files: [
      "src/**/*.spec.ts" // *.tsx for React Jsx
    ],
    preprocessors: {
      "**/*.ts": "karma-typescript" // *.tsx for React Jsx
    },
    reporters: ["karma-typescript", 'coverage'],
    browsers: ["Chrome"],
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    }
  });
};