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

import { Injectable, Logger } from '@nestjs/common';
import * as config from "../config-readers.json";
import { CV_Server, IreaderEvent, CV_CT9 } from 'civintecreader'
import { map, first } from 'rxjs/operators';
import { BadgesService } from '../badges/badges.service';
import { BadgeEntity } from '../entities/badge.entity';

@Injectable()
export class ReadersService {


    private rebooting: any = {};
    private server: CV_Server;

    constructor(
        private badgeService: BadgesService
    ) { }

    startReaders() {

        this.server = new CV_Server(config);

        this.checkIfReaderIsDown();

        this.initAccessManagement();

    }

    initAccessManagement() {

        this.server.readerEvent$.subscribe((x: IreaderEvent) => {


            let rinfo: any = x.rinfo;
            let data: any = x.data;

            if (x.data.length == 4) {
                let reader: any = this.server.getReaderCN56_Instance(rinfo.address);
                if (reader) {

                    let uid = data.toString('hex');
                    let badge = this.badgeService.findOne({ relations: ['user'], where: { uid }  });

                    badge.then((b:BadgeEntity) => {
                        if (b && b.user) {
                            if (b.user.disabled) {
                                this.badgeService.disable(uid);
                                Logger.warn(uid, `Not allowed - user: ${b.user.first_name} ${b.user.last_name} - Port [${rinfo.address}] ${reader.name}`);
                                return reader.refuse();
                            }
                            if (!b.disabled) {
                                if (b.permission <= reader.level) {
                                    Logger.log(uid, `Port [${rinfo.address}] ${reader.name}] - user: ${b.user.first_name} ${b.user.last_name}`);
                                    return reader.open();
                                }
                            }
                            Logger.warn(uid, `Not allowed - user: ${b.user.first_name} ${b.user.last_name} - Port [${rinfo.address}] ${reader.name}`)
                            return reader.refuse();
                        }

                        Logger.log(uid, `Not in system - Port [${rinfo.address}] ${reader.name}`);
                    });
                }
            }
        });
    }

