// 角色图鉴数据字典
export const ROLES_DICTIONARY = {
  werewolf: {
    name: '狼人',
    image: '/static/cards/werewolf.png',
    spritePosition: '33.333% 0%',
    color: '#c0392b',
    camp: '狼人阵营',
    description: '每晚醒来，与同伴�躻�。�场上叜��友�，可查看两��张底牌�?',
    advancedTip: '高阶玩法：�果是孤狼，优先查看中変��昐�有�职；如果有狼队友，白天可互相打配合，但注意不要过于默契暴露身份�发�时可以假装��家或其他神职混淆视听'
  },

  minion: {
    name: '爉�',
    image: '/static/cards/minion.png',
    spritePosition: '100% 0%',
    color: '#8e44ad',
    camp: '狼人阵营',
    description: '每晚醒来，得知场上所有狼人的位置，但狼人不知道你的身份�?',
    advancedTip: '高阶玩法：你的任务是帊�狼人获胜。白天可以假跳�职为狼人背书，或故意引�好人投错票�即使你袊�死，�狼人活着就算胜利。注意不要过早暴露自己的爉�躻�'
  },

  mason: {
    name: '共济�?',
    image: '/static/cards/mason.png',
    spritePosition: '0% 33.333%',
    color: '#16a085',
    camp: '好人阵营',
    description: '每晚醒来，与另一名共济会�躻�。�果你昔��的共济会，则无同伴�?',
    advancedTip: '高阶玩法：与同伴提前约定暗号（�发言顺序、关锯�），白天通过暗号互相�。�果是单共济会，可以大胆报躻�占据发言主动权�小心�捣蛋鬼或强盗换牌后失去身份�?'
  },

  seer: {
    name: '预言�?',
    image: '/static/cards/seer.png',
    spritePosition: '66.666% 33.333%',
    color: '#2980b9',
    camp: '好人阵营',
    description: '每晚醒来，可以查看一名玩家的底牌，或查看两�两张底牌',
    advancedTip: '高阶玩法：验人优先�择发言取�的玩家；如果�势不明朗，查两�牌可以排除狼坑�白天报验人信息时，注意观察袪�玩�的反应，真狼会露出破绽�可以故意藏�手验人结果，后置发言打爆狼人'
  },

  robber: {
    name: '强盗',
    image: '/static/cards/robber.png',
    spritePosition: '100% 33.333%',
    color: '#d35400',
    camp: '好人阵营（可能变狼）',
    description: '每晚醒来，可以�择�名玩家交换底牌，并查看自己的新底牌�?',
    advancedTip: '高阶玩法：优先抢夺发�靠前的可疑玩家，如果抢到狼牌则转换阵营�白天可以直接报出抢夺�象和结果，也叻�隐藏躻�钓鱼执法。�果抢到狼牌，叻�反水帋�队或继续�好人'
  },

  troublemaker: {
    name: '捣蛋�?',
    image: '/static/cards/troublemaker.png',
    spritePosition: '0% 66.666%',
    color: '#e67e22',
    camp: '好人阵营',
    description: '每晚醒来，可以交捸�名其他玩家的底牌（不查看）�?',
    advancedTip: '高阶玩法：优先交换发�靠前的两名可疑玩家，制�混乱�白天可以晚�点报躻�，先吅�他人发言，�果有人报的身份和你换牌后矛盾，�明他在�谎�也叻�假�没换牌，观察场上反应'
  },

  drunk: {
    name: '酒�',
    image: '/static/cards/drunk.png',
    spritePosition: '33.333% 66.666%',
    color: '#95a5a6',
    camp: '好人阵营（可能变狼）',
    description: '每晚醒来，必须盲捸�夸�张底牌，不知道换到的新身份�?',
    advancedTip: '高阶玩法：白天坦白酒鬼身份和换牌位置，帮助其他玩家推理��果有预言家查两�牌，叻�对比信息排除狼坑。注意你參�换到狼牌，�根据场上信息判断臷�的新躻�'
  },

  insomniac: {
    name: '失眠�?',
    image: '/static/cards/insomniac.png',
    spritePosition: '66.666% 66.666%',
    color: '#34495e',
    camp: '好人阵营（可能�换成狼）',
    description: '在所有�间操作结束后醒来，查看自己最终的底牌（可能已袍�）�?',
    advancedTip: '高阶玩法：你拥有�准确的自躿�恂白天可以坦白失眠�身份和�终底牌，如果发现袍�牌，叻�反推昰�捺�你��果最终变成狼，可以�择继续�或反水帮狼队'
  },

  villager: {
    name: '平民',
    image: '/static/cards/villager.png',
    spritePosition: '100% 66.666%',
    color: '#7f8c8d',
    camp: '好人阵营',
    description: '没有特殊能力，�过逻辑推理和发�找出狼人',
    advancedTip: '高阶玩法：仔细听�有人的发�，�找�辑矛盾和可疑点。可以假装�职引诱狼人跳反，也可以低调发�避免成为狼人的反扑目标�投票时果断站队，不要弃权�?'
  },

  hunter: {
    name: '猎人',
    image: '/static/cards/hunter.png',
    spritePosition: '66.666% 100%',
    color: '#27ae60',
    camp: '好人阵营',
    description: '如果袊�票放逐，同时带走得票笺�高的玩�',
    advancedTip: '高阶玩法：白天�时报出猎人躻�震慑狼人，避免�集火。但也不要太早暴露，容易成为捣蛋鬼或强盗的目标��果确定�死，拉票给狼人同归于尽�?'
  },

  tanner: {
    name: '皌�',
    image: '/static/cards/tanner.png',
    spritePosition: '100% 100%',
    color: '#e74c3c',
    camp: '狫�阵营',
    description: '狫�阵营，只有自己�投�才能获胜',
    advancedTip: '高阶玩法：�度表现取�，但不能夘�显否则会袯�破�可以假跳�职后故意露出破绽，或制��辑矛盾引�刺�投你。注意不要演过火导致狼人也投你，要精准拉好人的票'
  },

  doppelganger: {
    name: '化身幽灵',
    image: '/static/cards/doppelganger.png',
    spritePosition: '0% 0%',
    color: '#bdc3c7',
    camp: '任意阵营',
    description: '选择�名玩家化躈�他的躻�',
    advancedTip: '高阶玩法：暂朮�装，但作为保留身份�?'
  }
};

