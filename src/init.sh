#!/bin/bash

VERSION=`node -v`
VERSION_MAX="v9.0.0"

function version_gt() {
    test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$1"; 
}

if version_gt $VERSION $VERSION_MAX;
then
   echo "初始化失败！nodejs版本推荐使用v8.x版本，兼容性更好！"
   exit 1
fi

cd ../
rm -rf dep src
if [ ! -d "tools" ];
then
    echo "下载fe-tools代码库中..."
    git clone ssh地址/fe-tools tools
    echo "fe-tools下载成功并已更名为tools"
fi

if [ ! -d "mockup" ];
then
    echo "下载fe-mockup代码库中..."
    git clone ssh地址/fe-mockup mockup
    cd mockup && git checkout mockup_private
    cd ../
    echo "fe-mockup下载成功并已更名为mockup"
fi

if [ ! -d "fe-base" ];
then
    echo "下载fe-base代码库中..."
    git clone ssh地址/fe-base fe-base
    echo "fe-base下载成功"
fi

if [ ! -d "fe-common" ];
then
    echo "下载fe-common代码库中..."
    git clone ssh地址/fe-common fe-common
    echo "fe-common下载成功"
fi

echo "太好啦！本地开发依赖的公共资源都已经准备就绪！"

ln -s fe-base/dep dep
mkdir src
cd src
ln -s ../fe-common common
if [ ! -n "$1" ];
then
    echo '检测到您未传入业务代码库名称（如：sh init.sh bcc dcc），请下载代码库后自行创建软链接'
else
    for arg in $*
    do
        if [ -d "../console-${arg}" ];
        then
            ln -s ../console-$arg/fe_source $arg
        fi
    done
fi
cd ../tools
npm install
echo "开发环境初始化成功！执行sh server.sh启动项目吧！"