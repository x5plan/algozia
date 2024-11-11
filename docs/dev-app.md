# APP 开发指南

当前默认你已经位于 `algozia` 目录下。

## 进入目录并安装依赖

```sh
cd app
nvm install # 安装 Node.js 仅第一次需要，之后跳过这一步。
nvm use # 使用 .nvmrc 对应版本的 Node.js
yarn install # 安装依赖
```

## 配置

复制 `config-example.yaml` 为 `config.yaml`。

编辑 `config.yaml`。

TODO

## 以开发模式运行

```
yarn start:dev
```

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
