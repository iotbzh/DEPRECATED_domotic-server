###########################################################################
#
# Copyright (C) 2020-2021 IoT.bzh Company
# Contact: https://www.iot.bzh/licensing
#
# This file is part of the domotic-server module of the IoT.bzh project.
#
# $CV_BEGIN_LICENSE$
# Commercial License Usage
#  Licensees holding valid commercial IoT.bzh licenses may use this file in
#  accordance with the commercial license agreement provided with the
#  Software or, alternatively, in accordance with the terms contained in
#  a written agreement between you and The IoT.bzh Company. For licensing terms
#  and conditions see https://www.iot.bzh/terms-conditions. For further
#  information use the contact form at https://www.iot.bzh/contact.
#
# GNU General Public License Usage
#  Alternatively, this file may be used under the terms of the GNU General
#  Public license version 3. This license is as published by the Free Software
#  Foundation and appearing in the file LICENSE.GPLv3 included in the packaging
#  of this file. Please review the following information to ensure the GNU
#  General Public License requirements will be met
#  https://www.gnu.org/licenses/gpl-3.0.html.
# $CV_END_LICENSE$
#
###########################################################################

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
ROOT_SRCDIR := $(patsubst %/,%,$(dir $(mkfile_path)))


all: deps-force build-backend build-frontend

setup: deps-force
	docker-compose up -d
	npm run typeorm migration:run

deps-force:
	npm install && (cd client && npm install)

deps:
	@if [ ! -d ${ROOT_SRCDIR}/node_modules ]; then npm install; fi
	@if [ ! -d ${ROOT_SRCDIR}/client/node_modules ]; then (cd client && npm install); fi

build-backend: deps
	npm run build

build-frontend: deps
	(cd client && npm run build:prod)

devb dev-backend: deps
	npm run start:dev

devf dev-frontend: deps
	(cd client && npm run start:dev)

clean:
	npm run prebuild

distclean: clean
	rm -rf ${ROOT_SRCDIR}/node_modules
	rm -rf ${ROOT_SRCDIR}/client/node_modules
