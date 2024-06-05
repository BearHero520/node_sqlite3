const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require('fs').promises;

let dbPath = path.join(process.cwd(), "DB", "data.db");  
  
async function createDatabaseFile() {    
  try {    
    // 尝试访问文件，如果文件不存在，将抛出错误    
    await fs.access(dbPath, fs.constants.F_OK);    
    console.log('Database file already exists.');    
  } catch (error) {    
    // 如果访问失败（即文件不存在），则创建文件    
    if (error.code === 'ENOENT') {    
      try {    
        // 确保DB目录存在    
        const dirPath = path.dirname(dbPath);    
        await fs.mkdir(dirPath, { recursive: true }); // 创建DB目录（如果需要）    
    
        // 创建data.db文件    
        await fs.writeFile(dbPath, ''); // 写入空字符串来创建文件    
        console.log('Database file created successfully!'); 
        await addTable()   
      } catch (writeError) {    
        console.error('Error creating database file:', writeError);    
        // 在这里你可以选择抛出错误或继续执行，但通常最好抛出错误  
        throw writeError;  
      }    
    } else {    
      // 访问文件失败但原因不是文件不存在    
      console.error('Error accessing database file:', error);  
      // 在这里你也可以选择抛出错误  
      throw error;  
    }    
  }    
}  

async function addTable() {
  const db = new sqlite3.Database(dbPath, (err) => {  
    if (err) {  
      reject(err); // 如果有错误，拒绝Promise  
    } else { 
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
                avatar: "",
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
    }  
  }); 

  
}

setTimeout(async()=>{await connectToDatabase()},0)


// 封装数据库连接到Promise中  
async function connectToDatabase() {  
  return new Promise(async (resolve, reject) => {  
    try {  
      // 等待文件创建完成  
      await createDatabaseFile();  
  
      // 创建数据库连接  
      const db = new sqlite3.Database(dbPath, (err) => {  
        if (err) {  
          reject(err); // 如果有错误，拒绝Promise  
        } else { 
          resolve(db); // 如果没有错误，解析Promise并返回数据库连接对象  
        }  
      });  
  
      // 注意：这里没有显示地关闭数据库连接，通常你会在应用程序结束时或在不再需要时关闭它  
  
    } catch (error) {  
      reject(error); // 如果在文件创建过程中发生错误，拒绝Promise  
    }  
  });  
}  
module.exports={
  connectToDatabase,
};


// 当应用程序结束时，关闭数据库连接
process.on("exit", () => {
  //db.close();
});