    /**
     * checkIfReaderIsDown()
     *
     * @memberof ReadersService
     */
    checkIfReaderIsDown() {

        /**
         * For each reader in the 'config-readers.json' file
         */
        Object.keys(this.server.readers).forEach(ip => {

            /**
             * this.server.readers[ip].forceStop: boolean
             * Sometimes we need to work with a reader (configuration)
             * so we stop it without stopping the server.
             * The reader could not have 2 connections.
             */
            this.server.readers[ip].forceStop = false;
            /**
             * If the reader does not respond when the server sends the connection's frame,
             * we count the times the server tries to connect. After 10 times we force the reader to reboot.
             */
            this.server.readers[ip].countTry = 0;

            switch (this.server.readers[ip].constructor.name) {
                case 'CV_CT9':
                    /**
                     * Every 15 seconds
                     */
                    setInterval(() => {
                        /**
                         * If the reader is not 'force stop'
                         */
                        if (!this.server.readers[ip].forceStop) {
                            /**
                             * And if the last status shows the reader as 'active'
                             */
                            if (this.server.readers[ip].active) {
                                /**
                                 * We send the 'wiegand mode' frame. If somethings goes wrong with the reader
                                 * the status 'active' is going to be 'false', and the next iteration will reboot
                                 * the reader if needed.
                                 */
                                this.server.readers[ip].setWiegandMode(true);
                            }
                        }
                    }, 60000); // 60 seconds

                    /**
                     * Every 5 seconds
                     */
                    setInterval(() => {
                        /**
                         * If the reader is not 'force stop'
                         */
                        if (!this.server.readers[ip].forceStop) {
                            /**
                             * A -  If the reader is not in the middle of the process of rebooting (this.rebooting[ip] == true)
                             * and the reader is not 'active'
                             */
                            if (!this.rebooting[ip] && !this.server.readers[ip].active) {
                                /**
                                 * The reader will be rebooted via ssh
                                 */
                                this.restartCT9(this.server.readers[ip], ip);
                                /**
                                 * and the count of tries (countTry) will be reset.
                                 */
                                this.server.readers[ip].countTry = 0;
                                /**
                                 * B - Else if the reader has been rebooted (this.rebooting[ip] == true)
                                 * and if it continues as 'non active'
                                 */
                            } else if (this.rebooting[ip] && !this.server.readers[ip].active) {
                                /**
                                 * To avoid sending the connection frame every 5 seconds while the reader is rebooting (20 seconds about)
                                 * we check the existence of the 'rebootFlag' variable.
                                 */
                                if (this.server.readers[ip].rebootFlag === undefined) {
                                    /**
                                     * Then we destroy the connection between server and device
                                     */
                                    this.server.readers[ip].disconnect();
                                    console.log(ip + ' socket disconnected');
                                    /**
                                     * And we give a value to the rebootFlag variable (avoiding over sending connection frame)
                                     */
                                    this.server.readers[ip].rebootFlag = true;
                                    console.log(ip + ' connecting');
                                    /**
                                     * We wait about 20 seconds so the reader will have been rebooted
                                     */
                                    setTimeout(() => {
                                        /**
                                         * and then we send the connection frame
                                         */
                                        this.server.readers[ip].connect();
                                        /**
                                         * and unset the rebootFlag variable.
                                         */
                                        this.server.readers[ip].rebootFlag = undefined;
                                    }, 20000); // 20 seconds
                                }
                                /**
                                 * If after the reboot the script keeps looping within this 'else if' statement
                                 */
                                if (this.server.readers[ip].countTry >= 10) {
                                    /**
                                     * we reboot the reader
                                     */
                                    this.restartCT9(this.server.readers[ip], ip);
                                    /**
                                     * and the countTry variable.
                                     */
                                    this.server.readers[ip].countTry = 0;
                                }
                                /**
                                 * Increment of the the countTry variable assigned to each reader.
                                 */
                                this.server.readers[ip].countTry++;
                                /**
                                 * C - The control finishes
                                 */
                            } else {
                                this.rebooting[ip] = false;
                            }
                        }
                    }, 15000); // 15 seconds

                    break;
                case 'CV_CN56':
                    /**
                     * Every 15 seconds
                     */
                    setInterval(() => {
                        /**
                         * If the reader is not 'force stop'
                         */
                        if (!this.server.readers[ip].forceStop) {
                            /**
                             * We set the rebooting flag to true. So if we do not get the value from reader device,
                             * it means it is not active
                             */
                            this.rebooting[ip] = false;
                            /**
                             * Before sending the wiegand mode frame to know if the reader is active,
                             * we keep the actual 'seq' segment of the frame (see civintecreader module for more information).
                             * The 'seq' segment we send is going to be the same one we get from the response frame. Doing that
                             * we are sure that the response we get belongs to the answer we send.
                             */
                            let seq = this.server.readers[ip].seq;
                            this.server.readers[ip].setWiegandMode();
                            /**
                             * The we listen for the reader events, if nothing happens it means the reader is not responding
                             */
                            this.server.readers[ip].readerEvent$
                                .pipe(
                                    first(),
                                    map((res: any) => {
                                        /**
                                         * When we get the response we split it into its parts
                                         */
                                        let detailRes = this.server.readers[ip].getNormalFrameDetail(res.data.toString('hex'));
                                        /**
                                         * If the 'seq' we get is the same as the one we store,
                                         * and the status is '00'
                                         */
                                        if (seq == detailRes.seq && detailRes.status === '00') {
                                            /**
                                             * It means the reader is active
                                             */
                                            return true;
                                        }
                                        /**
                                         * Otherwise is not active
                                         */
                                        return false;
                                    })
                                )
                                .subscribe(
                                    (res) => {
                                        this.rebooting[ip] = !res;
                                    }
                                );
                        }

                    }, 15000); // 15 seconds

                    /**
                     * Every 10 seconds
                     */
                    setInterval(() => {
                        if (!this.server.readers[ip].forceStop) {
                            if (this.rebooting[ip] !== undefined) {
                                /**
                                 * We read the last status of the reader to know if is active.
                                 */
                                this.server.readers[ip].active = !this.rebooting[ip];
                            }
                        }
                    }, 10000); // 10 seconds

                    break;

                default:
                    break;
            }

        });
    }

