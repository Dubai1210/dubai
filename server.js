const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 番剧数据
let animeData = [];
try {
  const data = fs.readFileSync(path.join(__dirname, 'api-anime-response.json'), 'utf8');
  animeData = JSON.parse(data);
} catch (e) {
  console.log('番剧数据加载失败，使用空数组');
}

// 用户存储（内存）
const users = new Map();
const verificationCodes = new Map();

// 番剧 API
app.get('/api/anime', (req, res) => {
  res.json(animeData);
});

// 翻译 API（简单模拟）
app.get('/api/translate', (req, res) => {
  const { q, lang } = req.query;
  if (!q) {
    return res.json({ text: '' });
  }
  // 简单的翻译模拟
  const translations = {
    'hello': { zh: '你好', en: 'hello', ja: 'こんにちは' },
    'world': { zh: '世界', en: 'world', ja: '世界' },
    'anime': { zh: '动漫', en: 'anime', ja: 'アニメ' },
  };
  const lowerQ = q.toLowerCase();
  if (translations[lowerQ] && translations[lowerQ][lang]) {
    res.json({ text: translations[lowerQ][lang] });
  } else {
    res.json({ text: q });
  }
});

// 发送验证码
app.post('/api/auth/send-code', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: '邮箱不能为空' });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes.set(email, { code, expires: Date.now() + 300000 });
  console.log(`验证码已生成: ${email} -> ${code}`);
  res.json({ success: true, message: '验证码已发送' });
});

// 注册
app.post('/api/auth/register', (req, res) => {
  const { username, email, code, password } = req.body;
  if (!username || !email || !code || !password) {
    return res.json({ success: false, message: '所有字段都不能为空' });
  }
  const storedCode = verificationCodes.get(email);
  if (!storedCode || storedCode.code !== code || storedCode.expires < Date.now()) {
    return res.json({ success: false, message: '验证码错误或已过期' });
  }
  if (users.has(username)) {
    return res.json({ success: false, message: '用户名已存在' });
  }
  users.set(username, {
    username,
    email,
    password,
    created: new Date().toISOString()
  });
  verificationCodes.delete(email);
  res.json({ success: true, message: '注册成功' });
});

// 登录
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ success: false, message: '用户名和密码不能为空' });
  }
  const user = users.get(username);
  if (!user || user.password !== password) {
    return res.json({ success: false, message: '用户名或密码错误' });
  }
  res.json({
    success: true,
    message: '登录成功',
    user: {
      username: user.username,
      email: user.email,
      created: user.created
    }
  });
});

// 忘记密码
app.post('/api/auth/forgot', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: '邮箱不能为空' });
  }
  let foundUser = null;
  for (const [username, user] of users) {
    if (user.email === email) {
      foundUser = user;
      break;
    }
  }
  if (!foundUser) {
    return res.json({ success: false, message: '该邮箱未注册' });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes.set(email, { code, expires: Date.now() + 300000, reset: true });
  console.log(`重置验证码: ${email} -> ${code}`);
  res.json({ success: true, message: '重置链接已发送' });
});

// 获取用户信息
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.json({ success: false, message: '未授权' });
  }
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  const [username, password] = credentials.split(':');
  const user = users.get(username);
  if (!user || user.password !== password) {
    return res.json({ success: false, message: '认证失败' });
  }
  res.json({
    success: true,
    user: {
      username: user.username,
      email: user.email,
      created: user.created
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`已加载 ${animeData.length} 部番剧数据`);
});
