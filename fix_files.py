import re

def fix_index():
    with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'r', encoding='gbk', errors='ignore') as f:
        content = f.read()

    # 1. Add PlayerAvatar import
    if 'import PlayerAvatar from' not in content:
        content = content.replace("import { ref, computed, watch, onMounted, onUnmounted } from 'vue';", "import { ref, computed, watch, onMounted, onUnmounted } from 'vue';\nimport PlayerAvatar from '../../components/PlayerAvatar.vue';")

    # 2. Add sortedPlayers computed
    if 'const sortedPlayers = computed' not in content:
        content = content.replace("const players = ref([]);", "const players = ref([]);\nconst sortedPlayers = computed(() => [...players.value].sort((a, b) => a.seatNumber - b.seatNumber));")

    # 3. Replace v-for="p in players" with sortedPlayers
    content = content.replace('v-for="p in players"', 'v-for="p in sortedPlayers"')

    # 4. Replace player item text in LOBBY
    content = re.sub(r'\{\{\s*p\.nickname\s*\}\}', '<PlayerAvatar :nickname="p.nickname" :seatNumber="p.seatNumber" :offline="p.offline" />', content, count=1)

    # 5. Fix vote list display
    content = re.sub(r'<text>\?\?.*?\{\{\s*p\.nickname\s*\}\}</text>', '<PlayerAvatar :nickname="p.nickname" :seatNumber="p.seatNumber" :offline="p.offline" />', content)

    # 6. Add "You are player X" badge
    if '你是 {{ mySeatNumber }} 号玩家' not in content:
        badge = '''
    <view class="w-full flex justify-center mt-4" v-if="appState === 'PLAYING' || appState === 'NIGHT' || appState === 'DAY' || appState === 'VOTING'">
      <view class="bg-blue-600/30 border border-blue-500/50 rounded-full px-6 py-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] backdrop-blur-sm">
        <text class="text-white text-sm font-bold tracking-wide">🎯 你是 {{ mySeatNumber }} 号玩家</text>
      </view>
    </view>
    '''
        content = content.replace('<view class="header" v-if="appState !== \'LOBBY\'">', badge + '\n    <view class="header" v-if="appState !== \'LOBBY\'">')

    # 7. Add mySeatNumber computed
    if 'const mySeatNumber = computed' not in content:
        content = content.replace("const isHost = computed(", "const mySeatNumber = computed(() => {\n  const me = players.value.find(p => p.sessionId === sessionId.value);\n  return me ? me.seatNumber : '?';\n});\nconst isHost = computed(")

    # 8. Fix some obvious mojibake texts
    content = content.replace("Ͽڳ??..", "网络断开，正在尝试重连...")
    content = content.replace("?? {{ roomId }} (??", "房间号: {{ roomId }} (点击邀请)")
    content = content.replace("˳??/text>", "退出房间</text>")
    content = content.replace("?? ɫͼ", "📖 角色图鉴")
    content = content.replace("?? ߽ʾ", "💡 高阶提示")
    content = content.replace("?? {{ roomId }}", "房间号: {{ roomId }}")
    content = content.replace("б ({{ players.length }}??", "玩家列表 ({{ players.length }}人)")
    content = content.replace("(׼????", "(已准备)")
    content = content.replace("(δ׼??", "(未准备)")
    content = content.replace("()", "(离线)")
    content = content.replace("ǰѡϷ??/text>", "当前选择游戏:</text>")
    content = content.replace("һҹռ??/label>", "一夜终极狼人</label>")
    content = content.replace("??/label>", "阿瓦隆</label>")
    content = content.replace("?? Ϸ", "📜 游戏日志")
    content = content.replace("???̫", "☀️ 太阳升起，请自由讨论")
    content = content.replace("????ͶƱ׶", "🗳️ 投票阶段")
    content = content.replace("Ȩ", "弃权")

    with open('D:/AI/cunchu/za/one/frontend/src/pages/index/index.vue', 'w', encoding='utf-8') as f:
        f.write(content)

def fix_avalon():
    with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'r', encoding='gbk', errors='ignore') as f:
        content = f.read()

    # 1. Add PlayerAvatar import
    if 'import PlayerAvatar from' not in content:
        content = content.replace("import { ref, computed, watch } from 'vue';", "import { ref, computed, watch } from 'vue';\nimport PlayerAvatar from './PlayerAvatar.vue';")

    # 2. Replace avatar rendering in proposed team
    content = re.sub(
        r'<view class="avatar">\{\{\s*getPlayerName\(seat\)\.charAt\(0\)\s*\}\}</view>\s*<text class="name">\{\{\s*getPlayerName\(seat\)\s*\}\}</text>',
        '<PlayerAvatar :nickname="getPlayer(seat).nickname" :seatNumber="seat" :offline="getPlayer(seat).offline" />',
        content
    )

    # 3. Replace avatar rendering in vote list
    content = re.sub(
        r'<text class="vote-name">\{\{\s*getPlayerName\(Number\(seat\)\)\s*\}\}</text>',
        '<PlayerAvatar :nickname="getPlayer(Number(seat)).nickname" :seatNumber="Number(seat)" :offline="getPlayer(Number(seat)).offline" />',
        content
    )

    # 4. Replace other getPlayerName instances if possible or keep them.
    content = content.replace("getPlayerName(seat)", "getPlayerDisplayName(seat)")
    content = content.replace("getPlayerName(avalonState.leaderSeat)", "getPlayerDisplayName(avalonState.leaderSeat)")

    with open('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'w', encoding='utf-8') as f:
        f.write(content)

fix_index()
fix_avalon()
print("Done")
