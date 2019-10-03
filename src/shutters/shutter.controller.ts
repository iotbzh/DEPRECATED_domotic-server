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

import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from '../app.service';
import { ShutterService } from './shutter.service';

import { first } from 'rxjs/operators';
import { ApiProperty, ApiBody } from '@nestjs/swagger';

export class ShutterRelayDTO {
    @ApiProperty()
    readonly relayNum: string;
    @ApiProperty()
    readonly action: string;
}

@Controller('shutter')
export class ShutterController {

    /**
     * counter: Number
     *
     * To avoid a misuse of the relay if it is used more than two times consecutively,
     * the open/close action will be stopped for 30 seconds
     *
     */
    counter = 0;
    constructor(private readonly appService: AppService,
        private shutterService: ShutterService
    ) { }

    /**
     *  async onApplicationBootstrap()
     *
     *  Once the server is launched the connection to the Winstar-relay is made.
     */
    async onApplicationBootstrap(): Promise<void> {
        this.shutterService.connect();
    }

    @Post('action')
    @ApiBody({type: ShutterRelayDTO})
    async shutterAction(@Body() shutterAction: ShutterRelayDTO) {
        if (shutterAction.relayNum && shutterAction.action) {
            /**
             * If after 30 seconds no action has been triggered the counter is reset.
             */
            setTimeout(() => {
                this.counter = 0;
             }, 30000);
            /**
             * Open/Close action stops for 15 seconds
             */
            if(this.counter >= 3 && shutterAction.action !== 'getStatus') {
                setTimeout(() => {
                   this.counter = 0;
                }, 15000);
                console.log('waiting');
                return 'waiting';
            }

            if (shutterAction.action == 'open') {
                this.counter++;
                this.shutterService.close(shutterAction.relayNum);
                console.log('opening');
                return 'Opening'
            }
            else if(shutterAction.action == 'close') {
                this.counter++;
                this.shutterService.open(shutterAction.relayNum);
                console.log('closing');
                return 'Closing'
            }
            else if(shutterAction.action == 'getStatus') {
                console.log('getStatus');
                await this.shutterService.getStatus();
                return this.shutterService.getRelayStatus(`${shutterAction.relayNum}`).pipe(first());
            }
        }
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

}
