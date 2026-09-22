with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("<</text>", "</text>")
content = content.replace("<<</text>", "</text>")
content = content.replace("{{ selectedRoles.length </text>", "{{ selectedRoles.length }}</text>")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("<</text>", "</text>")
content = content.replace("<<</text>", "</text>")
content = content.replace("<</view>", "</view>")

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
    f.write(content)
