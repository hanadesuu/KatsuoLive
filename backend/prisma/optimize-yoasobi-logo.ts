import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

async function optimizeImage() {
  const imagePath = path.join(__dirname, '../../frontend/public/images/artists/yoasobi.jpg');
  
  if (!fs.existsSync(imagePath)) {
    console.log('❌ 图片文件不存在:', imagePath);
    return;
  }
  
  try {
    console.log('🔄 正在优化YOASOBI logo...');
    
    // 读取图片
    const imageBuffer = fs.readFileSync(imagePath);
    
    // 尝试获取元数据
    let metadata;
    try {
      metadata = await sharp(imageBuffer).metadata();
      console.log(`📐 原始尺寸: ${metadata.width}x${metadata.height}, 格式: ${metadata.format}`);
    } catch (error) {
      console.log('⚠️ 无法读取图片元数据，可能是SVG或其他格式');
      // 如果是SVG，尝试创建一个简单的占位图片
      await createPlaceholderImage(imagePath);
      return;
    }
    
    // 处理图片
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
      .toFile(imagePath);
    
    console.log('✅ 图片优化完成！');
    console.log(`   保存路径: ${imagePath}`);
    console.log(`   最终尺寸: 800x800, 格式: JPEG`);
  } catch (error) {
    console.error('❌ 优化失败:', error);
    console.log('💡 如果图片格式不支持，请手动添加JPG格式的logo图片');
  }
}

async function createPlaceholderImage(imagePath: string) {
  console.log('🎨 创建占位图片...');
  
  // 创建一个简单的YOASOBI文字logo占位图片
  const svg = `
    <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="800" fill="#1a1a1a"/>
      <text x="400" y="400" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">YOASOBI</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toFile(imagePath);
  
  console.log('✅ 占位图片已创建');
}

optimizeImage()
  .catch((e) => {
    console.error('❌ 处理失败:', e);
    process.exit(1);
  });
