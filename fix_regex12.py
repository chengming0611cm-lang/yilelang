with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("// 处理并弹窗显示技能结??      if (res.seenRole) {", "// 处理并弹窗显示技能结??\n      if (res.seenRole) {")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
