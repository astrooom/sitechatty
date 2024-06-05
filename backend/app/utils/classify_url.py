import re
from urllib.parse import urlparse

# Define keyword lists
KEYWORDS = {
    'doc': [
        'docs', 'documentation', 'kb', 'knowledgebase', 'help', 'support', 'announcement',
        'guide', 'tutorial', 'faq', 'manual', 'how-to', 'learn', 'article', 'contact'
    ],
    'commerce': [
        'shop', 'store', 'product', 'buy', 'cart', 'checkout', 'sale', 'ecommerce', 'hosting', 'host',
        'payment', 'shipping', 'vps', 'cloud', 'domain', 'email', 'subscription', 'server', 'game'
    ],
    'blog': [
        'blog', 'news', 'post', 'article', 'journal', 'story', 'entry', 'update'
    ],
    'forum': [
        'forum', 'community', 'discussion', 'thread', 'topic', 'board', 'post', 'message'
    ],
    'social': [
        'social', 'network', 'share', 'follow', 'like', 'comment', 'friend', 'connect',
        'profile', 'timeline', 'feed', 'group', 'event', 'mention', 'retweet', 'hashtag',
        'facebook', 'youtube', 'whatsapp', 'instagram', 'tiktok', 'wechat', 'messenger',
        'linkedin', 'telegram', 'snapchat', 'douyin', 'kuaishou', 'weibo', 'qq', 'twitter',
        'qzone', 'reddit', 'pinterest', 'quora', 'josh', 'teams', 'skype', 'tieba', 'viber',
        'imo', 'xiaohongshu', 'twitch', 'line', 'discord', 'threads', 'likee', 'picsart',
        'vevo', 'tumblr', 'vk'
    ],
    'auth': [
        'auth', 'login', 'signup', 'account', 'password', 'forgot', 'reset', 'register'
    ],
    'legal': [
        'legal', 'privacy', 'terms', 'disclaimer', 'copyright', 'intellectual', 'property'
    ]
}

# Compile regex patterns for each type
PATTERNS = {key: re.compile(r'\b(' + '|'.join(words) + r')\b', re.IGNORECASE) for key, words in KEYWORDS.items()}


def is_valid_url(url):
    """
    Check if the given string is a valid URL.
    """
    parsed = urlparse(url)
    return all([parsed.scheme, parsed.netloc])

def classify_url(url):
    """
    Classifies a url based on its content.
    """
    # Determine the type based on the presence of keywords in the URL
    for type, pattern in PATTERNS.items():
        if pattern.search(url):
            return type
    return None
