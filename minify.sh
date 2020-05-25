echo '-> 任务目录有效性检测';
#优先检测任务目录的有效性
if [ ! -d "$1" ] ;then
  echo "-> 传入任务目录：$1"
  echo '-> WARNING: 目录参数异常（ x ）';
  echo '1.请检查是否注入了「 任务目录 」参数（示例：sh minify.sh /Users/xxx/xxx/your_project）\n2.请检查任务目录是否存在';
  exit;
else
  echo '-> SUCCESS: 任务目录有效（ √ ）\n';
fi
echo '-> 无损压缩工具状态检测'
#检测压缩工具包是否存在
if [ ! -d ~/fc_dev_tools/imgminify ]; then
  echo '-> DOWLOADING: 本地不存在无损压缩工具-开始下载\n';
  #如果没有fc_dev_tools目录， 则先创建这个目录
  if [ ! -d ~/fc_dev_tools ]; then
    mkdir ~/fc_dev_tools
  fi
  #创建图片压缩工具包目录
  mkdir ~/fc_dev_tools/imgminify;
  #克隆工具包代码到本地
  git clone https://github.com/fanchong02/img-minify-tool.git ~/fc_dev_tools/imgminify;
  #安装工具包依赖
  cd ~/fc_dev_tools/imgminify && yarn;
else
  echo '-> UPDATE: 本地已存在无损压缩工具';
  echo '-> UPDATE: 尝试工具更新\n';
  cd ~/fc_dev_tools/imgminify;
  git pull && yarn;
  echo '-> UPDATE: 更新完毕\n';
fi
#node 执行无损压缩任务
node index catalogPath="$1";