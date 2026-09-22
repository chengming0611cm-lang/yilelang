with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('@click="showRoleGuide = fals<</text>', '@click="showRoleGuide = false">✕</text>')
content = content.replace('角色图鉴<</text>', '角色图鉴</text>')

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
