with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("退出房??/text>", "退出房间</text>")
content = content.replace("点击邀??</text>", "点击邀请)</text>")
content = content.replace("??/label>", "</label>")
content = content.replace("??/button>", "</button>")
content = content.replace("??</text>", "</text>")
content = content.replace("??/view>", "</view>")

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("??/text>", "</text>")
content = content.replace("??</text>", "</text>")
content = content.replace("??/view>", "</view>")
content = content.replace("??</view>", "</view>")

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
    f.write(content)
