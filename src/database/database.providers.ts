import { TypeOrmModule } from "@nestjs/typeorm";

import { isProduction } from "@/common/utils/env";
import { ConfigService } from "@/config/config.service";

export const databaseProviders = [
    TypeOrmModule.forRootAsync({
        useFactory: (configService: ConfigService) => ({
            host: configService.config.database.hostname,
            port: configService.config.database.port,
            type: configService.config.database.type,
            username: configService.config.database.username,
            password: configService.config.database.password,
            database: configService.config.database.database,
            entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
            logging: !isProduction(),
            synchronize: true,
            charset: "utf8mb4",
        }),
        inject: [ConfigService],
    }),
];
