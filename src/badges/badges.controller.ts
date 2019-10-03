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

import { Controller, Post, UseGuards, Body, Get, Query, Param, Delete, Put } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { ApiTags, ApiBearerAuth, ApiProperty, ApiOkResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { UserEntity } from '../entities/user.entity';
import { BadgeEntity } from '../entities/badge.entity';
import { Transform } from 'class-transformer';

export class CreateBadgeDTO {
    @ApiProperty()
    @IsNotEmpty()
    uid: string;

    @ApiProperty()
    @IsNotEmpty()
    permission: number;

    @ApiProperty()
    @IsNotEmpty()
    user: UserEntity;

}

export class OptionalDTO {
    @IsOptional()
    @IsBoolean()
    @Transform((val: string) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return val;
    })
    sorted: boolean;
}

@Controller()
export class BadgesController {

    constructor(
        private badgeService: BadgesService
    ) { }

    @Post('badge/create')
    @ApiTags('Badges')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(
        @Body() createBadgeDTO: CreateBadgeDTO
    ) {
        return this.badgeService.create(createBadgeDTO);
    }

    @Get('badges/list/:disable?')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Get badge list' })
    @ApiTags('Badges')
    @ApiQuery({ name: 'disabled', required: false, type: Boolean })
    async listBadges(
        @Query('disabled') disabled: boolean
    ): Promise<BadgeEntity[]> {
        if (disabled === undefined) {
            return this.badgeService.findAll({ relations: ['user'] });
        } else {
            return this.badgeService.findAll({ where: { disabled: disabled }, relations: ['user'] });
        }

    }

    @Get('badge/:uid')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Get badge by badge uid' })
    @ApiTags('Badges')
    @ApiParam({ name: 'uid', required: true, type: String, example: '127e8dd3', description: 'Badge UID (block 0)' })
    async getBadge(
        @Param('uid') uid: string
    ): Promise<BadgeEntity> {
        return await this.badgeService.findOne({ relations: ['user'], where: { uid } });

    }

    @Put('badge/:uid')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Update badge' })
    @ApiTags('Badges')
    @ApiParam({ name: 'uid', required: true, type: String, example: 'aed4d9d1', description: 'UID' })
    @ApiBody({ type: CreateBadgeDTO })
    update(@Param('uid') uid: string, @Body() updateBadgeDto: Partial<CreateBadgeDTO>) {
        return this.badgeService.update(uid, updateBadgeDto);
    }

    @Delete('badge/:uid/:remove?')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Delete badge' })
    @ApiTags('Badges')
    @ApiQuery({ name: 'remove', required: false, type: Boolean })
    remove(
        @Query('remove') remove: boolean,
        @Param('uid') uid: string,
    ) {
        if (remove) {
            return this.badgeService.delete(uid);
        }
        return this.badgeService.disable(uid);
    }
}
