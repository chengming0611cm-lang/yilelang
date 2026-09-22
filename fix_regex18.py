import re
with open('D:/AI/cunchu/za/one/frontend/src/rolesDictionary.js', 'r', encoding='utf-8') as f:
    content = f.read()

# For lines that have a single quote opened, and end with a comma but no closing quote before the comma
content = re.sub(r"('[^'\n]+?),$", r"\1',", content, flags=re.MULTILINE)
content = re.sub(r"('[^'\n]+?)$", r"\1'", content, flags=re.MULTILINE)

with open('D:/AI/cunchu/za/one/frontend/src/rolesDictionary.js', 'w', encoding='utf-8') as f:
    f.write(content)
