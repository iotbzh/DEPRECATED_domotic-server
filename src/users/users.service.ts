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

import { Injectable, InternalServerErrorException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './users.controller';
import { BadgeEntity } from '../entities/badge.entity';

export type User = any;

@Injectable()
export class UsersService {


  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(BadgeEntity)
    private badgesRepository: Repository<BadgeEntity>
  ) { }

  findAll(options?: any): Promise<UserEntity[]> {
    return this.usersRepository.find(options);
  }

  findOne(options?: any): Promise<User> {
    return this.usersRepository.findOne(options);
  }

  async disable(id: string): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { id },
      relations: ['badges']
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.disabled = true;
    user.badges.forEach((badge: BadgeEntity) => {
      badge.disabled = true;
      this.badgesRepository.update(badge.id, badge);

    });
    return await this.usersRepository.update(id, user);
  }

  async create(user: CreateUserDTO) {
    try {
      const newU = this.usersRepository.create(user);
      newU.save();

    } catch (error) {
      throw new InternalServerErrorException('Error in User creation');
    }
  }

  async createBatch(users: UserEntity[]) {
    await users.forEach((user: UserEntity) => {
      const newU = this.usersRepository.create(user);
      newU.save()
        .then((u: UserEntity) => {
          user = u;
        }).finally(() => {
          this.badgesRepository.create(user.badges).map((b:BadgeEntity) => {
            b.user = user;
            b.save()
          });
        });
    });
  }

  async update(id: string, userDto: Partial<CreateUserDTO>) {

    let user = await this.usersRepository.findOne({
      where: { id }
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return await this.usersRepository.update(id, userDto);

  }
}
