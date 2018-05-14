require('phantomjs-prebuilt').path = './node_modules/.bin/phantomjs';

module.exports = function(config) {
  config.set({
    frameworks: ["jasmine", "karma-typescript"],
    files: [
      "src/**/*.ts" // *.tsx for React Jsx
    ],
    preprocessors: {
      "src/**/!(*spec).ts": ["karma-typescript", "coverage"],
      "src/**/*.spec.ts": ["karma-typescript"],
    },
    reporters: ['coverage', "karma-typescript"],
    browsers: ["Chrome"],
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },
    karmaTypescriptConfig: {
      bundlerOptions: {
        sourceMap: true,
      },
      coverageOptions: {
        instrumentation: false,
        sourceMap: true,
        exclude: [/observer/ig]
      }
    }
  });
};