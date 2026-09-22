with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<view class="loader m</view>', '<view class="loader mt"></view>')
content = content.replace('<view class="loader mt</view>', '<view class="loader mt"></view>')
content = content.replace('<text class="sub-title mt</text>', '<text class="sub-title mt"></text>')

with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
    f.write(content)
