const sqlite3 = require("sqlite3").verbose();
const path = require("path");
let dbPath = path.join(__dirname, "/DB/data.db");

let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

db.run(
  `CREATE TABLE IF NOT EXISTS users (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    name TEXT,  
    nickname TEXT,  
    gender TEXT,  
    email TEXT ,  
    phone TEXT,  
    avatar TEXT,  
    userid TEXT UNIQUE NOT NULL,  
    account TEXT UNIQUE NOT NULL,  
    password TEXT NOT NULL,  
    address TEXT  
  )
`,
  (err) => {
    if (err) {
      console.log(err.message);
    }
      // 查询 users 表中的第一条数据  
    db.get('SELECT * FROM users LIMIT 1', [], (err, row) => {  
      if (err) {  
        return console.error(err.message);  
      }  
      if (!row) {  
        console.log('检测到users表为空，正在初始化数据...');
      const users = [
        {
          name: "admin",
          nickname: "admin",
          gender: 0,//0代表男，1代表女
          email: "admin@qq.com",
          phone: "1234567890",
          avatar: "avatar1.jpg",
          userid: '000001',
          account: "admin",
          password: "admin123",
          address: "",
        },
        // ... 添加其他用户数据
      ];
  
      // 准备 SQL 语句模板
      const sql =
        "INSERT INTO users (name, nickname, gender, email, phone, avatar, userid, account, password, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      // 批量插入数据
      db.serialize(() => {
        users.forEach((user) => {
          db.run(
            sql,
            [
              user.name,
              user.nickname,
              user.gender,
              user.email,
              user.phone,
              user.avatar,
              user.userid,
              user.account,
              user.password,
              user.address,
            ],
            function (err) {
              if (err) {
                return console.error(err.message);
              }
              console.log(`默认用户 ${user.name}已添加到users表中`);
              
            }
          );
        });
      });
      console.log('初始化完毕');
      } })
  }
);
module.exports = db;
// 当应用程序结束时，关闭数据库连接
process.on("exit", () => {
  db.close();
});


