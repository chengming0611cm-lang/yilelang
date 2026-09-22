import re
with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'("[^"\n]+?\?\?)\);', r'\1");', content)

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
