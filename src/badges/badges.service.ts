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

import { Injectable, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BadgeEntity } from '../entities/badge.entity';
import { Repository } from 'typeorm';
import { CreateBadgeDTO } from './badges.controller';

@Injectable()
export class BadgesService {

    constructor(
        @InjectRepository(BadgeEntity)
        private badgeRepository: Repository<BadgeEntity>
    ) { }

    async create(badge: CreateBadgeDTO) {
        try {
            const newB = this.badgeRepository.create(badge);
            return await newB.save();

        } catch (error) {
            throw new InternalServerErrorException('Error in Badge creation');
        }

    }

    findAll(options?: any): Promise<BadgeEntity[]> {
        return this.badgeRepository.find(options);
    }

    /**
     * Options example: '{ relations: ['user'], where: { uid, disabled: false } }'
     *
     * @param {*} [options]
     * @returns {Promise<BadgeEntity>}
     * @memberof BadgesService
     */
    findOne(options?: any): Promise<BadgeEntity> {
        return this.badgeRepository.findOne(options);
    }

    async update(uid: string, badgeDto: Partial<CreateBadgeDTO>) {

        let badge = await this.badgeRepository.findOne({
            where: { uid }
        });
        if (!badge) {
            throw new HttpException('Badge not found', HttpStatus.NOT_FOUND);
        }
        return await this.badgeRepository.update(badge.id, badgeDto);

    }

    async disable(uid: string): Promise<any> {
        let badge = await this.badgeRepository.findOne({
            where: { uid }
        });
        if (!badge) {
            throw new HttpException('Badge not found', HttpStatus.NOT_FOUND);
        }
        badge.disabled = true;
        return await this.badgeRepository.update(badge.id, badge);
    }

    async delete(uid: string): Promise<any> {
        let badge = await this.badgeRepository.findOne({
            where: { uid }
        });
        if (!badge) {
            throw new HttpException('Badge not found', HttpStatus.NOT_FOUND);
        }
        badge.disabled = true;
        return await this.badgeRepository.delete(badge.id);
    }
}
