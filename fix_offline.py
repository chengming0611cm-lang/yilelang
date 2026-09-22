with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('(离线)', '()')
content = content.replace('<text v-if="p.offline" style="color: #e74c3c; font-size: 24rpx; margin-left: 10rpx; font-weight: bold;">()</text>', '<text v-if="p.offline" style="color: #e74c3c; font-size: 24rpx; margin-left: 10rpx; font-weight: bold;">(离线)</text>')

# fix otherPlayers to sort
content = content.replace(
    "return players.value.filter(p => p.sessionId !== sessionId.value);",
    "return players.value.filter(p => p.sessionId !== sessionId.value).sort((a,b) => a.seatNumber - b.seatNumber).map(p => ({...p, displayName: [号] }));"
)
# change range-key="nickname" to range-key="displayName"
content = content.replace('range-key="nickname"', 'range-key="displayName"')

with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
    f.write(content)
