# ローカルサーバーの起動の仕方
* (管理者コマンドプロンプトにて)
「net start mysql57」
* (ターミナルにて)
「nodemon app.js」
※「Ctrl」+「C」でサーバー停止
* (Webブラウザにて)
http://localhost:3000/

# 目標
ユーザーのニーズに合わせたランチを提案するウェブアプリ開発

# 新規アプリケーションの作り方
1. 好きな場所にアプリのフォルダを開く(ドキュメントなど一部エラーになる場所あり)
2. Vidual Studio Codeの「フォルダーを開く」から先ほど作成したフォルダーを起動
3. フォルダ直下のターミナルに、「npm init --yes」を入力
4. さらにnpmパッケージのインストール「npm install express ejs」
5. ファイル更新時にサーバーが自動で更新できるようにするパッケージのインストール「npm install -g nodemon」
6. MySQLパッケージのインストール「npm install mysql」

「app.js」の中身

const express = require('express');
const mysql = require('mysql');

const app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '設定したパスワード',
  database: '使用したいデータベース名'
});

connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');//MySQLとの接続に成功
});

//以下app.getなどのルーティングを作成

app.listen(3000);

# MySQLの新規データベースの作り方
1. 「管理者」としてターミナルを立ち上げて、「net start mysql57」でMySQLを起動
2. MySQLにログイン「mysql --user=root --password」
3. （※最初だけ）データベースの作成→「CREATE DATABASE データベース名;」
4. データベースの選択→「USE データベース名;」
5. （※最初だけ）テーブルの作成→「CREATE TABLE テーブル名 (id INT AUTO_INCREMENT, name TEXT, PRIMARY KEY (id)) DEFAULT CHARSET=utf8;」（idは固定であった方が便利、nameの部分から好きなカラムを指定）
6. テーブルを編集
7. 「exit」でログアウト
8. 「net stop mysql57」でMySQLを終了

参考(SQL早見表)
1. データベース一覧の表示→「SHOW databases;」
2. テーブル一覧の表示→「SHOW tables;」
3. テーブル構造の表示→「DESCRIBE テーブル名;」
4. テーブルのデータ取得→「SELECT * FROM テーブル名;」
5. テーブルへのデータ挿入→「INSERT INTO テーブル名(カラム) VALUES ('挿入する値');」
6. テーブルの削除→「DROP TABLE テーブル名;」
7. データベースの削除→「DROP DATABASE データベース名;」
8. カラムの追加→「ALTER TABLE テーブル名 ADD COLUMN 追加するカラム名 INT;」
9. テーブルのデータの更新→「UPDATE テーブル名 SET カラム名 = 新しい値 WHERE id = 変更するレコードid;」
10. カラム名の変更→「ALTER TABLE テーブル名 CHANGE COLUMN 旧カラム名 新カラム名 INT;」
11. カラムの削除→「ALTER TABLE テーブル名 DROP COLUMN カラム名;」