// 角色阵营颜色映射
export const CAMP_COLORS = {
  '狼人阵营': '#c0392b',
  '好人阵营': '#2980b9',
  '好人阵营（可能变狼）': '#d35400',
  '正义阵营': '#3b82f6',
  '邁�阵营': '#ef4444',
  '好人阵营（可能�换成狼）': '#f39c12',
  '狫�阵营': '#8e44ad',
  '取决于�制的角色': '#9b59b6'
};

export const AVALON_ROLES_DICTIONARY = {
  merlin: {
    name: '梅林',
    spritePosition: '0% 20%',
    color: '#3b82f6',
    camp: '正义阵营',
    description: '能看见邪恶阵营（除了莾�雷德），但必须隐藏好臷�，因为一旦�刺�猜中躻�，�义阵营立刻判负�?',
    advancedTip: '高阶提示：�过投票行为暗示其他正义玩�，但绝不能表现得全知全能'
  },
  percival: {
    name: '派西维尔',
    spritePosition: '33.333% 20%',
    color: '#60a5fa',
    camp: '正义阵营',
    description: '能看见�林和莔�娜，但无法区分谁昰�',
    advancedTip: '高阶提示：你�要�过观察两人的发�和投票�为来分辨真假梅林，并为真正的梅林打掩护�?'
  },
  loyal: {
    name: '亚瑟的忠�?',
    spritePosition: '66.666% 20%',
    color: '#93c5fd',
    camp: '正义阵营',
    description: '晚的正义阵营成员，没有任何特殊信�?',
    advancedTip: '高阶提示：你的任务是通过逻辑和投票找出队友，同时不�给�林添乱，必�时可以假装自己是有身份的人来挡刀'
  },
  morgana: {
    name: '莔��?',
    spritePosition: '0% 100%',
    color: '#ef4444',
    camp: '邁�阵营',
    description: '在派西维尔的视野丼�显示为�林，任务昿�惑派西维尔�?',
    advancedTip: '高阶提示：你�要表现得像一�在指挥的正义神职，�导派西维尔信任你，从而破坏任务�?'
  },
  assassin: {
    name: '刺�',
    spritePosition: '33.333% 100%',
    color: '#b91c1c',
    camp: '邁�阵营',
    description: '如果在发车阶段邪恶阵营失败，你有�后一次机会�过刺杀梅林来翻盘�?',
    advancedTip: '高阶提示：在游戏主�细�察谁像是知道�有信恚�梅林，谁又像昌��的派西维尔�?'
  },
  oberon: {
    name: '奥伯�?',
    spritePosition: '66.666% 100%',
    color: '#7f1d1d',
    camp: '邁�阵营',
    description: '对邪恶阵营不�，你也不知道谁是你的邁�同伴',
    advancedTip: '高阶提示：由于没有任何信恼�你很容易袽�成好人，但也參�袘�友�投�尽量制造混乱�?'
  },
  mordred: {
    name: '莾�雷德',
    spritePosition: '100% 100%',
    color: '#450a0a',
    camp: '邁�阵营',
    description: '对�林隐躼�梅林不知道你的存在�?',
    advancedTip: '高阶提示：因为�林看不�你，你可以大胆伪装成正义阵营，甚至带头冲锋�?'
  },
  minion: {
    name: '莾�雷德的爪�?',
    spritePosition: '100% 100%',
    color: '#dc2626',
    camp: '邁�阵营',
    description: '晚的邁�阵营成员，知道谁昘�友�?',
    advancedTip: '高阶提示：尽职尽责地破坏任务并掩护重要的邁�神职'
  }
};
