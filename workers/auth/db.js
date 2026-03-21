// Cloudflare D1 数据库模块
class DB {
  // 初始化数据库表
  static async init(db) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT,
        avatar TEXT,
        phone TEXT,
        bio TEXT,
        provider TEXT DEFAULT 'email',
        plan TEXT DEFAULT 'free',
        plan_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'TODO',
        priority TEXT DEFAULT 'LOW',
        task_date DATETIME,
        duration INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS time_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  }

  // 根据邮箱获取用户
  static async getUserByEmail(db, email) {
    const result = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    return result;
  }

  // 根据 ID 获取用户
  static async getUserById(db, id) {
    const result = await db.prepare('SELECT id, email, name, avatar, phone, bio, provider, plan, plan_expires, created_at FROM users WHERE id = ?').bind(id).first();
    return result;
  }

  // 创建用户
  static async createUser(db, { email, password, name, avatar, phone, bio, provider = 'email' }) {
    const hashedPassword = password ? await this.hashPassword(password) : '';
    
    const result = await db.prepare(`
      INSERT INTO users (email, password, name, avatar, phone, bio, provider)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(email, hashedPassword, name, avatar || '', phone || '', bio || '', provider).run();

    return this.getUserById(db, result.lastInsertRowid);
  }

  // 验证用户登录
  static async verifyUser(db, email, password) {
    const user = await this.getUserByEmail(db, email);
    if (!user || !user.password) return null;
    
    const valid = await this.verifyPassword(password, user.password);
    if (!valid) return null;
    
    return user;
  }

  // 更新用户资料
  static async updateUserProfile(db, userId, { name, bio, phone }) {
    await db.prepare(`
      UPDATE users SET name = ?, bio = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name || '', bio || '', phone || '', userId).run();
    
    return await this.getUserById(db, userId);
  }

  // 简单密码哈希（生产环境应使用 bcrypt 或类似库）
  static async hashPassword(password) {
    // 简单实现，生产环境请使用 crypto.subtle
    return btoa(password + 'stm_salt_2024');
  }

  static async verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  // 任务操作
  static async getTasksByUser(db, userId) {
    return await db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all();
  }

  static async createTask(db, { userId, title, description, priority, task_date }) {
    const result = await db.prepare(`
      INSERT INTO tasks (user_id, title, description, priority, status, task_date)
      VALUES (?, ?, ?, ?, 'TODO', ?)
    `).bind(userId, title, description || '', priority || 'LOW', task_date || null).run();
    
    return await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(result.lastInsertRowid).first();
  }

  static async updateTask(db, taskId, { title, description, priority, status, task_date }) {
    await db.prepare(`
      UPDATE tasks SET 
        title = ?, 
        description = ?, 
        priority = ?, 
        status = ?, 
        task_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title || '', description || '', priority || 'LOW', status || 'TODO', task_date || null, taskId).run();
    
    return await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(taskId).first();
  }

  static async deleteTask(db, taskId) {
    const result = await db.prepare('DELETE FROM tasks WHERE id = ?').bind(taskId).run();
    return result.success;
  }

  // 时间记录操作
  static async startTimer(db, { taskId, userId }) {
    const result = await db.prepare(`
      INSERT INTO time_logs (task_id, user_id, start_time)
      VALUES (?, ?, datetime('now'))
    `).bind(taskId, userId).run();
    
    return result.lastInsertRowid;
  }

  static async stopTimer(db, logId) {
    await db.prepare(`
      UPDATE time_logs 
      SET end_time = datetime('now'), 
          duration = (julianday(datetime('now')) - julianday(start_time)) * 86400
      WHERE id = ?
    `).bind(logId).run();
  }

  static async getRecordsByUser(db, userId) {
    return await db.prepare('SELECT * FROM time_logs WHERE user_id = ? ORDER BY start_time DESC').bind(userId).all();
  }
}

module.exports = DB;