    /**
     * restartCT9()
     * Send reboot command to the reader via ssh
     *
     * @param {CV_CT9} ct9Reader
     * @param {string} ip
     * @memberof ReadersService
     */
    restartCT9(ct9Reader: CV_CT9, ip: string) {
        this.rebooting[ip] = true;
        console.log(ip + ' rebooting');
        let { spawn } = require('child_process');
        let reset = spawn('ssh', ['root@' + ip, '/sbin/reboot']);
    }

    /**
     * forceStopReader()
     * Change the 'forceStop' variable to 'true' and the 'active' to 'false'.
     * Disconnect the socket.
     *
     * @param {string} ip
     * @memberof ReadersService
     */
    forceStopReader(ip: string): void {
        let reader = this.server.readers[ip];
        reader.forceStop = true;
        reader.active = false;
        reader.disconnect();
    }

    /**
     * reconnectReader()
     * Change the 'forceStop' variable to 'true'.
     * Re-create the socket (connection between server and device)
     *
     * @param {string} ip
     * @memberof ReadersService
     */
    reconnectReader(ip: string): void {
        let reader = this.server.readers[ip];
        reader.forceStop = false;
        reader.connect();
    }

    /**
     * getAllReadersStatus()
     * Return un object with all the readers configured in the server and its 'active' status.
     *
     * @returns
     * @memberof ReadersService
     */
    getAllReadersStatus(): {} {
        let readers = {};
        Object.keys(this.server.readers).forEach(ip => {
            let name = this.server.config.readersConfig.filter(r => r.ip === ip)[0].name;
            readers[ip] = { "active": this.server.readers[ip].active, "name": name, 'type': this.server.readers[ip].constructor.name };
        });
        return readers;
    }

    /**
     * open()
     * Call service to send open frame to device
     * @param {string} ip
     * @memberof ReadersService
     */
    open(ip: string): void {
        let reader = this.server.readers[ip];
        reader.open();
    }

    /**
     * resetReader()
     * Sometimes (maybe due to vibrations when closing the door) the reader triggers the tamper alarm
     * and it looses its configuration (specially the number of bytes to read from card).
     * This function allows to re-set the configurations parameters.
     *
     * @param {string} ip
     * @memberof ReadersService
     */
    resetReaderCT9(ip: string): void {
        let config = {
            'tamperOff': '02b07f2d020001e103',
            'tamperOutputOff': '02c07f2d030005019503',
            'GPIO1': '02d07fee0203000500000000004503',
            'readCard': '02e07f230a00000000000000010000b703',
            'rs485Interface': '02f07f4e03000500c703',
            'antennaSwitch': '02807fee0204000200001503',
            '125kLFchip': '02907fee02050004000000000203',
            'dataBlock1': '02a07f4f2400007a00001a00001a000000100000110000000010000011000000001000001100000000cf03'
        };

        Object.keys(config).forEach((label, i) => {
            /**
             * setTimeout to wait 1.5 seconds between frames,
             * otherwise some of them could not be processed.
             */
            setTimeout(() => {
                let bufferFrame = Buffer.from(config[label], 'hex');
                this.server.readers[ip].sendFrame(bufferFrame)
                console.log('Reader reset' + ip + ' > ' + label);
            }, i * 1500);
        });
    }

    /**
     * Sometimes (maybe due to vibrations when closing the door) the reader triggers the tamper alarm
     * and it looses its configuration.
     * This function allows to re-set the configurations parameters.
     *
     * @param {string} ip
     * @memberof ReadersService
     */
    resetReaderCN56(ip: string): void {
        const reader = this.server.readers[ip];
        const resetBuffer = Buffer.from('02c000190100d803', 'hex');
        reader.sendFrame(reader.ip, reader.port, resetBuffer);
    }
}
