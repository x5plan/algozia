# APP 开发指南

**注意：以下所有配置仅用于开发和测试，请勿用于生产环境！**

## 安装 Docker 和第三方依赖

为了降低入门门槛和避免弄脏你的电脑，开发教程中所有第三方依赖软件均使用 Docker 安装。

### 安装 Docker

1. MacOS

   ```sh
   brew install --cask docker
   ```

2. Windows
   TODO

### 安装 Redis

```sh
docker pull redis
docker run --name redis -p 6379:6379 -d redis
```

### 安装 MariaDB

```sh
docker pull mariadb
docker run --name mariadb -p 3306:3306 -e MARIADB_ROOT_PASSWORD=12345678 -d mariadb
```

### 安装 MySQL Client

- 对于 MacOS

  ```
  brew install mysql-client@8.4
  ```

  追加以下内容到 `~/.zprofile`

  ```sh
  export MYSQL_CLI_HOMEBREW=$(brew --prefix mysql-client@8.4)
  export PATH="$MYSQL_CLI_HOMEBREW/bin:$PATH"
  export LDFLAGS="-L$MYSQL_CLI_HOMEBREW/lib"
  export CPPFLAGS="-I$MYSQL_CLI_HOMEBREW/include"
  export PKG_CONFIG_PATH="$MYSQL_CLI_HOMEBREW/lib/pkgconfig"
  ```

  保存后执行

  ```sh
  source ~/.zprofile
  ```

- 对于 Windows

  TODO

### 新建数据库

执行

```sh
mysql -h127.0.0.1 -P3306 -uroot -p12345678
```

进入数据库，执行

```sql
CREATE DATABASE `algozia` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

完成后执行 `exit;` 退出。

### 安装并配置 MinIO

```sh
docker pull minio/minio
docker run --name minio -p 9000:9000 -p 9001:9001 -e MINIO_ROOT_USER=root -e MINIO_ROOT_PASSWORD=12345678 -d minio/minio server /data --console-address ":9001"
```

打开浏览器，访问 `http://127.0.0.1:9001`，使用 `root` 和 `12345678` 作为用户名和密码登录。

新建 Bucket `algozia` 和 `algozia-temp`。

创建一对新的 Access Key 和 Secret Key 并记录下来。

**注意，Access Key 和 Secret Key 仅显示一次，请确保你已经记录下它已备后续使用。**

## 构建一份本地 CDN

当前默认你已经位于 `algozia` 目录下。

```sh
cd cdn
nvm install # 安装 Node.js，仅第一次需要，之后跳过这一步。
nvm use # 使用 .nvmrc 对应版本的 Node.js
yarn install # 安装依赖
yarn bundle:prod
cd .. # 回到 algozia 下
```

## 进入目录并安装依赖包

当前默认你已经回到了 `algozia` 目录下。

```sh
cd app
nvm install # 仅第一次需要，之后跳过这一步。
nvm use
yarn install
```

## 配置

复制 `config-example.yaml` 为 `config.yaml`。

编辑 `config.yaml`，修改以下部分。以下未列出部分请保留默认值。

```yaml
database:
  hostname: 127.0.0.1
  port: 3306
  type: mariadb
  username: root
  password: "12345678"
  database: algozia

minio:
  endPoint: 127.0.0.1
  port: 9000
  useSSL: false
  accessKey: # 之前新建的 Access Key
  secretKey: # 之前新建的 Secret Key
  pathStyle: true
  region: us-east-1
  bucket:
    name: algozia
    publicUrl: # 留空
  tempBucket:
    name: algozia-temp
    publicUrl: # 留空

redis: redis://127.0.0.1:6379

security:
  sessionSecret: # 写一个随机字符串
  fileUploadSecret: # 写一个随机字符串

cdnUrl: # 留空
```

## 以开发模式运行

```
yarn start:dev
```

## 创建一个测试 Admin 用户

进入数据库执行以下 SQL

```sql
INSERT INTO `user` (`username`, `email`, `level`, `registration_time`) VALUES ('root', 'root@mail.test', '100', '2024-01-01 00:00:00')
INSERT INTO `auth` (`user_id`, `password`, `legacy_password`) VALUES ('2', '', 'c0d4cb00c32ca7fa00f2ddba49f1b512')
```

你创建了一个用户名 `root` 密码 `12345678` 的测试 Admin 用户。

## 做代码或任何内容的修改

此处会涉及一些简单的 `git` 操作，文档没有义务教会你如何使用 Git，以下内容默认你已经会了。

当然，以下内容均可以用任何 Git 图形化客户端操作。

### 新建分支

请务必在你自己的分支上操作。每一个次修改都务必重复以下内容创建新的分支。

```sh
git checkout main # 无论如何请都先回到 main 上
git pull # 请务必拉取最新的代码
git checkout users/<一个全小写纯字母的名字>/<给你的新分支起个简短名字>
```

### 添加/提交

当你改完代码后，你需要 Add/Commit 你的修改

```sh
git add <some files you changed>
git commit -m "<a short message for this commit>"
```

### 推送和 PR

你需要 push 你的修改到远程，并在 GitHub 开一个 Pull Request。

```sh
git push
```

打开 <https://github.com/x5plan/algozia/pulls> ，点击 <kbd>New pull request</kbd>。  
base 选 main ， compare 选你自己刚刚新建的分支。  
点击 <kbd>Create pull request</kbd>
