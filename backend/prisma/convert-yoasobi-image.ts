import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

async function convertImage() {
  const sourcePath = path.join(__dirname, '../../pic/yoasobi-main-feature-image-credit-artist-e1724874507397-1600x900.webp');
  const targetPath = path.join(__dirname, '../../frontend/public/images/artists/yoasobi.jpg');
  
  if (!fs.existsSync(sourcePath)) {
    console.log('❌ 源图片文件不存在:', sourcePath);
    return;
  }
  
  try {
    console.log('🔄 正在转换YOASOBI图片...');
    console.log(`   源文件: ${sourcePath}`);
    console.log(`   目标文件: ${targetPath}`);
    
    // 确保目标目录存在
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // 读取webp图片并转换为jpg
    const imageBuffer = fs.readFileSync(sourcePath);
    const metadata = await sharp(imageBuffer).metadata();
    
    console.log(`📐 原始尺寸: ${metadata.width}x${metadata.height}, 格式: ${metadata.format}`);
    
    // 处理图片：裁剪为1:1比例，然后调整为800x800
    let processedImage = sharp(imageBuffer);
    
    // 如果不是1:1，进行裁剪
    if (metadata.width && metadata.height) {
      const size = Math.min(metadata.width, metadata.height);
      const left = Math.floor((metadata.width - size) / 2);
      const top = Math.floor((metadata.height - size) / 2);
      
      processedImage = processedImage.extract({
        left,
        top,
        width: size,
        height: size,
      });
    }
    
    // 调整大小并保存为JPG
    await processedImage
      .resize(800, 800, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90 })
      .toFile(targetPath);
    
    console.log('✅ 图片转换完成！');
    console.log(`   保存路径: ${targetPath}`);
    console.log(`   最终尺寸: 800x800, 格式: JPEG`);
  } catch (error) {
    console.error('❌ 转换失败:', error);
    process.exit(1);
  }
}

convertImage()
  .catch((e) => {
    console.error('❌ 处理失败:', e);
    process.exit(1);
  });
