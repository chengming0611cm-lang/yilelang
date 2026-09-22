import re
with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# find all places where a single quote is opened, some chars, then ??, then no closing quote before end of line
# e.g., '音频初始化失??, e
content = re.sub(r"('[^'\n]+?\?\?),", r"\1',", content)
content = re.sub(r"('[^'\n]+?\?\?)\)", r"\1')", content)
content = re.sub(r"('[^'\n]+?\?\?)\}", r"\1'}", content)
content = re.sub(r"('[^'\n]+?\?\?)$", r"\1'", content, flags=re.MULTILINE)

content = content.replace("uni.showToast({ title: '语音播报不支??, icon: 'none'", "uni.showToast({ title: '语音播报不支持', icon: 'none'")
content = content.replace("title: audioCtx.state === 'running' ? '音效已开?? : '音效（需手动点击??,", "title: audioCtx.state === 'running' ? '音效已开' : '音效（需手动点击',")
content = content.replace("uni.showToast({ title: '昵称不能为空??, icon: 'none'", "uni.showToast({ title: '昵称不能为空', icon: 'none'")
content = content.replace("uni.showToast({ title: '角色选择数量与配置不符??, icon: 'none'", "uni.showToast({ title: '角色选择数量与配置不符', icon: 'none'")
content = content.replace("title: '游戏结束??,", "title: '游戏结束',")
content = content.replace("uni.showToast({ title: '不能选择两名相同玩??, icon: 'none'", "uni.showToast({ title: '不能选择两名相同玩家', icon: 'none'")
content = content.replace("uni.showToast({ title: '操作已提??, icon: 'success'", "uni.showToast({ title: '操作已提交', icon: 'success'")
content = content.replace("uni.showToast({ title: '投票已提??, icon: 'success'", "uni.showToast({ title: '投票已提交', icon: 'success'")
content = content.replace("v.name.includes('??)", "v.name.includes('Yun')")

# AvalonGameView
with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='utf-8') as f:
    aval = f.read()

aval = re.sub(r"('[^'\n]+?\?\?),", r"\1',", aval)
aval = re.sub(r"('[^'\n]+?\?\?)\)", r"\1')", aval)
aval = re.sub(r"('[^'\n]+?\?\?)\}", r"\1'}", aval)
aval = aval.replace("waiting: '等待??,", "waiting: '等待',")

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
    f.write(aval)

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
