import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { envConfig } from './common/configuration/configuration';
import { validateEnvironmentVariables } from './common/configuration/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        // load secrets from JSON file
        () => {
          const secrets = JSON.parse(
            fs.readFileSync(
              path.join(__dirname, './common/secrets/secrets.json'),
              'utf-8',
            ),
          );
          for (const key in secrets) {
            process.env[key] = secrets[key];
          }
          return secrets;
        },
        // load environment variables from JSON file
        () => {
          const envVars = JSON.parse(
            fs.readFileSync(
              path.join(__dirname, './common/environments/environment.json'),
              'utf-8',
            ),
          );
          for (const key in envVars) {
            process.env[key] = envVars[key];
          }
          return envVars;
        },
        envConfig,
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow<string>('database.host'),
        port: configService.getOrThrow<number>('database.port'),
        username: configService.getOrThrow<string>('database.username'),
        password: configService.getOrThrow<string>('database.password'),
        database: configService.getOrThrow<string>('database.name'),
        entities: [],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    UserModule,
    AccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    validateEnvironmentVariables(process.env);
  }
}
