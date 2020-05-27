const path = require('path');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGifsicle = require('imagemin-gifsicle');

const argv = process.argv.filter(item => /^catalogPath\=/.test(item))[0];
//如果未传入指定参数，提示， 并终止任务
if (!argv) {
  console.log('-> 请检查是否注入了catalogPath参数（示例：node index.js catalogPath=/Users/xxx/xxx/项目目录）');
  return;
}
//获取执行任务的路径
const catalogPath = argv.split('=')[1];
console.log('------------------------ 开始执行图片无损压缩任务 ------------------------\n\n');
console.log(`-> 本次无损压缩任务目录为：${catalogPath}\n`);
//图片无损压缩函数
(async () => {
  //存放压缩前的图片体积
  let beforeSizeList = [];
  //存放压缩后的图片体积
  let afterSizeList = [];
  //字节转kb方法
  const byteToKb = (byte) => {
    return `${(byte / 1024).toFixed(2)}kb`;
  }
  //遍历某个文件夹下所有的XX文件
  async function findImageAndLetItSmall({
    catalogPath,
    EXT_NAME = /^\.(jpg|jpeg|png|gif)$/i
  }) {
    const pathList = fs.readdirSync(catalogPath);
    for (let i = 0; i < pathList.length; i++) {
      //生成子文件、子目录的路径， 等待二次遍历确认
      const childCatalogOrFilePath = path.join(catalogPath, pathList[i]);
      //根据文件路径获取文件信息，返回一个fs.Stats对象
      const statInfo = fs.statSync(childCatalogOrFilePath);
      if (statInfo.isDirectory()) {
        await findImageAndLetItSmall({
          catalogPath: childCatalogOrFilePath,
          EXT_NAME
        });
      } else {
        if (EXT_NAME.test(path.extname(childCatalogOrFilePath))) {
          //如果此文件为图片，对此文件进行压缩替换
          const beforeSize = fs.statSync(childCatalogOrFilePath).size;
          //统计压缩前size
          beforeSizeList = [...beforeSizeList, beforeSize];
          console.log(`${childCatalogOrFilePath} -> 正在无损压缩(压缩前体积：${byteToKb(beforeSize)})`);
          await imagemin([childCatalogOrFilePath], {
            destination: catalogPath,
            plugins: [
              imageminMozjpeg({
                quality: 80, //质量过低， 会影响图片的视觉质量
              }),
              imageminPngquant({
                quality: [0.6, 0.7]
              }),
              imageminGifsicle({
                quality: 80
              })
            ]
          });
          const afterSize = fs.statSync(childCatalogOrFilePath).size;

          afterSizeList = [...afterSizeList, afterSize];
          console.log(`${childCatalogOrFilePath} -> 压缩完成（压缩后体积：${byteToKb(afterSize)}）\n`);
        }
      }
    }
  }

  await findImageAndLetItSmall({
    catalogPath
  });
  if (!beforeSizeList.length) {
    console.log(`-> 任务目录下未检测到gif、png、jpg、jpeg等图片！\n`);
    console.log('------------------------ 任务正常终止, 再见~ ------------------------');
    return;
  }
  //压缩前总体积
  const beforeSizeCount = beforeSizeList.reduce((cur, sum) => cur + sum);
  //压缩后总体积
  const afterSizeCount = afterSizeList.reduce((cur, sum) => cur + sum);
  //压缩掉的体积
  const saveCount = beforeSizeCount - afterSizeCount;

  console.log(`-> 共压缩图片${beforeSizeList.length}张`);
  console.log(`-> 压缩前总体积${byteToKb(beforeSizeCount)}`);
  console.log(`-> 压缩后总体积${byteToKb(afterSizeCount)}`);
  console.log(`-> 节约体积${(saveCount * 100 / beforeSizeCount).toFixed(2)}%（共${byteToKb(saveCount)}）\n\n`);
  console.log('------------------------ 图片无损压缩任务执行完毕 ------------------------');
})();