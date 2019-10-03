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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from 'app/auth/login.service';
import { Observable } from 'rxjs';
import { mergeMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BadgesService {

  constructor(private http: HttpClient, private loginService: LoginService) { }

  getBadges(): Observable<any> {

    return this.loginService.checkLogin().pipe(
      mergeMap(() => {
        const options: any = {};
        options.headers = new HttpHeaders()
          .set('content-type', 'application/json')
          .set('Authorization', 'Bearer ' + this.loginService.token);

        return this.http.get('/api/badges/list', options);
      }),
    );
  }
}
