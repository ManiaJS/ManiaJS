# ManiaJS

# This project has been discontinued. Please check PyPlanet as an alternative: http://pypla.net

http://pypla.net

[![Join the chat at https://gitter.im/ManiaJS/ManiaJS](https://badges.gitter.im/ManiaJS/ManiaJS.svg)](https://gitter.im/ManiaJS/ManiaJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Dependency Status](https://www.versioneye.com/user/projects/56bc63ef2a29ed0034380562/badge.svg?style=flat)](https://www.versioneye.com/user/projects/56bc63ef2a29ed0034380562)
[![Build Status](https://travis-ci.org/ManiaJS/ManiaJS.svg?branch=master)](https://travis-ci.org/ManiaJS/ManiaJS)
[![NodeJS Version](https://img.shields.io/badge/NodeJS-4.0%2B-80bd01.svg)]()
[![GitHub license](https://img.shields.io/badge/license-ISC-blue.svg)](https://raw.githubusercontent.com/ManiaJS/ManiaJS/master/LICENSE)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/544e53fcf34f40b3abe97536d400db81)](https://www.codacy.com/app/tomvalk/ManiaJS?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ManiaJS/ManiaJS&amp;utm_campaign=Badge_Grade)
[![Code Climate](https://codeclimate.com/github/ManiaJS/ManiaJS/badges/gpa.svg)](https://codeclimate.com/github/ManiaJS/ManiaJS)


# Requirements

Requirements for running the controller

- [x] Linux, Windows or Mac operating system
- [x] Buildtools installed (gcc, g++, make), Visual Studio (free version is okay) for Windows users, xCode for Mac users.
      You can try to install without build tools first, mostly it will have no problems at all.
- [x] ManiaPlanet Dedicated Server at the same server (or having a exact same mounting point locally to access the server files.
- [x] NodeJS >= V4. Instructions are below.
- [x] npm >= 3, will be preinstalled by default when installing node >= V4.
- [x] MySQL (or MariaDB), MSSQL, SQLite, PostgreSQL server/file.

# Installation

**Developer information! Not yet production ready structure!! A CLI tool is in development to init and manage ManiaJS installations the right way!**

1. Follow the [installation instructions for installing NodeSource](https://github.com/nodesource/distributions#debinstall)
2. Make sure NodeJS has been succesfully installed (check `npm -v`)
3. Clone the git repository (`git clone https://github.com/ManiaJS/ManiaJS.git` via git, or download the zip)
4. Move the `config.dist.yaml` to `config.yaml` and make sure to enter all information in that file
5. Install all dependencies by using: `npm install`. This can take some time.

# Getting started

**A CLI tool is in development to init and manage ManiaJS installations!**

To start the controller, open a terminal in the installation folder and run the following command:

```
npm start
```

(run npm install after installing, before executing npm start)
