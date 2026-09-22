with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("avalonState.value.proposedTeam = []; // 清空之前的提??    }", "avalonState.value.proposedTeam = []; // 清空之前的提??\n    }")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
