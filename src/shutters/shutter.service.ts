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

import { Injectable } from '@nestjs/common';
import { WR_Instance } from 'winstar-relay';
import * as config from '../config-winstar-relay.json';

@Injectable()
export class ShutterService {

    private winstarInstance: WR_Instance;
    private protocol: string;

    /**
     *Creates an instance of ShutterService. A connection to the Winstar-relay is made.
     * @memberof ShutterService
     */
    constructor() {
        this.protocol = config['relays-config'][0].connection;
        this.winstarInstance = new WR_Instance(config.serverConfig.serverIpAddress,config.serverConfig.serverPort, config['relays-config'][0].ip, config['relays-config'][0].port, this.protocol);
    }

    /**
     * Re
     *
     * @param {string} [relay='01']
     * @returns
     * @memberof ShutterService
     */
    getRelayStatus(relay: string = '01'): any{
        if (relay == '01') {
            return this.winstarInstance.out1$;
        }
        return this.winstarInstance.out2$;
    }

    getStatus(): void{
        this.winstarInstance.readState();
    }

    open(id: string): void{
        this.winstarInstance.relayOff(id);
    }

    close(id: string): void{
        this.winstarInstance.relayOn(id);
    }

    connect(): void{
        switch (this.protocol) {
            case 'udp':
                this.winstarInstance.connectUDP();
                break;
            case 'tcp':
                this.winstarInstance.connectTCP();
                break;

            default:
                console.log('Winstar-relay - The protocol "connection" is not set correctly.');
                break;
        }

    }

}
