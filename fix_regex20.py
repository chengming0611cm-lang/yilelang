import re
with open('D:/AI/cunchu/za/one/frontend/src/components/ShareQrcodeModal.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'[^<]{1,5}/view>', '</view>', content)
content = re.sub(r'[^<]{1,5}/text>', '</text>', content)

with open('D:/AI/cunchu/za/one/frontend/src/components/ShareQrcodeModal.vue', 'w', encoding='utf-8') as f:
    f.write(content)
