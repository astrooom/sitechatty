import { URL } from 'url';

// Define keyword lists
const KEYWORDS = {
  doc: [
    'docs', 'documentation', 'kb', 'knowledgebase', 'help', 'support', 'announcement',
    'guide', 'tutorial', 'faq', 'manual', 'how-to', 'learn', 'article', 'contact'
  ],
  commerce: [
    'shop', 'store', 'product', 'buy', 'cart', 'checkout', 'sale', 'ecommerce', 'hosting', 'host',
    'payment', 'shipping', 'vps', 'cloud', 'domain', 'email', 'subscription', 'server', 'game'
  ],
  blog: [
    'blog', 'news', 'post', 'article', 'journal', 'story', 'entry', 'update'
  ],
  forum: [
    'forum', 'community', 'discussion', 'thread', 'topic', 'board', 'post', 'message'
  ],
  social: [
    'social', 'network', 'share', 'follow', 'like', 'comment', 'friend', 'connect',
    'profile', 'timeline', 'feed', 'group', 'event', 'mention', 'retweet', 'hashtag',
    'facebook', 'youtube', 'whatsapp', 'instagram', 'tiktok', 'wechat', 'messenger',
    'linkedin', 'telegram', 'snapchat', 'douyin', 'kuaishou', 'weibo', 'qq', 'twitter',
    'qzone', 'reddit', 'pinterest', 'quora', 'josh', 'teams', 'skype', 'tieba', 'viber',
    'imo', 'xiaohongshu', 'twitch', 'line', 'discord', 'threads', 'likee', 'picsart',
    'vevo', 'tumblr', 'vk'
  ],
  auth: [
    'auth', 'login', 'signup', 'account', 'password', 'forgot', 'reset', 'register'
  ],
  legal: [
    'legal', 'privacy', 'terms', 'disclaimer', 'copyright', 'intellectual', 'property'
  ]
};

// Compile regex patterns for each type
const PATTERNS: { [key: string]: RegExp } = {};
for (const [key, words] of Object.entries(KEYWORDS)) {
  PATTERNS[key] = new RegExp(`\\b(${words.join('|')})\\b`, 'i');
}

export function classifyUrl(url: string): string {
  if (!isValidUrl(url)) {
    return "";
  }

  // Determine the type based on the presence of keywords in the URL
  for (const [type, pattern] of Object.entries(PATTERNS)) {
    if (pattern.test(url)) {
      return type;
    }
  }
  return "";
}

export function isValidUrl(url: string): boolean {
  try {
    const result = new URL(url);
    return !!result.protocol && !!result.hostname;
  } catch (error) {
    return false;
  }
}