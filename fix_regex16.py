with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("{{ avalonState.isQuestSuccess ? '鏈娆′换鍔℃垚鍔燂? : '鏈娆′换鍔″け璐ワ? }}", "{{ avalonState.isQuestSuccess ? '本次任务成功' : '本次任务失败' }}")

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
    f.write(content)
