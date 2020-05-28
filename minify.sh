echo "-> 图片无损压缩任务启动";
targetPath="$1";
echo "-> 目标任务目录：${targetPath}\n";
echo '-> 任务目录有效性检测\n';
#优先检测任务目录的有效性
if [ ! -d "${targetPath}" ] ;then
  echo '----------------------------';
  echo '-> WARNING: 目录参数异常（ x ）';
  echo '-> 1.请检查任务目录路径是否正确';
  echo '----------------------------';
  echo '-> 任务终止';
  exit;
else
  echo '----------------------------';
  echo '-> SUCCESS: 任务目录有效（ √ ）';
  echo '----------------------------';
fi;
echo '-> 无损压缩工具状态检测';
#检测压缩工具包是否存在
if [ ! -d ~/fe_dev_tools/img_minify ]; then
  echo '-> DOWLOADING: 本地不存在无损压缩工具-开始下载脚本';
  #如果没有fe_dev_tools目录， 则先创建这个目录
  if [ ! -d ~/fe_dev_tools ]; then
    mkdir ~/fe_dev_tools;
  fi;
  #创建图片压缩工具包目录
  mkdir ~/fe_dev_tools/img_minify;
  echo "-> DOWLOADING: 脚本根目录创建成功";
  #克隆工具包代码到本地
  git clone --depth=1 https://github.com/fanchong02/img-minify-tool.git ~/fe_dev_tools/img_minify;
  echo "-> DOWLOADING: 脚本下载完成";
  #安装工具包依赖
  echo "-> DOWLOADING: 脚本依赖安装";
  cd ~/fe_dev_tools/img_minify && yarn install;
  echo "-> DOWLOADING: 脚本依赖安装完成";
else
  echo '-> UPDATE: 本地已存在无损压缩工具';
  echo '-> UPDATE: 尝试脚本更新\n';
  cd ~/fe_dev_tools/img_minify;
  git pull && yarn install;
  echo '-> UPDATE: 更新完毕\n';
fi;
#node 执行无损压缩任务
node index.js --bundlePath=${bundlePath};