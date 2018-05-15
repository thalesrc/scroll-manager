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
      'progress', "karma-typescript", "coverage"
    ],
    coverageReporter: {
      type: 'in-memory',
      dir: 'coverage/',
      reporters: [
        { directory: 'coverage/', type: 'lcovonly', subdir: '.' }
      ],
      instrumenterOptions: {
        istanbul: { noCompact: true }
      }
    },
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
    client: {
      jasmine: {
        random: false
      }
    }
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
    configuration.reporters.push("coveralls");
  }

  config.set(configuration);
};