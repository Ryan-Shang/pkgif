#!/bin/sh
# dump 命令执行路径，根据mongodb安装路径而定
DUMP=/usr/bin/mongodump
# 临时备份路径
OUT_DIR=/home/backup/mongod_bak/mongod_bak_now
# 压缩后的备份存放路径
TAR_DIR=/home/backup/mongod_bak/mongod_bak_list
# 当前系统时间
DATE=`date +%Y-%m-%d`
# 数据库库名
DB=prod
# 数据库账号
DB_USER=root
# 数据库密码
DB_PASS=wooden2018earspro
# 代表删除7天前的备份，即只保留近 7 天的备份
DAYS=7
# 最终保存的数据库备份文件
TAR_BAK="mongod_bak_$DATE.tar.gz"
cd $OUT_DIR
rm -rf $OUT_DIR/*
mkdir -p $OUT_DIR/$DATE
$DUMP -h 127.0.0.1:27017 -u $DB_USER -p $DB_PASS --authenticationDatabase=admin -d $DB -o $OUT_DIR/$DATE
# 压缩格式为 .tar.gz 格式
tar -zcvf $TAR_DIR/$TAR_BAK $OUT_DIR/$DATE
# 删除 15 天前的备份文件
find $TAR_DIR/ -mtime +$DAYS -delete

exit