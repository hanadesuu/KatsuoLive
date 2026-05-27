import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

async function downloadImage(url: string, savePath: string): Promise<boolean> {
  try {
    console.log(`📥 正在下载图片: ${url}`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // 确保目录存在
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 使用sharp处理图片，裁剪成1:1比例
    const imageBuffer = Buffer.from(response.data);
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
    
    // 调整大小并保存（可选：统一尺寸）
    await processedImage
      .resize(800, 800, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90 })
      .toFile(savePath);
    
    console.log(`✅ 图片已处理并保存为1:1: ${savePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 下载/处理图片失败: ${url}`, error);
    return false;
  }
}

async function fetchAimyonInfo() {
  try {
    console.log('📡 正在获取 AIMYON 官网信息...');
    
    // 尝试多个可能的页面
    const urls = [
      'https://www.aimyong.net/?lang=zh-tw',
      'https://www.aimyong.net/about/?lang=zh-tw',
      'https://www.aimyong.net/',
    ];

    let descriptionJp = '';
    let descriptionEn = '';
    let descriptionCn = '';
    let imageUrl = '';

    for (const url of urls) {
      try {
        console.log(`尝试访问: ${url}`);
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
          },
        });

        const $ = cheerio.load(response.data);

        // 查找简介信息
        const possibleSelectors = [
          'meta[name="description"]',
          '.about-content',
          '.artist-description',
          '.bio',
          '[class*="description"]',
          '[class*="about"]',
        ];

        for (const selector of possibleSelectors) {
          const content = $(selector).first().text().trim() || $(selector).first().attr('content') || '';
          if (content && content.length > 20) {
            if (!descriptionCn && content.length < 500) {
              descriptionCn = content;
            }
          }
        }

        // 查找图片
        const imageSelectors = [
          'img[src*="artist"]',
          'img[src*="aimyon"]',
          'img[src*="main"]',
          '.artist-photo img',
          '.cover-image img',
          'meta[property="og:image"]',
        ];

        for (const selector of imageSelectors) {
          const img = $(selector).first();
          const src = img.attr('src') || img.attr('content') || '';
          if (src && (src.includes('artist') || src.includes('aimyon') || src.includes('main'))) {
            // 处理相对路径
            if (src.startsWith('http')) {
              imageUrl = src;
            } else if (src.startsWith('/')) {
              imageUrl = `https://www.aimyong.net${src}`;
            } else {
              imageUrl = `https://www.aimyong.net/${src}`;
            }
            break;
          }
        }

        if (descriptionCn || imageUrl) {
          break;
        }
      } catch (error) {
        console.log(`访问 ${url} 失败，尝试下一个...`);
        continue;
      }
    }

    // 如果没有找到，使用默认信息
    if (!descriptionCn) {
      descriptionCn = 'あいみょん（Aimyon），日本创作型歌手，1995年3月6日出生于兵库县神户市。2015年以单曲《生きていたんだよな》出道，凭借独特的嗓音和真挚的歌词获得广泛关注。代表作品包括《マリーゴールド》、《ハルノヒ》、《裸の心》等。';
      descriptionJp = 'あいみょん（Aimyon）は、日本のシンガーソングライター。1995年3月6日、兵庫県神戸市生まれ。2015年にシングル「生きていたんだよな」でデビュー。独特の声質と心に響く歌詞で多くの人々に愛されている。代表曲に「マリーゴールド」「ハルノヒ」「裸の心」などがある。';
      descriptionEn = 'Aimyon is a Japanese singer-songwriter born on March 6, 1995 in Kobe, Hyogo Prefecture. She made her debut in 2015 with the single "Ikite Itanda Yona" and has gained widespread attention for her unique voice and heartfelt lyrics. Her representative works include "Marigold", "Haru no Hi", and "Hadaka no Kokoro".';
    }

    // 如果没有找到图片，使用已知的官方图片URL
    if (!imageUrl) {
      imageUrl = 'https://www.aimyong.net/static/aimyong/fanclub/artist_photo/ph_main20251130_main.jpg';
    }

    return {
      descriptionJp,
      descriptionEn,
      descriptionCn,
      imageUrl,
    };
  } catch (error) {
    console.error('❌ 获取信息失败:', error);
    // 返回默认信息
    return {
      descriptionJp: 'あいみょん（Aimyon）は、日本のシンガーソングライター。1995年3月6日、兵庫県神戸市生まれ。2015年にシングル「生きていたんだよな」でデビュー。独特の声質と心に響く歌詞で多くの人々に愛されている。代表曲に「マリーゴールド」「ハルノヒ」「裸の心」などがある。',
      descriptionEn: 'Aimyon is a Japanese singer-songwriter born on March 6, 1995 in Kobe, Hyogo Prefecture. She made her debut in 2015 with the single "Ikite Itanda Yona" and has gained widespread attention for her unique voice and heartfelt lyrics. Her representative works include "Marigold", "Haru no Hi", and "Hadaka no Kokoro".',
      descriptionCn: 'あいみょん（Aimyon），日本创作型歌手，1995年3月6日出生于兵库县神户市。2015年以单曲《生きていたんだよな》出道，凭借独特的嗓音和真挚的歌词获得广泛关注。代表作品包括《マリーゴールド》、《ハルノヒ》、《裸の心》等。',
      imageUrl: 'https://www.aimyong.net/static/aimyong/fanclub/artist_photo/ph_main20251130_main.jpg',
    };
  }
}

async function main() {
  console.log('🎵 开始更新 AIMYON 艺术家信息...');

  // 获取信息
  const info = await fetchAimyonInfo();

  console.log('📝 获取到的信息:');
  console.log('  简介（中文）:', info.descriptionCn.substring(0, 50) + '...');
  console.log('  图片URL:', info.imageUrl);

  // 下载图片
  const imagePath = path.join(__dirname, '../../frontend/public/images/artists/aimyon.jpg');
  let coverImagePath = '/images/artists/aimyon.jpg';

  const imageDownloaded = await downloadImage(info.imageUrl, imagePath);
  if (!imageDownloaded) {
    // 如果下载失败，使用外部URL
    coverImagePath = info.imageUrl;
    console.log('⚠️ 图片下载失败，使用外部URL');
  }

  // 更新数据库
  const aimyon = await prisma.artist.update({
    where: { id: 'aimyon' },
    data: {
      descriptionJp: info.descriptionJp,
      descriptionEn: info.descriptionEn,
      descriptionCn: info.descriptionCn,
      coverImage: coverImagePath,
    },
  });

  console.log('✅ AIMYON 艺术家信息已更新');
  console.log('  头像路径:', aimyon.coverImage);
  console.log('  简介（中文）:', aimyon.descriptionCn?.substring(0, 50) + '...');

  console.log('🎉 更新完成！');
}

main()
  .catch((e) => {
    console.error('❌ 更新失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
