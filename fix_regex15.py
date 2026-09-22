with open('D:/AI/cunchu/za/one/frontend/src/rolesDictionary.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r"('[^'\n]+?\?\?),", r"\1',", content)
content = re.sub(r"('[^'\n]+?\?\?)\)", r"\1')", content)

with open('D:/AI/cunchu/za/one/frontend/src/rolesDictionary.js', 'w', encoding='utf-8') as f:
    f.write(content)
