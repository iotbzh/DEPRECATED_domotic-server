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

import { Controller, OnApplicationBootstrap, Post, Body } from '@nestjs/common';
import { ReadersService } from './readers.service';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
@Controller('readers')
export class ReadersController implements OnApplicationBootstrap {

    constructor(private readonly readersService: ReadersService) { }

    async onApplicationBootstrap(): Promise<void> {
        this.readersService.startReaders();
    }

    @Post('open')
    @ApiExcludeEndpoint()
    @ApiTags('Readers')
    open(
        @Body('ip') readerIp: string
    ) {
        if (!readerIp) {
            return 'Error getting reader. No ip furnished.'
        }
        this.readersService.open(readerIp);
    }

    @Post('forceStop')
    @ApiTags('Readers')
    forceStopReader(
        @Body('ip') readerIp: string
    ) {
        if (!readerIp) {
            return 'Error getting reader. No ip furnished.'
        }
        this.readersService.forceStopReader(readerIp);
    }

    @Post('reconnectReader')
    @ApiTags('Readers')
    reconnectReader(
        @Body('ip') readerIp: string
    ) {
        if (!readerIp) {
            return 'Error getting reader. No ip furnished.'
        }
        this.readersService.reconnectReader(readerIp);
    }

    @Post('resetReader')
    @ApiTags('Readers')
    resetReader(
        @Body('ip') readerIp: string
    ) {
        if (!readerIp) {
            return 'Error getting reader. No ip furnished.'
        }
        this.readersService.resetReaderCN56(readerIp);
    }

    @Post('getAllReadersStatus')
    @ApiTags('Readers')
    getAllReadersStatus(
    ) {
        return this.readersService.getAllReadersStatus();
    }

}
