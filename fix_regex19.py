with open('D:/AI/cunchu/za/one/frontend/src/rolesDictionary.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("','", "',")
content = content.replace("',\n", "',\n")
content = content.replace("''\n", "'\n")
content = content.replace("銆?,", "銆?',")

with open('D:/AI/cunchu/za/one/frontend/src/rolesDictionary.js', 'w', encoding='utf-8') as f:
    f.write(content)
