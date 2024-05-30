
var express = require('express');
var router = express.Router();
var db = require('./db');
var errorFun = require('./err');
const uuid = require('uuid/v4');




// 查询所有用户的信息
router.get('/user', function (req, res, next) {
  console.log(db);
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json(errorFun.err())
    } else {
      res.json({
        code: 200,
        msg: 'Success',
        data: rows
      });
    }
  });
});

// 查询指定用户信息（通过查询参数userid）  
router.get('/user/byUserid', function (req, res, next) {
  const userid = req.query.userid; // 从查询参数中获取userid  
  if (!userid) {
    return res.status(400).json(errorFun.err(400, 'Userid is required')); // 如果未提供userid，则返回错误  
  }
  // 查询指定用户的信息  
  db.get('SELECT * FROM users WHERE userid = ?', [userid], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json(errorFun.err());
    } else {
      if (row) {
        res.json({
          code: 200,
          msg: 'Success',
          data: row
        });
      } else {
        res.status(404).json(errorFun.err(404, 'User not found'));
      }
    }
  });
});

router.post('/user/delete', function (req, res, next) {
  const userid = req.body.userid;

  // 根据ID删除用户
  db.run('DELETE FROM users WHERE userid = ?', [userid], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).json(errorFun.err());
    } else {
      res.json({
        code: 200,
        msg: '删除成功',
        data: null
      });
    }
  });
});



router.post('/user/update', function (req, res, next) {
  const { name, nickname, gender, email, phone, avatar, userid, account, password, address } = req.body;


  db.all('SELECT * FROM users WHERE userid = ?', [userid], (err, row) => {
    if (err) {
      next(err)
    }
    if (!row) {
      res.json({
        code: 400,
        msg: '参数数错误',
        data: null
      });
      return
    }
  // 根据ID更新用户
  const sql = `UPDATE users SET name = ?, nickname = ?, gender = ?, email = ?, phone = ?, avatar = ?, password = ?, address = ? WHERE userid = ?`;
  let arr= [name, nickname, gender, email, phone, avatar, password, address,userid]
  db.run(sql, arr, (err) => {
    if (err) {
      console.error(err); // 在服务器端打印错误信息
      next(err)
      res.status(500).json({
        code: 500,
        msg: '服务器内部错误',
        data: null
      });
    } else {
      res.json({
        code: 200,
        msg: '修改成功',
        data: null
      });
    }
  });

  })

});


router.post('/user/add', function (req, res, next) {
  const { name, nickname, gender, email, phone, avatar, account, password, address } = req.body;
  const sql = `INSERT INTO users (name, nickname, gender, email, phone, avatar, userid, account, password, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  if (!account || !password) {
    res.json({
      code: 400,
      msg: '账号密码不能为空',
      data: null
    })
    return
  }
  //查询是否存在该账户
  db.get('SELECT * FROM users WHERE account = ?', [account], (err, row) => {
    if (err) next(err)

    if (row) {
      res.json({
        code: 400,
        msg: '用户已存在',
        data: null
      })
      return
    }

    //因为新用户没有userid 所以根据账户生成 
    let userid = uuid()
    let arr = [name, nickname, gender, email, phone, avatar, userid, account, password, address]
    db.run(sql, arr, (err) => {
      if (err) {
        next(err)
      }
      res.json({
        code: 200,
        msg: '用户添加成功！',
        data: null
      })
    })
  })
})





/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
