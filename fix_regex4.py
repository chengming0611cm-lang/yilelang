with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("{{ allReady ? '开始游?? : '等待其他玩家准备...' }}", "{{ allReady ? '开始游戏' : '等待其他玩家准备...' }}")
content = content.replace("当前游戏：{{ gameType === 'onuw' ? '一夜终极狼?? : '阿瓦?? }}", "当前游戏：{{ gameType === 'onuw' ? '一夜终极狼人' : '阿瓦隆' }}")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
