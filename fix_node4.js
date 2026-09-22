import re
with open('D:/AI/cunchu/za/one/frontend/src/components/ShareQrcodeModal.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"('[^'\n]+?\?),", r"\1',", content)
content = content.replace("','", "',")
content = content.replace("',\n", "',\n")
content = content.replace("''\n", "'\n")

with open('D:/AI/cunchu/za/one/frontend/src/components/ShareQrcodeModal.vue', 'w', encoding='utf-8') as f:
    f.write(content)
