import re
with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("浜篳, icon:", "浜篳\, icon:")

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
    f.write(content)
