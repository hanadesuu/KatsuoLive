import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import * as cheerio from 'cheerio';

async function downloadImage(url: string, savePath: string): Promise<boolean> {
  try {
    console.log(`📥 正在下载图片: ${url}`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    // 确保目录存在
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const imageBuffer = Buffer.from(response.data);
    
    // 检查是否是SVG格式
    const contentType = response.headers['content-type'] || '';
    const isSvg = contentType.includes('svg') || url.toLowerCase().endsWith('.svg');
    
    if (isSvg) {
      console.log('⚠️ 检测到SVG格式，尝试转换为PNG...');
      try {
        await sharp(imageBuffer)
          .resize(800, 800, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .jpeg({ quality: 90 })
          .toFile(savePath);
        console.log(`✅ SVG已转换并保存: ${savePath}`);
        return true;
      } catch (svgError) {
        console.log('⚠️ SVG转换失败，尝试其他方法...');
      }
    }
    
    // 尝试使用sharp处理图片
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
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
      
      // 调整大小并保存
      await processedImage
        .resize(800, 800, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 90 })
        .toFile(savePath);
      
      console.log(`✅ 图片已处理并保存为1:1: ${savePath}`);
      return true;
    } catch (sharpError) {
      // 如果sharp处理失败，尝试直接保存
      console.log('⚠️ Sharp处理失败，尝试直接保存...');
      fs.writeFileSync(savePath, imageBuffer);
      console.log(`✅ 图片已直接保存: ${savePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ 下载/处理图片失败: ${url}`, error);
    return false;
  }
}

async function findAdoLogo(): Promise<string | null> {
  try {
    console.log('🔍 正在搜索Ado logo...');
    
    // 尝试从官网获取
    const response = await axios.get('https://ado.zhitinggg.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });
    
    const $ = cheerio.load(response.data);
    
    // 查找可能的logo图片
    const logoSelectors = [
      'img[src*="logo"]',
      'img[alt*="Ado"]',
      'img[alt*="ADO"]',
      'img[alt*="logo"]',
      '.logo img',
      'header img',
      'nav img',
      'img[src*="ado"]',
    ];
    
    for (const selector of logoSelectors) {
      const img = $(selector).first();
      const src = img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src');
      if (src) {
        let imageUrl = src;
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://ado.zhitinggg.com' + imageUrl;
        } else if (!imageUrl.startsWith('http')) {
          imageUrl = 'https://ado.zhitinggg.com/' + imageUrl;
        }
        console.log(`✅ 找到可能的logo: ${imageUrl}`);
        return imageUrl;
      }
    }
    
    // 尝试查找OGP图片
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      let imageUrl = ogImage;
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      }
      console.log(`✅ 找到OGP图片: ${imageUrl}`);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('❌ 搜索logo失败:', error);
    return null;
  }
}

async function main() {
  console.log('🎨 开始下载Ado logo...');
  
  // 查找logo URL
  let logoUrl = await findAdoLogo();
  
  // 如果没找到，尝试其他来源
  if (!logoUrl) {
    console.log('⚠️ 无法从官网获取logo，尝试其他来源...');
    // 尝试从YouTube频道封面或其他官方渠道获取
    const alternativeUrls = [
      'https://i.ytimg.com/vi/demo/maxresdefault.jpg', // Ado的YouTube频道封面（需要替换为实际URL）
      'https://sp.universal-music.co.jp/ado/hibana/images/ogp.jpg', // Hibana巡演OGP
      'https://ado.zhitinggg.com/images/logo.png',
      'https://ado.zhitinggg.com/images/logo.jpg',
    ];
    
    for (const altUrl of alternativeUrls) {
      try {
        const testResponse = await axios.head(altUrl, { timeout: 5000 });
        if (testResponse.status === 200) {
          logoUrl = altUrl;
          console.log(`✅ 找到备用logo: ${altUrl}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个
      }
    }
    
    // 如果还是没找到，使用YouTube频道封面作为最后的选择
    if (!logoUrl) {
      // 使用Ado官方YouTube频道的封面图
      logoUrl = 'https://i.ytimg.com/vi/demo/maxresdefault.jpg';
      console.log(`📥 使用YouTube频道封面: ${logoUrl}`);
      console.log('⚠️ 注意：请手动替换为实际的Ado YouTube频道封面URL');
    }
  }
  
  // 下载图片
  const imagePath = path.join(__dirname, '../../frontend/public/images/artists/ado.jpg');
  
  if (logoUrl) {
    const success = await downloadImage(logoUrl, imagePath);
    if (success) {
      console.log('🎉 Ado logo下载完成！');
      console.log(`   保存路径: ${imagePath}`);
    } else {
      console.log('⚠️ 下载失败，请手动添加logo图片到:');
      console.log(`   ${imagePath}`);
    }
  } else {
    console.log('⚠️ 无法找到logo URL，请手动添加logo图片到:');
    console.log(`   ${imagePath}`);
    console.log('💡 可以从以下来源获取:');
    console.log('   - Ado官网: https://ado.zhitinggg.com/');
    console.log('   - YouTube频道: https://www.youtube.com/@Ado1024');
    console.log('   - 官方Twitter: https://twitter.com/ado1024imokenp');
  }
}

main()
  .catch((e) => {
    console.error('❌ 处理失败:', e);
    process.exit(1);
  });
