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
      'progress', "karma-typescript"
    ],
    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.spec.json",
      reports: {
        lcovonly: {
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
      Chrome__No_Sandbox: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    client: {
      jasmine: {
        random: false
      }
    }
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome__No_Sandbox'];
  }

  config.set(configuration);
};