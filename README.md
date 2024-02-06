# Data Agent

Data Agent 是一个 Discord Bot，它被设计于以下特定场景与功能，暂无进一步添加功能的计划，请酌情使用

1. 拥有多份来自不同供应商的产品报价excel，这些excel拥有相同的字段格式
2. 产品的图片独立于excel文件外，其路径与文件名严格遵循命名规则
3. Data Agent向Discord频道添加指令，用户可在频道中通过指令传入筛选条件
4. 内置静态规则，根据不同指令利用不同规则检索数据
5. 根据规则，生成响应的文本或文件，发送到Discord频道中

# 当前规则

### 1. 根据预算（总价）、品类，生成套餐

1. 套餐中商品每种数量为1
2. 品类是可选的，默认从所有SKU中筛选
3. 生成规则可选，暂设默认唯一规则：
   1. 最接近预算
   2. 同预算下，取SKU最少的方案
   3. 同预算同SKU下，取随机一个方案
4. 根据筛选结果，生成3个文件：`内部报价.xlsx`，`报价.xlsx`，`名录.ppt`
5. 将结果：`"无满足条件的方案"` 或 生成的文件，通过`reply`指令，回复给用户

# Discord 配置

1. 前往 [Discord Developer Portal - My applications](https://discord.com/developers/applications?new_application=true)，创建一个 Application，例如`Data Agent`
2. 在`Portal`里，点击进入`Bot`页面，进行如下配置
   1. 关闭`PUBLIC BOT`选项
   2. 打开`MESSAGE CONTENT INTENT`选项
3. 在`Portal`里，点击进入`OAuth2`-`URL Generator`页面
   1. 在`SCOPES`中，勾选`applications.commands`、`bot`
   2. 在`BOT PERMISSIONS`中，勾选`Send Messages`、`Attach Files`
   3. 复制`GENERATED URL`中的链接，在浏览器中打开
   4. 在打开的授权页面中，将机器人加入到想要的Discord服务器
