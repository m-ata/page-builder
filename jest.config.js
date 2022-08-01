module.exports = {
    setupFilesAfterEnv: ["./jest.setup.js"],
    moduleDirectories: ['node_modules', '.'],
    verbose: true,
    "testRegex": "/*.test.js$",
    "collectCoverage": true,
    "coverageReporters": ["lcov"],
    "coverageDirectory": "coverage",
    "coverageThreshold": {
        "global": {
            "branches": 40,
            "functions": 40,
            "lines": 40,
            "statements": 40
        }
    },
};