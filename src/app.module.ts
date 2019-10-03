/**
 * @license
 * Copyright (C) 2020-2021 IoT.bzh Company
 * Contact: https://www.iot.bzh/licensing
 *
 * This file is part of the domotic-server module of the IoT.bzh project.
 *
 * $CV_BEGIN_LICENSE$
 * Commercial License Usage
 *  Licensees holding valid commercial IoT.bzh licenses may use this file in
 *  accordance with the commercial license agreement provided with the
 *  Software or, alternatively, in accordance with the terms contained in
 *  a written agreement between you and The IoT.bzh Company. For licensing terms
 *  and conditions see https://www.iot.bzh/terms-conditions. For further
 *  information use the contact form at https://www.iot.bzh/contact.
 *
 * GNU General Public License Usage
 *  Alternatively, this file may be used under the terms of the GNU General
 *  Public license version 3. This license is as published by the Free Software
 *  Foundation and appearing in the file LICENSE.GPLv3 included in the packaging
 *  of this file. Please review the following information to ensure the GNU
 *  General Public License requirements will be met
 *  https://www.gnu.org/licenses/gpl-3.0.html.
 * $CV_END_LICENSE$
 */

import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReadersController } from './readers/readers.controller';
import { CivintecLoggerService } from './services/civintec-logger.service';
import { ShutterController } from './shutters/shutter.controller';
import { ShutterService } from './shutters/shutter.service';
import { ReadersService } from './readers/readers.service';
import { DatabaseService } from './services/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BadgesModule } from './badges/badges.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', '../dist/client'),
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseService,
    }),
    AuthModule,
    UsersModule,
    BadgesModule,
  ],
  controllers: [AppController, ReadersController, ShutterController],
  providers: [AppService, CivintecLoggerService, ShutterService, ReadersService, DatabaseService],
})
export class AppModule { }
