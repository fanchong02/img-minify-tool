const path = require('path');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGifsicle = require('imagemin-gifsicle');
const params = require('minimist')(process.argv.slice(2));

//获取执行任务的路径
const {
  bundlePath
} = params;
console.log('------------------------ 开始执行图片压缩任务 ------------------------\n');
console.log(`-> 本次压缩任务目录为：${bundlePath}\n`);
//图片压缩函数
(async () => {
  //存放压缩前的图片体积
  let beforeSizeList = [];
  //存放压缩后的图片体积
  let afterSizeList = [];
  //字节转kb方法
  const byteToKb = (byte, unit = 'KB') => {
    return `${(byte / 1024).toFixed(2)}${unit}`;
  }
  const savedSizeRate = (beforeSize, afterSize, unit = '%') => {
    const savedRate = (beforeSize - afterSize) * 100 / beforeSize;
    return `${savedRate.toFixed(1)}${unit}`;
  }
  //遍历某个文件夹下所有的XX文件
  async function findImageAndLetItSmall({
    bundlePath,
    EXT_NAME = /^\.(jpg|jpeg|png|gif)$/i
  }) {
    const pathList = fs.readdirSync(bundlePath);
    for (let i = 0; i < pathList.length; i++) {
      //生成子文件、子目录的路径， 等待二次遍历确认
      const childCatalogOrFilePath = path.join(bundlePath, pathList[i]);
      //根据文件路径获取文件信息，返回一个fs.Stats对象
      const statInfo = fs.statSync(childCatalogOrFilePath);
      if (statInfo.isDirectory()) {
        await findImageAndLetItSmall({
          bundlePath: childCatalogOrFilePath,
          EXT_NAME
        });
      } else {
        if (EXT_NAME.test(path.extname(childCatalogOrFilePath))) {
          //如果此文件为图片，对此文件进行压缩替换
          const beforeSize = statInfo.size;
          //统计压缩前size
          beforeSizeList = [...beforeSizeList, beforeSize];
          await imagemin([childCatalogOrFilePath], {
            destination: bundlePath,
            plugins: [
              imageminMozjpeg({
                quality: 80, //质量过低， 会影响图片的视觉质量
                smooth: 90
              }),
              imageminPngquant({
                quality: [0.9, 0.95],
                speed: 1, //强力
                strip: true,
              }),
              imageminGifsicle({
                interlaced: true, //隔行扫描
                quality: 90
              })
            ]
          });
          const afterSize = fs.statSync(childCatalogOrFilePath).size;

          afterSizeList = [...afterSizeList, afterSize];
          console.log(`${childCatalogOrFilePath} -> 压缩完成（${byteToKb(beforeSize)} => ${byteToKb(afterSize)}[-${savedSizeRate(beforeSize, afterSize)}]）`);
        }
      }
    }
  }

  await findImageAndLetItSmall({
    bundlePath
  });
  if (!beforeSizeList.length) {
    console.log(`-> 任务目录下未检测到gif、png、jpg、jpeg等图片！\n`);
    console.log('------------------------ 任务正常终止, 下次见~ ------------------------');
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
  console.log(`-> 节约体积${(saveCount * 100 / beforeSizeCount).toFixed(2)}%（共${byteToKb(saveCount)}）\n`);
  console.log('------------------------ 图片压缩任务执行完毕, 下次见~ ------------------------');
})();