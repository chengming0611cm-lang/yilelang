with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("你看到中央的两张牌是??{ROLE_NAMES[res.seenRoles[0]]} ??", "你看到中央的两张牌是： 和 ")
content = content.replace("你换回的新底牌是??{ROLE_NAMES[res.newRole]}", "你换回的新底牌是：")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
