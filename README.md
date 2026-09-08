# CutPost 成片发布

把剪好的视频或图文，填进小红书创作者后台。**默认只填表，不点发布。** 你看过 Chrome 里的草稿，再点确认。

试用的人请先看 [试用说明.md](试用说明.md)。

发布引擎来自 [XiaohongshuSkills](https://github.com/white0dew/XiaohongshuSkills)。本仓库做了本地网页、登录检查、文案裁剪、预览优先。

## 试用怎么开

双击 `start.bat`。浏览器会打开 http://127.0.0.1:1780

需要：Windows、Python 3.10+、Google Chrome、你自己的小红书账号。

## 命令行

```powershell
python -m cutpost web
python -m cutpost web --no-browser
python -m cutpost login
python -m cutpost status
python -m cutpost preview --video .\final.mp4 --title "寻甸这一天" --content "正文" --tags "旅拍,vlog"
python -m cutpost confirm
```

## 注意

- 不是官方 API。平台改版后选择器可能失效。
- 确认发布会真实发出去。频率请自己控制。
- 不要把 `data/` 发给别人。
