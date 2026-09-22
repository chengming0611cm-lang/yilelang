with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("// 可以切换到一个等待其他人投票的状态，此处简化处??};", "// 可以切换到一个等待其他人投票的状态，此处简化处??\n};")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
