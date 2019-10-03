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

import { Controller, Get, UseGuards, Post, Body, Query, Optional, Param, Put, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiProperty, ApiOkResponse, ApiQuery, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsNumber, IsOptional } from 'class-validator';
import { UsersService, User } from './users.service';
import { UserEntity } from '../entities/user.entity';
import { CreateBadgeDTO } from '../badges/badges.controller';

export class CreateUserDTO {
    @ApiProperty()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsOptional()
    ldp_id: number;

    @ApiProperty()
    @IsOptional()
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    type: number;

    @ApiProperty()
    @IsOptional()
    disabled: boolean;

    @ApiProperty()
    @IsOptional()
    badges: CreateBadgeDTO[];
}

export class ListUserDTO {
    @Optional()
    disabled: boolean;
}
export class UuidDTO {
    // @IsUUID('all')
    id: string;
}
export class UpdateUserDto {
    @ApiProperty()
    @IsOptional()
    first_name: string;

    @ApiProperty()
    @IsOptional()
    last_name: string;

    @ApiProperty()
    @IsOptional()
    email: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    type: Number;
}

@Controller()
export class UsersController {

    constructor(
        private userService: UsersService
    ){}

    @Post('user/create')
    @ApiTags('Users')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(
        @Body() createUserDTO: CreateUserDTO
    ) {
        return this.userService.create(createUserDTO);
    }

    @Post('users/batchCreation')
    @ApiTags('Users')
    @UseGuards(JwtAuthGuard)
    @ApiBody({type: CreateUserDTO})
    @ApiBearerAuth()
    batchCreation(
        @Body() createBatchDTO: UserEntity[]
    ) {
        return this.userService.createBatch(createBatchDTO);
    }

    @Get('users/list/:disabled?')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Get user list' })
    @ApiTags('Users')
    @ApiQuery({name: 'disabled', required: false, type: Boolean})
    async listUsers(
        @Query('disabled') disabled: ListUserDTO
    ): Promise<UserEntity[]> {
        if (disabled === undefined) {
            return this.userService.findAll({relations: ['badges']});
        } else {
            return this.userService.findAll({where: {disabled: disabled}, relations: ['badges']});        }

    }

    @Get('user/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Get user by id' })
    @ApiTags('Users')
    @ApiParam({name: 'id', required: true, type: String, example: '127e8dd3-d42a-44ca-9818-2d31a13d4c50', description : 'UUID'})
    async getUser(
        @Param('id') id: UuidDTO
    ): Promise<UserEntity[]> {
        return this.userService.findOne({where: {id}, relations: ['badges']});
    }

    @Put('user/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Update user' })
    @ApiTags('Users')
    @ApiParam({name: 'id', required: true, type: String, example: '127e8dd3-d42a-44ca-9818-2d31a13d4c50', description : 'UUID'})
    @ApiBody({type: UpdateUserDto})
    update(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDTO>) {
      return this.userService.update(id, updateUserDto);
    }

    @Delete('user/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: 'Delete user' })
    @ApiTags('Users')
    remove(@Param('id') id: string) {
      return this.userService.disable(id);
    }
}
