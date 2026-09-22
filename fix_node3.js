import re
with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# match string starting with ' and having some non-quote chars, then ending with a comma, but no closing quote
content = re.sub(r"('[^'\n]+?),$", r"\1',", content, flags=re.MULTILINE)
content = content.replace("','", "',")
content = content.replace("',\n", "',\n")
content = content.replace("''\n", "'\n")

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
    f.write(content)
