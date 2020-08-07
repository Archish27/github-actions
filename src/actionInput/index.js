import * as core from '@actions/core';
import InputValidator from './inputValidator';
import constants from '../../config/constants';

const {
  INPUT,
  ENV_VARS,
  ALLOWED_INPUT_VALUES: {
    LOCAL_TESTING,
  },
} = constants;

class ActionInput {
  constructor() {
    this._fetchAllInput();
    this._validateInput();
  }

  _fetchAllInput() {
    try {
      // required fields
      this.username = core.getInput(INPUT.USERNAME, { required: true });
      this.accessKey = core.getInput(INPUT.ACCESS_KEY, { required: true });

      // non-compulsory fields
      this.buildName = core.getInput(INPUT.BUILD_NAME);
      this.projectName = core.getInput(INPUT.PROJECT_NAME);
      this.localTesting = core.getInput(INPUT.LOCAL_TESING);
      this.localLoggingLevel = core.getInput(INPUT.LOCAL_LOGGING_LEVEL);
      this.localIdentifier = core.getInput(INPUT.LOCAL_IDENTIFIER);
      this.localArgs = core.getInput(INPUT.LOCAL_ARGS);
    } catch (e) {
      throw Error(`Action input failed for reason: ${e.message}`);
    }
  }

  setEnvVariables() {
    core.exportVariable(ENV_VARS.BROWSERSTACK_USERNAME, this.username);
    core.exportVariable(ENV_VARS.BROWSERSTACK_ACCESS_KEY, this.accessKey);

    core.exportVariable(ENV_VARS.BROWSERSTACK_PROJECT_NAME, this.projectName);
    core.info(`${ENV_VARS.BROWSERSTACK_PROJECT_NAME} environment variable set as: ${this.projectName}`);
    core.info(`Use ${ENV_VARS.BROWSERSTACK_PROJECT_NAME} environment varaible for your project name capability in your tests`);

    core.exportVariable(ENV_VARS.BROWSERSTACK_BUILD_NAME, this.buildName);
    core.info(`${ENV_VARS.BROWSERSTACK_BUILD_NAME} environment variable set as: ${this.buildName}`);
    core.info(`Use ${ENV_VARS.BROWSERSTACK_BUILD_NAME} environment varaible for your build name capability in your tests`);

    if (this.localTesting === LOCAL_TESTING.START) {
      core.exportVariable(ENV_VARS.BROWSERSTACK_LOCAL_IDENTIFIER, this.localIdentifier);
      core.info(`${ENV_VARS.BROWSERSTACK_LOCAL_IDENTIFIER} environment variable set as: ${this.localIdentifier}`);
      core.info(`Use ${ENV_VARS.BROWSERSTACK_LOCAL_IDENTIFIER} env variable in your test scripts as the local identifier`);
    }
  }

  _validateInput() {
    this.localTesting = InputValidator.validateLocalTesting(this.localTesting);

    if ([LOCAL_TESTING.START, LOCAL_TESTING.FALSE].includes(this.localTesting)) {
      // properties common to local/non-local testing comes here
      this.username = InputValidator.validateUsername(this.username);
      this.projectName = InputValidator.validateProjectName(this.projectName);
      this.buildName = InputValidator.validateBuildName(this.buildName);

      // properties specific to requiring local testing shall come in this block
      if (this.localTesting === LOCAL_TESTING.START) {
        this.localLoggingLevel = InputValidator.validateLocalLoggingLevel(this.localLoggingLevel);
        this.localIdentifier = InputValidator.validateLocalIdentifier(this.localIdentifier);
        this.localArgs = InputValidator.validateLocalArgs(this.localArgs);
      }
    } else {
      this.localIdentifier = process.env[ENV_VARS.BROWSERSTACK_LOCAL_IDENTIFIER];
    }
  }

  getInputStateForBinary() {
    return {
      accessKey: this.accessKey,
      localTesting: this.localTesting,
      localArgs: this.localArgs,
      localIdentifier: this.localIdentifier,
      localLoggingLevel: this.localLoggingLevel,
    };
  }
}

export default ActionInput;
