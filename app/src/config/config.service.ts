import { Injectable, Logger } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateSync, ValidationError } from "class-validator";
import { readFileSync } from "fs";
import { load as loadYaml } from "js-yaml";

import { AppConfig } from "./config.schema";
import { IAppConfig } from "./config.type";

@Injectable()
export class ConfigService {
    public readonly config: IAppConfig;

    constructor() {
        const configFilePath = process.env.ALGOZIA_WEB_CONFIG || "./config.yaml";
        const rawConfig = loadYaml(readFileSync(configFilePath, "utf-8"));
        this.config = this.validateConfig(rawConfig);
    }

    private validateConfig(rawConfig: unknown): AppConfig {
        const config = plainToInstance(AppConfig, rawConfig);

        const errors = validateSync(config, {
            validationError: { target: false },
        });

        if (errors && errors.length > 0) {
            this.logConfigErrors(errors);
            throw new Error(`Invalid configuration file.`);
        }

        return config;
    }

    private logConfigErrors(errors: ValidationError[], path = "") {
        for (const error of errors) {
            if (error.constraints) {
                for (const constraint of Object.values(error.constraints)) {
                    if (constraint) {
                        Logger.error(
                            `Invalid configuration property: ${path}${path && "."}${constraint}`,
                            "ConfigService",
                        );
                    }
                }
            }

            if (error.children && error.children.length > 0) {
                this.logConfigErrors(error.children, path ? `${path}.${error.property}` : error.property);
            }
        }
    }
}
