with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("title: audioCtx.state === 'running' ? '音效已开?? : '请调高手机音??',", "title: audioCtx.state === 'running' ? '音效已开' : '请调高手机音量',")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
