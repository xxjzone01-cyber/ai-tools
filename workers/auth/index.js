// Cloudflare Worker - 用户认证和任务管理 API

// 从环境变量读取 Google OAuth 配置
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = 'https://smart-time-manager-auth.xxjzone01.workers.dev/auth/callback';

// 验证 token 的辅助函数
async function verifyToken(env, token) {
  try {
    const data = JSON.parse(atob(token));
    if (data.exp < Date.now()) return null;
    const user = await env.DB.prepare('SELECT id, email, name, avatar, provider FROM users WHERE id = ?').bind(data.userId).first();
    return user;
  } catch {
    return null;
  }
}

// 验证请求的辅助函数
async function verifyRequest(request, env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return { error: '未授权', status: 401 };
  
  const user = await verifyToken(env, token);
  if (!user) return { error: '无效的token', status: 401 };
  
  return { user };
}

export default {
  async fetch(request, env) {
    const clientId = env.GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET || GOOGLE_CLIENT_SECRET;
    const redirectUri = env.GOOGLE_REDIRECT_URI || REDIRECT_URI;
    
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 测试数据库连接
      if (path === '/api/test' && request.method === 'GET') {
        const result = await env.DB.prepare('SELECT 1 as test').first();
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ==================== 用户认证 ====================
      
      // 注册
      if (path === '/api/register' && request.method === 'POST') {
        const { email, password, name } = await request.json();
        
        if (!email || !password || !name) {
          return new Response(JSON.stringify({ error: '缺少必要信息' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) {
          return new Response(JSON.stringify({ error: '用户已存在' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const hashedPassword = btoa(password + 'stm_salt_2024');
        const result = await env.DB.prepare(`
          INSERT INTO users (email, password, name, provider)
          VALUES (?, ?, ?, 'email')
        `).bind(email, hashedPassword, name).run();

        const token = btoa(JSON.stringify({ userId: result.lastInsertRowid, email, exp: Date.now() + 7*24*60*60*1000 }));
        return new Response(JSON.stringify({ token, user: { id: result.lastInsertRowid, email, name } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 登录
      if (path === '/api/login' && request.method === 'POST') {
        const { email, password } = await request.json();
        
        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
        if (!user || !user.password) {
          return new Response(JSON.stringify({ error: '邮箱或密码错误' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const hashedPassword = btoa(password + 'stm_salt_2024');
        if (user.password !== hashedPassword) {
          return new Response(JSON.stringify({ error: '邮箱或密码错误' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const token = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 7*24*60*60*1000 }));
        return new Response(JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Google 登录回调
      if (path === '/auth/callback' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        if (!code) return new Response('Missing code', { status: 400 });

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId, client_secret: clientSecret, code,
            redirect_uri: redirectUri, grant_type: 'authorization_code',
          }),
        });

        const tokenData = await tokenRes.json();
        
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        
        const googleUser = await userRes.json();

        let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(googleUser.email).first();
        if (!user) {
          const result = await env.DB.prepare(`
            INSERT INTO users (email, name, avatar, provider)
            VALUES (?, ?, ?, 'google')
          `).bind(googleUser.email, googleUser.name, googleUser.picture || '').run();
          user = { id: result.lastInsertRowid, email: googleUser.email, name: googleUser.name };
        }

        const token = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 7*24*60*60*1000 }));
        
        // 跳转到前端
        const frontendUrl = env.FRONTEND_URL || 'https://08106499.smart-time-manager.pages.dev';
        return new Response(null, {
          status: 302,
          headers: { Location: `${frontendUrl}/login.html?token=${token}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}` }
        });
      }

      // Google 登录入口
      if (path === '/auth/google' && request.method === 'GET') {
        const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
          client_id: clientId, redirect_uri: redirectUri,
          response_type: 'code', scope: 'email profile', access_type: 'offline',
        });
        return new Response(null, { status: 302, headers: { Location: authUrl } });
      }

      // ==================== 用户资料 ====================
      
      // 获取当前用户资料
      if (path === '/api/user/profile' && request.method === 'GET') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const user = await env.DB.prepare('SELECT id, email, name, avatar, phone, bio, provider, created_at FROM users WHERE id = ?').bind(auth.user.id).first();
        return new Response(JSON.stringify({ user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 更新用户资料
      if (path === '/api/user/profile' && request.method === 'PUT') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const { name, bio, phone } = await request.json();
        
        await env.DB.prepare('UPDATE users SET name = ?, bio = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .bind(name || auth.user.name, bio || '', phone || '', auth.user.id).run();
        
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ==================== 任务管理 ====================
      
      // 获取用户所有任务
      if (path === '/api/tasks' && request.method === 'GET') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const tasks = await env.DB.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').bind(auth.user.id).all();
        return new Response(JSON.stringify({ tasks: tasks.results || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 创建任务
      if (path === '/api/tasks' && request.method === 'POST') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const { title, description, priority, task_date } = await request.json();
        
        if (!title) {
          return new Response(JSON.stringify({ error: '任务标题不能为空' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await env.DB.prepare(`
          INSERT INTO tasks (user_id, title, description, priority, status, task_date)
          VALUES (?, ?, ?, ?, 'TODO', ?)
        `).bind(auth.user.id, title, description || '', priority || 'LOW', task_date || null).run();

        const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(result.lastInsertRowid).first();
        return new Response(JSON.stringify({ task }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 更新任务
      if (path === '/api/tasks' && request.method === 'PUT') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const { id, title, description, priority, status, task_date } = await request.json();
        
        // 验证任务属于当前用户
        const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').bind(id, auth.user.id).first();
        if (!task) {
          return new Response(JSON.stringify({ error: '任务不存在' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.DB.prepare(`
          UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, task_date = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(title, description, priority, status, task_date, id).run();

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 删除任务
      if (path === '/api/tasks' && request.method === 'DELETE') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const { id } = await request.json();
        
        const result = await env.DB.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').bind(id, auth.user.id).run();
        
        return new Response(JSON.stringify({ success: result.success }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ==================== 时间记录 ====================
      
      // 获取用户时间记录
      if (path === '/api/records' && request.method === 'GET') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const records = await env.DB.prepare('SELECT * FROM time_logs WHERE user_id = ? ORDER BY start_time DESC').bind(auth.user.id).all();
        return new Response(JSON.stringify({ records: records.results || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 开始计时
      if (path === '/api/records/start' && request.method === 'POST') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const { task_id } = await request.json();
        
        // 验证任务属于当前用户
        const task = await env.DB.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').bind(task_id, auth.user.id).first();
        if (!task) {
          return new Response(JSON.stringify({ error: '任务不存在' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await env.DB.prepare(`
          INSERT INTO time_logs (task_id, user_id, start_time)
          VALUES (?, ?, datetime('now'))
        `).bind(task_id, auth.user.id).run();

        return new Response(JSON.stringify({ record_id: result.lastInsertRowid }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 结束计时
      if (path === '/api/records/stop' && request.method === 'POST') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const { record_id } = await request.json();
        
        // 验证记录属于当前用户
        const record = await env.DB.prepare('SELECT * FROM time_logs WHERE id = ? AND user_id = ?').bind(record_id, auth.user.id).first();
        if (!record) {
          return new Response(JSON.stringify({ error: '记录不存在' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.DB.prepare(`
          UPDATE time_logs 
          SET end_time = datetime('now'), 
              duration = (julianday(datetime('now')) - julianday(start_time)) * 86400
          WHERE id = ?
        `).bind(record_id).run();

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ==================== 数据导出 ====================
      
      // 导出用户所有数据
      if (path === '/api/export' && request.method === 'GET') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const tasks = await env.DB.prepare('SELECT * FROM tasks WHERE user_id = ?').bind(auth.user.id).all();
        const records = await env.DB.prepare('SELECT * FROM time_logs WHERE user_id = ?').bind(auth.user.id).all();
        const user = await env.DB.prepare('SELECT id, email, name, avatar, bio, provider, created_at FROM users WHERE id = ?').bind(auth.user.id).first();
        
        const exportData = {
          user,
          tasks: tasks.results || [],
          records: records.results || [],
          exported_at: new Date().toISOString()
        };
        
        return new Response(JSON.stringify(exportData, null, 2), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename=smart-time-manager-backup.json' } 
        });
      }

      // 导入数据
      if (path === '/api/import' && request.method === 'POST') {
        const auth = await verifyRequest(request, env);
        if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const { tasks, records } = await request.json();
        
        let importedTasks = 0;
        let importedRecords = 0;
        
        // 导入任务
        if (tasks && Array.isArray(tasks)) {
          for (const task of tasks) {
            await env.DB.prepare(`
              INSERT INTO tasks (user_id, title, description, priority, status, task_date)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(auth.user.id, task.title, task.description, task.priority, task.status, task.task_date);
            importedTasks++;
          }
        }
        
        // 导入时间记录
        if (records && Array.isArray(records)) {
          for (const record of records) {
            await env.DB.prepare(`
              INSERT INTO time_logs (task_id, user_id, start_time, end_time, duration)
              SELECT ?, id, ?, ?, ? FROM tasks WHERE user_id = ? LIMIT 1
            `).bind(auth.user.id, record.start_time, record.end_time, record.duration, auth.user.id);
            importedRecords++;
          }
        }
        
        return new Response(JSON.stringify({ success: true, importedTasks, importedRecords }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
