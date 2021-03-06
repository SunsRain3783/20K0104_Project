const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const app = express();

app.use(express.static('public'));//publicにあるファイルを見る
app.use(express.urlencoded({extended:false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sumika_lovers1',
  database: 'luncider'
});

connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');//MySQLとの接続成功
});

app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req,res,next) => {
  if(req.session.userId === undefined){//ログインしていない
    res.locals.username = 'ゲスト';
    res.locals.isLoggedIn = false;
  }else{//ログイン済み
    res.locals.username = req.session.username;
    res.locals.isLoggedIn = true;
  }
  next();
});

app.get('/', (req, res) => {
  res.render('top.ejs');
});

app.get('/lunch', (req, res) => {
  if(req.query.price != void 0){//パラメータがあれば
    price = parseInt(req.query.price);//res.localsは揮発性があるため、別の変数を用意
    volume = parseInt(req.query.volume);
    genres = req.query.genre;//二つ以上で配列
    index = -1;
  }
  index++;
  res.locals.index = index;
  res.locals.price = price;
  res.locals.volume = volume;
  //console.log(price);//再び/lunchにアクセスしてもpriceの値は変わらない。
  lunches_list = [];//最終的にrenderするリスト
  let cnt = 0;
  mylist = [];
  res.locals.mylist = mylist;

  if(req.session.userId !== undefined){//ログイン済みなら
    const listname = req.session.username;
    connection.query(
      'SELECT * FROM ' + listname,
      (error,results) => {
        mylist = results;//マイランチリスト
        res.locals.mylist = mylist;
      }
    );
  }
  if(genres == null){//ジャンルの指定がなかったら
    connection.query(
      'SELECT * FROM lunches',//全てのアイテムを持ってくる
      (error, results) => {
        lunches_list = results;
        if(res.locals.index == lunches_list.length){//配列の最後まで到達したら
          index = 0;
          res.locals.index = index;
        }
        res.render('lunch.ejs',{lunch:lunches_list});
      }
    );
  }else if(Array.isArray(genres)){//ジャンルが配列ならば
    genres.forEach((num)=>{
      connection.query(
        'SELECT * FROM lunches WHERE genre = ?',
        [parseInt(num)],
        (error, results) => {
          lunches_list = lunches_list.concat(results);//genresに一致するデータをリストに追加(concatで配列の結合)
          cnt++;
          if(cnt == genres.length){
            if(res.locals.index == lunches_list.length){
              index = 0;
              res.locals.index = index;
            }
            res.render('lunch.ejs',{lunch:lunches_list});//最後のループでrender
          }
        }
      );
    });
  }else{
    connection.query(
      'SELECT * FROM lunches WHERE genre = ?',
      [genres],
      (error, results) => {
        lunches_list = results;
        if(res.locals.index == lunches_list.length){
          index = 0;
          res.locals.index = index;
        }
        res.render('lunch.ejs',{lunch:lunches_list});
      }
    )
  }
});

app.get('/login', (req, res) => {
  res.render('login.ejs',{errors:[]});//errorsがないとエラーになるため空の配列を渡しておく
});

app.post('/login',(req,res,next) => {
  const username = req.body.username;
  const password = req.body.password;
  const errors = [];
  if(username === ''){
    errors.push('ユーザ名が空です');
  }
  if(password === ''){
    errors.push('パスワードが空です');
  }
  if(errors.length > 0){
    res.render('login.ejs',{errors:errors});
  }else{
    next();
  }
},
(req,res) => {
  const username = req.body.username;

  connection.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (error,results) => {
      if(results.length > 0){
        if(req.body.password === results[0].password){
          req.session.userId = results[0].id;
          req.session.username = results[0].username;
          res.redirect('/');
        }else{
          res.redirect('/login');
        }
      }else{
        res.redirect('/login');
      }
    }
  );
});

app.get('/signup', (req, res) => {
  res.render('signup.ejs',{errors:[]});
});

app.post('/signup',(req,res,next) => {
  const username = req.body.username;
  const password = req.body.password;
  const errors = [];
  if(username === ''){
    errors.push('ユーザ名が空です');
  }
  if(!isNaN(username)){
    errors.push('このユーザ名は使用できません');
  }
  var reg = new RegExp(/[!"#$%&'()\*\+\-\.,\/:;<=>?@\[\\\]^_`{|}~]/g);
  if(reg.test(username)){
    errors.push('このユーザ名は使用できません');
  }
  if(password === ''){
    errors.push('パスワードが空です');
  }
  if(errors.length > 0){
    res.render('signup.ejs',{errors:errors});
  }else{
    next();
  }
},
(req,res,next) => {//usernameの重複チェック
  const username = req.body.username;
  const errors = [];
  connection.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (error,results) => {//もし既存のusernameが見つかれば
      if(results.length > 0){
        errors.push('このユーザ名は使用されています');
        res.render('signup.ejs',{errors:errors});
      }else{
        next();
      }
    }
  )
},
(req,res,next) => {
  const username = req.body.username;
  const password = req.body.password;

  connection.query(
    'INSERT INTO users (username,password) VALUES (?,?)',
    [username,password],
    (error,results) => {
      req.session.userId = results.insertId;
      req.session.username = username;
      next();
    }
  )
},
(req,res) => {
  const listname = req.session.username;
  connection.query(
    'CREATE TABLE '+ listname +' (name TEXT) DEFAULT CHARSET=utf8;',
    (error,results) => {
      res.redirect('/');
    }
  )
});

app.get('/logout',(req,res) => {
  req.session.destroy(() => {//セッション情報を削除
    res.redirect('/');
  })
});

app.get('/list', (req, res) => {
  const listname = req.session.username;

  connection.query(
    'SELECT * FROM ' + listname,
    (error,results) => {
      res.render('list.ejs',{mylist:results})
    }
  )
});

app.post('/add',(req,res) => {
const name = req.body.name;
const listname = req.session.username;
console.log(name);
  connection.query(
    'INSERT INTO ' + listname + ' (name) VALUES (?)',//マイランチリストに追加
    [name],
    (error,results) => {
      res.redirect('lunch');
    }
  )
  });

app.listen(3000);