module.exports = function (config) {
  var configuration = {
    frameworks: [
      "jasmine", "karma-typescript"
    ],
    files: [
      "src/**/*.ts"
    ],
    preprocessors: {
      "**/*.ts": "karma-typescript"
    },
    reporters: [
      "progress", "karma-typescript"
    ],
    karmaTypescriptConfig: {
      bundlerOptions: {
        sourceMap: true
      },
      coverageOptions: {
        instrumentation: true
      },
      reports: {
        lcovonly: {
          directory: 'coverage/',
          subdirectory: './'
        },
        json: {
          directory: 'coverage/',
          subdirectory: './'
        },
        html: {
          directory: 'coverage/',
          subdirectory: './',
          filename: './'
        }
      }
    },
    browsers: ["Chrome"],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }

  config.set(configuration);
};