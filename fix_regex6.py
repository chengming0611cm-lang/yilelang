with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("gameName=\"gameType === 'onuw' ? '一夜终极狼?? : '阿瓦??\"", "gameName=\"gameType === 'onuw' ? '一夜终极狼人' : '阿瓦隆'\"")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
