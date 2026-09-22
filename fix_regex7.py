with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("mason: '共济??,", "mason: '共济会',")
content = content.replace("seer: '预言??,", "seer: '预言家',")
content = content.replace("troublemaker: '捣蛋??,", "troublemaker: '捣蛋鬼',")
content = content.replace("insomniac: '失眠??,", "insomniac: '失眠者',")
content = content.replace("loyal: '亚瑟的忠??,", "loyal: '亚瑟的忠臣',")
content = content.replace("morgana: '莫甘??,", "morgana: '莫甘娜',")
content = content.replace("oberon: '奥伯??,", "oberon: '奥伯伦',")
content = content.replace("minion: '莫德雷德的爪??", "minion: '莫德雷德的爪牙'")
content = content.replace("minion: '莫德雷德的爪牙'\n", "minion: '莫德雷德的爪牙'\n")
content = content.replace("'莫德雷德的爪??", "'莫德雷德的爪牙'")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
