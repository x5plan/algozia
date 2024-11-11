# 准备环境

## 系统要求

- MacOS
- Windows x64
- Linux x64

## 安装依赖软件

### MacOS

以下内容默认你使用的 shell 是 `zsh`（你可以使用命令 `echo $SHELL`）确认它。

参照 <https://brew.sh/> 安装 Homebrew，以下教程均预设终端内可以使用命令 `brew`。

1. 安装 [Visual Studio Code](https://code.visualstudio.com/)

   ```sh
   brew install --cask visual-studio-code
   ```

2. 安装 NVM

   如果你已经使用 `brew` 安装了 Node.js 请先卸载。

   ```sh
   brew install nvm
   ```

   安装完成后你会看到屏幕上有如下输出（Apple 芯片）：

   ```
   Add the following to your shell profile e.g. ~/.profile or ~/.zshrc:
   export NVM_DIR="$HOME/.nvm"
   [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm
   [ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion
   ```

   或 （Intel 芯片）：

   ```
   Add the following to your shell profile e.g. ~/.profile or ~/.zshrc:
   export NVM_DIR="$HOME/.nvm"
   [ -s "/usr/local/opt/nvm/nvm.sh" ] && \. "/usr/local/opt/nvm/nvm.sh"  # This loads nvm
   [ -s "/usr/local/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/usr/local/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion
   ```

   请把上述内容从 `Add the following to your shell profile e.g. ~/.profile or ~/.zshrc:` 之后（不包含）的部分追加到文件 `~/.zprofile` 的开头。

   如果你在上一步已经成功安装 Visual Studio Code 你可以使用命令 `code ~/.zprofile` 打开并编辑它。

3. 安装 [Yarn](https://yarnpkg.com/)

   ```sh
   brew install yarn
   ```

   教程习惯用 `brew`，如果你偏好使用 `npm i -g yarn` 安装 Yarn，请暂时跳过这一步，并在后续合适的时机安装。

### Windows

TODO...

## 配置 Git 和 Auth

### 为 Git 设置默认的 Commit 用户和邮箱

如果你之前做过这些，请跳过。

```sh
git config --global user.name "<你的名字>"
git config --global user.email "<你的邮箱>"
```

以下是一个例子：

```sh
git config --global user.name "Alice"
git config --global user.email "alice@example.com"
```

### 生成并上传 SSH Key 到 Github

如果你之前做过这些，请跳过。

```sh
ssh-keygen -t ed25519 -C "<你的邮箱>"
```

一路回车，直到输出

```
Your identification has been saved in <私钥路径>
Your public key has been saved in <公钥路径>
```

请使用任意文本编辑器打开 `<公钥路径>`，并复制下来。

打开 <https://github.com/settings/ssh/new>，如需登录请先登录。将你复制下来的内容粘贴到 Key 的位置，Title 可以随便写，但推荐写个有意义的标识。

点击 <kbd>Add SSH key</kbd> 保存。

在终端内输入 `ssh -T git@github.com`，得到以下内容说明配置成功。

```
Hi <你的用户名>! You've successfully authenticated, but GitHub does not provide shell access.
```

## 索取权限

如果你是 X5Plan 内的用户，请给 [antares.mi@outlook.com](mailto:antares.mi@outlook.com) 发邮件索取权限。否则你应该 Fork 到你自己的账号下。

## 克隆远程仓库

选择一个你本地合适的目录下，执行以下内容：

```sh
git clone git@github.com:x5plan/algozia.git
```

如果你 Fork 到了自己的账号下，你应该使用你自己 Repo 的 URL

## 进入 Git Repo 目录下并使用 Code 打开 Workspace

```sh
cd algozia
code workspace.code-workspace
```

## 下一步

- [APP 开发指南](./dev-app.md)
- [CDN 开发指南](./dev-cdn.md)
