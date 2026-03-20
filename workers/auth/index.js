// Cloudflare Worker - 用户认证 API
const DB = require('./db');

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // 需要替换
const GOOGLE_CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET'; // 需要替换
const REDIRECT_URI = 'https://your-domain.com/auth/callback';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 注册
      if (path === '/api/register' && request.method === 'POST') {
        const { email, password, name } = await request.json();
        
        if (!email || !password || !name) {
          return new Response(JSON.stringify({ error: '缺少必要信息' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // 检查用户是否已存在
        const existing = await DB.getUserByEmail(env.DB, email);
        if (existing) {
          return new Response(JSON.stringify({ error: '用户已存在' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // 创建用户
        const user = await DB.createUser(env.DB, { email, password, name });
        return new Response(JSON.stringify({ user }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 登录
      if (path === '/api/login' && request.method === 'POST') {
        const { email, password } = await request.json();
        
        const user = await DB.verifyUser(env.DB, email, password);
        if (!user) {
          return new Response(JSON.stringify({ error: '邮箱或密码错误' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // 生成简单的 token
        const token = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 7*24*60*60*1000 }));
        return new Response(JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Google 登录回调
      if (path === '/auth/callback' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        if (!code) {
          return new Response('Missing code', { status: 400 });
        }

        // 用 code 换取 access_token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenRes.json();
        
        // 获取用户信息
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        
        const googleUser = await userRes.json();

        // 查找或创建用户
        let user = await DB.getUserByEmail(env.DB, googleUser.email);
        if (!user) {
          user = await DB.createUser(env.DB, {
            email: googleUser.email,
            password: '', // Google 登录不需要密码
            name: googleUser.name,
            avatar: googleUser.picture,
            provider: 'google'
          });
        }

        const token = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 7*24*60*60*1000 }));
        
        // 跳转到前端并带上 token
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/?token=${token}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}`
          }
        });
      }

      // Google 登录入口
      if (path === '/auth/google' && request.method === 'GET') {
        const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          response_type: 'code',
          scope: 'email profile',
          access_type: 'offline',
        });
        return new Response(null, {
          status: 302,
          headers: { Location: authUrl }
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
