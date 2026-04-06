/**
 * 预设尺寸配置
 */

const PRESETS = {
  // 海报
  poster_a4: { width: 2480, height: 3508, name: 'A4海报 (300dpi)' },
  poster_square: { width: 2000, height: 2000, name: '方形海报' },
  poster_16_9: { width: 1920, height: 1080, name: '16:9海报' },
  poster_4_3: { width: 1600, height: 1200, name: '4:3海报' },
  poster_9_16: { width: 1080, height: 1920, name: '9:16竖版海报' },

  // Banner
  banner_1920x500: { width: 1920, height: 500, name: '网站Banner' },
  banner_1200x400: { width: 1200, height: 400, name: '电商Banner' },
  banner_750x300: { width: 750, height: 300, name: '移动端Banner' },
  banner_468x60: { width: 468, height: 60, name: '小横幅' },
  banner_twitter: { width: 1500, height: 500, name: 'Twitter封面' },

  // 社交媒体
  social_instagram: { width: 1080, height: 1080, name: 'Instagram正方形' },
  social_story: { width: 1080, height: 1920, name: 'Instagram Story' },
  social_facebook: { width: 1200, height: 630, name: 'Facebook封面' },
  social_linkedin: { width: 1200, height: 627, name: 'LinkedIn封面' },
  social_youtube: { width: 2560, height: 1440, name: 'YouTube封面' },

  // 宣传图
  promo_900x500: { width: 900, height: 500, name: '宣传图' },
  promo_500x500: { width: 500, height: 500, name: '正方宣传图' },
  promo_300x250: { width: 300, height: 250, name: '矩形广告' },

  // 名片
  card_standard: { width: 1058, height: 640, name: '标准名片 (300dpi)' },
}

module.exports = PRESETS
