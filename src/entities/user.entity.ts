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

import { Entity, Column, OneToMany } from 'typeorm';

import { AbstractEntity } from './abstract-entity';
import { BadgeEntity } from './badge.entity';
import { IsEmail } from 'class-validator';
import { Exclude } from 'class-transformer';

@Entity('users')
export class UserEntity extends AbstractEntity {
  @Column({length: 50})
  first_name: string;

  @Column({length: 50})
  last_name: string;

  @Column({length: 50, unique: true})
  @IsEmail()
  email: string;

  @Column({ type: 'int2' })
  type: Number;

  @Column({ nullable: true })
  ldp_id: number;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @OneToMany(
    type => BadgeEntity,
    badge => badge.user)
  badges: BadgeEntity[];

}
