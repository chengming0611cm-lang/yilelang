with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r"currentQuestSize\} .*?\)\;", r"currentQuestSize} 人`, icon: 'none' });", content)

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
    f.write(content)
