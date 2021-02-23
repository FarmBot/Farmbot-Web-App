This document will be kept in source control, but removed from the project root directory on August 23rd 2021. Please upgrade before that time.

# Upgrading to FarmBot v13

Version 13 of the FarmBot Web App features a new version of PostgreSQL. Upgrading to this version of Postgres cannot be done automatically. **Your server will stop working if you skip these steps.**

**Read each step carefully. Do not perform steps if you do not understand the instruction.**

# Intro: Why? What's a Docker Volume?

The Web App uses [Docker](https://www.docker.com/) to create a virtualized Linux environment. Docker containers do not store data to disk after they are closed and instead, Docker uses must ["mount a volume"](https://docs.docker.com/storage/volumes/) to their running Docker containers for persistence. In our case, we store PostgreSQL data in a Docker volume, but the data is in an outdated format that needs to be transformed, otherwise the upgrade to v13 will fail.

Our upgrade strategy is as follows:

 * Create a database backup (`dump.sql`, covered later).
 * Delete all Docker volumes (`docker_volumes/` directory).
 * Upgrade the database.
 * Restore previous database contents from the backup.

# Part Zero: Backup docker_volumes/ Directory

:zap: Any mistake made during the database migration can result
in **COMPLETE DATA LOSS**. Be sure to put your `docker_volumes/`
directory into a *.zip file for backup in case something
goes wrong. You can delete the corrupted `docker_volumes/`
directory and start over if anything fails.

**ALL INSTRUCTIONS BELOW ASSUME YOU ARE WITHIN THE FARMBOT
WEB APP PROJECT DIRECTORY.**

# Part One: Create the DB Dump

Ensure you are running the latest v12 release before proceeding to v13:

```shell
git reset 03bc203 --hard
```

Create a database dump file (`dump.sql`):

```shell
sudo docker-compose exec db pg_dumpall -U postgres > dump.sql
```

!DANGER!: We're going to delete the entire database volume. All data will be lost if you did not create a `dump.sql` file:

```shell
sudo rm -rf docker_volumes/
mkdir docker_volumes/
mkdir docker_volumes/db
```

If you have been running a server for a very long time, you may also want to delete some unused directories that are no longer needed. Newer servers do not have these files, so there is nothing to delete.

```shell
rm -rf public/system
rm -f config/application.yml
rm -rf coverage/
rm -rf mqtt/
```

# Part Two: Pull Down v13 Changes

```shell
git pull origin main
sudo docker-compose run web gem install bundler
sudo docker-compose run web bundle install
```

# Part Three: Repopulate Database

First, enter a Bash prompt in the PostgreSQL container:
**FISH SHELL USERS**, RUN THIS INSTEAD: `sudo docker-compose run -v (pwd):/farmbot db bash`

```shell
sudo docker-compose run -v $(pwd):/farmbot db bash
```

Next, load the `dump.sql` file from the previous steps into the new (PostgreSQL 13) container:

```shell
# This happens inside a container, not the host machine!
cd /farmbot
PGPASSWORD=$POSTGRES_PASSWORD psql -U postgres -h db < dump.sql
exit
```

# Part Four: Verify Installation

You should be ready to use the server again!

```shell
sudo docker-compose up
```

Please [raise an issue on GitHub](https://github.com/FarmBot/Farmbot-Web-App/issues/new?title=FBOS%20v13%20Upgrade%20Issues) if you experience issues during the upgrade. Please note that **support provided for self hosting is on a "best effort" basis**.
