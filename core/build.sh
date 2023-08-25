arg1=$1
thisPath=$(cd "$(dirname "$0")";pwd);
cd $thisPath/code
npm install --registry=https://registry.npm.taobao.org
err=$?
if [ $err -ne 0 ]; then
    echo !!!!!! build failed !!!!!!
    exit $err
fi
tscp=$thisPath/code/node_modules/.bin/tsc-plus
$tscp --version
err=$?
if [ $err -ne 0 ]; then
    echo !!!!!! build failed !!!!!!
    exit $err
fi
if [ "$arg1" = "-p" ]; then
    $tscp --reorderFiles -p $thisPath/code/tsconfig.json --sourceMap false --inlineSourceMap false --inlineSources false
else
    $tscp --reorderFiles -p $thisPath/code/tsconfig.json
fi
err=$?
if [ $err -ne 0 ]; then
    echo !!!!!! build failed !!!!!!
    exit $err
fi
if [ ! -f "$thisPath/code/config/serverConfig.js" ]; then
    if [ -f "$thisPath/code/config/serverConfig.bak.js" ]; then
        cp -f $thisPath/code/config/serverConfig.bak.js $thisPath/code/config/serverConfig.js
    fi
fi
err=$?
if [ $err -ne 0 ]; then
    echo !!!!!! build failed !!!!!!
    exit $err
fi
echo ====== build success ======