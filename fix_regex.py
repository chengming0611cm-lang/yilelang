with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Replace anything that looks like a broken closing tag
content = re.sub(r'[^<]{1,5}/text>', '</text>', content)
content = re.sub(r'[^<]{1,5}/view>', '</view>', content)
content = re.sub(r'[^<]{1,5}/button>', '</button>', content)
content = re.sub(r'[^<]{1,5}/label>', '</label>', content)
content = re.sub(r'[^<]{1,5}text>', '</text>', content)

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'[^<]{1,5}/text>', '</text>', content)
content = re.sub(r'[^<]{1,5}/view>', '</view>', content)
content = re.sub(r'[^<]{1,5}/button>', '</button>', content)
content = re.sub(r'[^<]{1,5}text>', '</text>', content)

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
    f.write(content)
